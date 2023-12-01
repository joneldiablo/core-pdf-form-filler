const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { slugify } = require('./strings');
const path = require('path');

const checkTypes = (field) => {
  if (field instanceof form.constructor.CheckBoxField) {
    console.log('Es un campo de casilla de verificación');
  } else if (field instanceof form.constructor.ComboBoxField) {
    console.log('Es un campo de cuadro combinado');
  } else if (field instanceof form.constructor.ButtonField) {
    console.log('Es un campo de botón');
  } else if (field instanceof form.constructor.RadioButtonField) {
    console.log('Es un campo de botón de radio');
  } else if (field instanceof form.constructor.SignatureField) {
    console.log('Es un campo de firma');
  } else if (field instanceof form.constructor.TextField) {
    console.log('Es un campo de texto');
  } else {
    console.log('Tipo de campo desconocido');
  }
}

module.exports = async ({ inputFile, data: dataRaw, dataFile, columnFileName, output }) => {
  try {
    const pdfBytes = await fs.promises.readFile(inputFile);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Read data from JSON file
    const data = dataRaw || JSON.parse(await fs.promises.readFile(dataFile, 'utf-8'));

    // Fill the fields in the PDF
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const processing = async (row, i) => {
      try {
        fields.forEach((field) => {
          const fieldName = field.getName();
          if ([undefined, null].includes(row[fieldName])) return;
          switch (field.constructor.name) {
            case 'PDFTextField':
              field.setText(row[fieldName]);
              break;
            case 'PDFCheckBox':
              const value = typeof row[fieldName] === 'string' ? row[fieldName].toLowerCase() : row[fieldName];
              const check = ['true', true, 1, 'sí', 'si', 'yes', 'check'].includes(value) ? true :
                ['false', false, 0, 'no', 'not', 'uncheck', ''].includes(value) ? false : !!row[fieldName]
              if (check) field.check();
              else field.uncheck();
              break;
            case 'PDFRadioGroup':
              field.select(row[fieldName]);
              break;
            case 'PDFOptionList':
              field.select(
                Array.isArray(row[fieldName])
                  ? row[fieldName]
                  : row[fieldName].split(',')
              );
              break;
            default:
              break;
          }
        });

        // Save the filled PDF
        const filledPdfBytes = await pdfDoc.save();

        //filename
        let pdfName = `${((i + 1) + '').padStart(3, '0')}`;
        if (columnFileName) pdfName += `-${slugify(row[columnFileName])}`;
        pdfName += '-' + inputFile.split('/').pop();
        if (output) {
          const out = path.join(output, pdfName);
          await fs.promises.writeFile(out, filledPdfBytes);
        }
        return { success: true, error: false, data: [pdfName, filledPdfBytes] };
      } catch (error) {
        return { success: false, error: true, data: error };
      }
    }

    const results = await Promise.all(
      (Array.isArray(data) ? data : [data]).map(processing)
    );

    return { success: true, error: false, data: results };
  } catch (error) {
    return { success: false, error: true, data: error };
  }
}