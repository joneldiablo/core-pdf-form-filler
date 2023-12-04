const normalize = (str) => (str || '').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const slugify = (str = '') => normalize(str)
  .replace(/\s/g, '-').replace(/[^a-zA-Z\d\-]+/g, '')
  .replace(/-+/g, '-');

module.exports = {
  normalize,
  slugify
}