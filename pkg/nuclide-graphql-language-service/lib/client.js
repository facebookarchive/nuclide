'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;

var _fs = _interopRequireDefault(require('fs'));

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

var _path = _interopRequireDefault(require('path'));

var _getDiagnostics;

function _load_getDiagnostics() {
  return _getDiagnostics = require('./interfaces/getDiagnostics');
}

var _getOutline;

function _load_getOutline() {
  return _getOutline = require('./interfaces/getOutline');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const GRAPHQL_SUCCESS_CODE = 0;
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri

const GRAPHQL_FAILURE_CODE = 1;

function main(command, argv) {
  const filePath = argv.file && argv.file.trim();
  const text = argv.text;
  const schemaPath = argv.schemaPath && argv.schemaPath.trim();
  let exitCode;
  switch (command) {
    case 'lint':
      exitCode = performLint(filePath, text, schemaPath);
      break;
    case 'outline':
      exitCode = performOutline(filePath, text);
      break;
  }

  process.exit(exitCode);
}

function parseSchema(schemaPath) {
  const buffer = _fs.default.readFileSync(schemaPath);
  return buffer.toString();
}

function generateSchema(schemaPath) {
  const schemaDSL = parseSchema(schemaPath);
  const schemaFileExt = _path.default.extname(schemaPath);
  switch (schemaFileExt) {
    case '.graphql':
      return (0, (_graphql || _load_graphql()).buildSchema)(schemaDSL);
    case '.json':
      return (0, (_graphql || _load_graphql()).buildClientSchema)(JSON.parse(schemaDSL));
    default:
      throw new Error('Unsupported schema file extention');
  }
}

function ensureText(filePath, queryText) {
  let text = queryText;
  // Always honor text argument over filePath.
  // If text isn't available, try reading from the filePath.
  if (!text) {
    if (!filePath) {
      throw new Error('A path to the GraphQL file or its contents is required.');
    }

    text = _fs.default.readFileSync(filePath, 'utf8');
  }
  return text;
}

function performLint(filePath, queryText, schemaPath) {
  try {
    const text = ensureText(filePath, queryText);

    const schema = schemaPath ? generateSchema(schemaPath) : null;
    const resultArray = (0, (_getDiagnostics || _load_getDiagnostics()).getDiagnostics)(filePath, text, schema);
    const resultObject = resultArray.reduce((prev, cur, index) => {
      prev[index] = cur;
      return prev;
    }, {});
    process.stdout.write(JSON.stringify(resultObject, null, 2));
    return GRAPHQL_SUCCESS_CODE;
  } catch (error) {
    process.stderr.write(error);
    return GRAPHQL_FAILURE_CODE;
  }
}

function performOutline(filePath, queryText) {
  try {
    const text = ensureText(filePath, queryText);
    const outline = (0, (_getOutline || _load_getOutline()).getOutline)(text);
    process.stdout.write(JSON.stringify(outline));
  } catch (error) {
    process.stderr.write(error);
    return GRAPHQL_FAILURE_CODE;
  }
  return GRAPHQL_SUCCESS_CODE;
}