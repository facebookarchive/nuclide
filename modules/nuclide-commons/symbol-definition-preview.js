'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.getDefinitionPreview = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let getDefinitionPreview = exports.getDefinitionPreview = (() => {var _ref = (0, _asyncToGenerator.default)(





























  function* (
  definition)




  {
    // ensure filesize not too big before reading in whole file
    const stats = yield (_fsPromise || _load_fsPromise()).default.stat(definition.path);
    if (stats.size > MAX_FILESIZE) {
      return null;
    }

    // if file is image, return base-64 encoded contents
    const fileBuffer = yield (_fsPromise || _load_fsPromise()).default.readFile(definition.path);

    const mime =
    (_mimeTypes || _load_mimeTypes()).default.contentType((_nuclideUri || _load_nuclideUri()).default.extname(definition.path)) || 'text/plain';
    if (mime.startsWith('image/')) {
      return { mime, contents: fileBuffer.toString('base64'), encoding: 'base64' };
    }

    const contents = fileBuffer.toString('utf8');
    const lines = contents.split('\n');

    const start = definition.position.row;
    const initialIndentLevel = getIndentLevel(lines[start]);

    const buffer = [];
    for (
    let i = start,
    openParenCount = 0,
    closedParenCount = 0,
    openCurlyCount = 0,
    closedCurlyCount = 0;
    i < start + MAX_PREVIEW_LINES && i < lines.length;
    i++)
    {
      const line = lines[i];
      const indentLevel = getIndentLevel(line);
      openParenCount += (0, (_string || _load_string()).countOccurrences)(line, '(');
      closedParenCount += (0, (_string || _load_string()).countOccurrences)(line, ')');
      openCurlyCount += (0, (_string || _load_string()).countOccurrences)(line, '{');
      closedCurlyCount += (0, (_string || _load_string()).countOccurrences)(line, '}');

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
        } else if (
        // end of a property definition
        line.trim().endsWith(',') &&
        // including complex types as values
        openCurlyCount === closedCurlyCount &&
        // but still not before function signatures are closed
        openParenCount === closedParenCount)
        {
          break;
        }
      }
    }

    return { mime, contents: buffer.join('\n'), encoding: 'utf8' };
  });return function getDefinitionPreview(_x) {return _ref.apply(this, arguments);};})();var _mimeTypes;function _load_mimeTypes() {return _mimeTypes = _interopRequireDefault(require('mime-types'));}var _fsPromise;function _load_fsPromise() {return _fsPromise = _interopRequireDefault(require('./fsPromise'));}var _string;function _load_string() {return _string = require('./string');}var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('./nuclideUri'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}const MAX_PREVIEW_LINES = 10; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */const MAX_FILESIZE = 100000;const WHITESPACE_REGEX = /^\s*/;function getIndentLevel(line) {return WHITESPACE_REGEX.exec(line)[0].length;}