"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefinitionPreview = getDefinitionPreview;

function _mimeTypes() {
  const data = _interopRequireDefault(require("mime-types"));

  _mimeTypes = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("./fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("./string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("./nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const MAX_PREVIEW_LINES = 10;
const MAX_FILESIZE = 100000;
const WHITESPACE_REGEX = /^\s*/;

function getIndentLevel(line) {
  // $FlowFixMe (>= v0.75.0)
  const match = WHITESPACE_REGEX.exec(line);
  return match[0].length;
}

async function getDefinitionPreview(definition) {
  // ensure filesize not too big before reading in whole file
  const stats = await _fsPromise().default.stat(definition.path);

  if (stats.size > MAX_FILESIZE) {
    return null;
  } // if file is image, return base-64 encoded contents


  const fileBuffer = await _fsPromise().default.readFile(definition.path);
  const mime = _mimeTypes().default.contentType(_nuclideUri().default.extname(definition.path)) || 'text/plain';

  if (mime.startsWith('image/')) {
    return {
      mime,
      contents: fileBuffer.toString('base64'),
      encoding: 'base64'
    };
  }

  const contents = fileBuffer.toString('utf8');
  const lines = contents.split('\n');
  const start = definition.position.row;
  const initialIndentLevel = getIndentLevel(lines[start]);
  const buffer = [];

  for (let i = start, openParenCount = 0, closedParenCount = 0, openCurlyCount = 0, closedCurlyCount = 0; i < start + MAX_PREVIEW_LINES && i < lines.length; i++) {
    const line = lines[i];
    const indentLevel = getIndentLevel(line);
    openParenCount += (0, _string().countOccurrences)(line, '(');
    closedParenCount += (0, _string().countOccurrences)(line, ')');
    openCurlyCount += (0, _string().countOccurrences)(line, '{');
    closedCurlyCount += (0, _string().countOccurrences)(line, '}');
    buffer.push(line.substr(Math.min(indentLevel, initialIndentLevel))); // dedent
    // heuristic for the end of a function signature:

    if (indentLevel <= initialIndentLevel) {
      // we've returned back to the original indentation level
      if (openParenCount > 0 && openParenCount === closedParenCount) {
        // if we're in a fn definition, make sure we have balanced pairs of parens
        break;
      } else if (line.trim().endsWith(';')) {
        // c-style statement ending
        break;
      } else if ( // end of a property definition
      line.trim().endsWith(',') && // including complex types as values
      openCurlyCount === closedCurlyCount && // but still not before function signatures are closed
      openParenCount === closedParenCount) {
        break;
      }
    }
  }

  return {
    mime,
    contents: buffer.join('\n'),
    encoding: 'utf8'
  };
}