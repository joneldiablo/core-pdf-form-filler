#!/usr/bin/env node
/**
 * Script to read a PDF form and extract field names,
 * and create new PDFs with filled fields using a JSON file.
 */

const fs = require('fs');
const yargs = require('yargs');
const { PDFDocument, rgb } = require('pdf-lib');

const extractFields = require('./utils/extract-fields');
const fillFields = require('./utils/fill-fields');

const args = yargs
  .usage('Usage: $0 <command> [options]')
  .options({
    inputFile: { alias: 'i', demandOption: true, type: 'string', describe: 'Input PDF Form file' },
    output: { alias: 'o', demandOption: false, type: 'string', describe: 'Output PDF file' }
  })
  .command('extract', 'Extract field names from PDF')
  .command('fill', 'Fill PDF form fields using a JSON file', (yargs) => yargs
    .options({
      dataFile: { alias: 'f', demandOption: false, type: 'string', describe: 'JSON data file' },
      data: { alias: 'd', demandOption: false, type: 'string', describe: 'JSON data' },
      columnFileName: { alias: 'c', demandOption: false, type: 'string', describe: 'Column to name the new PDF file' },
    })
    .check((argv) => {
      if (!argv.data && !argv.dataFile) {
        throw new Error('You must provide either data or dataFile for the fill command.');
      }
      return true;
    })
  )
  .demandCommand(1, 'You must specify a command: extract or fill')
  .help().argv;

/**
 * Main function to process the PDF.
 * @param {object} args - Command line arguments.
 */
async function main(args) {
  switch (args._[0]) {
    case 'extract': {
      const { inputFile, output } = args;
      const conf = { inputFile, output };
      const res = await extractFields(conf);
      if (!res.success) throw res.data;
      return res.data;
    }
    case 'fill': {
      const { inputFile, dataFile, data, output, columnFileName } = args;
      const conf = {
        inputFile,
        data: data ? JSON.parse(data) : undefined,
        dataFile,
        columnFileName,
        output
      };
      const res = await fillFields(conf);
      if (!Array.isArray(res.data)) throw res.data;
      return res.data.reduce((rs, item) => {
        if (!item.success) {
          rs.error++;
          console.error(item.data);
        } else {
          rs.success++;
          rs.filesSuccess.push(item.data[0]);
        }
        return rs;
      }, { filesSuccess: [], success: 0, error: 0 });
    }
    default:
      throw new Error('Bad request ' + args._[0]);
  }
}

main(args)
  .then((res) => {
    console.log(res);
    process.exit();
  })
  .catch((err) => {
    console.error('Error', err);
    process.exit(err.code || 1);
  });
