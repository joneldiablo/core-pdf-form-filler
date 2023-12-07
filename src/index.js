const extractFields = require('./extract-fields');
const fillFields = require('./fill-fields');
const strings = require('./strings');

module.exports = {
  default: {
    extractFields,
    fillFields,
    ...strings
  },
  extractFields,
  fillFields,
  ...strings
}