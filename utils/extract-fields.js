const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const path = require('path');

const { slugify } = require('./strings');

module.exports = async ({ inputFile, output }) => {
  try {
    const pdfBytes = await fs.promises.readFile(inputFile);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    // Extract and display field names
    const form = pdfDoc.getForm();
    const fieldNames = form.getFields().map((field) => field.getName());
    if (output) {
      const name = [
        'fields',
        slugify(inputFile.split('/').pop().replace('.pdf', ''))
      ].join('-');
      const out = path.join(output, name + '.json');
      await fs.promises.writeFile(out, JSON.stringify(fieldNames, null, 2));
    }
    return { success: true, error: false, data: fieldNames };
  } catch (error) {
    return { success: false, error: true, data: error };
  }
}