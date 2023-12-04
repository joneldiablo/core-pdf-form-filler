const { PDFDocument } = require('pdf-lib');

module.exports = async ({ inputFile }) => {
  try {
    const pdfDoc = await PDFDocument.load(inputFile);
    // Extract and display field names
    const form = pdfDoc.getForm();
    const fieldNames = form.getFields().map((field) => field.getName());
    return { success: true, error: false, data: fieldNames };
  } catch (error) {
    return { success: false, error: true, data: error };
  }
}