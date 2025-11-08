const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Simple on-disk template cache. Clears only on process restart.
const cache = new Map();
const templatesDir = path.join(__dirname, '..', 'email-templates');

function getTemplatePath(name) {
  return path.join(templatesDir, `${name}.hbs`);
}

function compileTemplate(name) {
  const filePath = getTemplatePath(name);
  const source = fs.readFileSync(filePath, 'utf8');
  const template = Handlebars.compile(source, { noEscape: true });
  cache.set(name, template);
  return template;
}

function loadTemplate(name) {
  if (cache.has(name)) {
    return cache.get(name);
  }
  return compileTemplate(name);
}

module.exports = {
  /**
   * Render a named template with locals
   * @param {string} name - Template name (e.g., 'verify-email')
   * @param {object} locals - Locals to pass to the template
   * @returns {string} HTML string
   */
  render(name, locals) {
    const template = loadTemplate(name);
    return template(locals || {});
  },
  // for tests
  _clearCache() {
    cache.clear();
  }
};
