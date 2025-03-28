/**
 * app.js
 *
 * Spam Shield
 *
 */

const config = require('./config');

const path = require('path');
// const fs = require('fs');
const express = require('express');
// const helmet = require('helmet');
// const compression = require('compression');
// const bodyParser = require('body-parser');

const renderer = require('@headwall/qw-render');

const projectDir = path.dirname(__dirname);
console.log(`Project dir: ${projectDir}`);

renderer.setContentDir(path.join(projectDir, 'content'));
// renderer.applyThemeOverlay(path.join(projectDir, 'theme'));
renderer.addFilter('outputHtml', null, (content, params) => {
  const state = {};
  return content.replace('</head>', `<script>const ss=${JSON.stringify(state)};</script></head>`);
});

// const port = 3080;
const app = express();

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

/**
 * Unsecured content.
 */
//app.post('/api/v1/session/authenticate', sessionController.authenticate);
// app.get(['/login', /(assets|login)\/.*\.(css|js|svg)$/], (req, res) => {
//   renderer.sendFile(req, res);
// });

/**
 * Other files
 */
app.get([], (req, res) => {
  renderer.sendFile(req, res, null);
});

app.listen(config.server.port, () => {
  console.log(`Example app listening on port ${config.server.port}`);
});
