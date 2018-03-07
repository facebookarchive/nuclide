'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PARSE_REGEXES = undefined;
exports.parseAckRgLine = parseAckRgLine;
exports.parseGrepLine = parseGrepLine;
exports.parseVcsGrepLine = parseVcsGrepLine;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const PARSE_REGEXES = exports.PARSE_REGEXES = Object.freeze({
  rg: /^(.+)\0(\d+):(\d+):(.*)$/,
  ack: /^(.+):(\d+):(\d+):(.*)$/,
  grep: /^(.+)\0(\d+):(.*)$/,
  vcsGrep: /^(.+):(\d+):(.*)$/
});

function parseAckRgLine(event, regex, tool) {
  const parseRegex = PARSE_REGEXES[tool];
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(parseRegex);
    if (matches != null && matches.length === 5) {
      const [file, row, column, line] = matches.slice(1);
      const columnNumber = parseInt(column, 10) - 1;
      const match = regex.exec(line.slice(columnNumber));
      // match should not be null, but in some edge cases it might be.
      if (match == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const matchLength = match[0].length;
      // Remember to reset the regex!
      regex.lastIndex = 0;
      return _rxjsBundlesRxMinJs.Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        column: columnNumber,
        line,
        matchLength
      });
    }
  }
  return _rxjsBundlesRxMinJs.Observable.empty();
}

function parseGrepLine(event, regex, tool) {
  const parseRegex = PARSE_REGEXES[tool];
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(parseRegex);
    if (matches != null && matches.length === 4) {
      const [file, row, line] = matches.slice(1);
      // Grep does not have a --column option so we have to do our own.
      // Finding the first index is consistent with the other 'ack'-like tools.
      const match = regex.exec(line);
      // match should not be null, but in some edge cases it might be.
      if (match == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const column = match.index;
      const matchLength = match[0].length;
      // Then reset the regex for the next search.
      regex.lastIndex = 0;
      return _rxjsBundlesRxMinJs.Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        column,
        line,
        matchLength
      });
    }
  }
  return _rxjsBundlesRxMinJs.Observable.empty();
}

function parseVcsGrepLine(event, cwd, regex) {
  // Note: the vcs-grep searches return paths rooted from their cwd,
  // so join the paths to make them absolute.
  return parseGrepLine(event, regex, 'vcsGrep').map(result => Object.assign({}, result, {
    file: (_nuclideUri || _load_nuclideUri()).default.isAbsolute(result.file) ? result.file : (_nuclideUri || _load_nuclideUri()).default.join(cwd, result.file)
  }));
}