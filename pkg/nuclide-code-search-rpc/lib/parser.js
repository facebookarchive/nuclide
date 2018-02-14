'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseAgAckRgLine = parseAgAckRgLine;
exports.parseGrepLine = parseGrepLine;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ACK_PARSE_REGEX = /^(.+):(\d+):(\d+):(.*)$/; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    * @format
                                                    */

const GREP_PARSE_REGEX = /^(.+):(\d+):(.*)$/;

function parseAgAckRgLine(event) {
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(ACK_PARSE_REGEX);
    if (matches != null && matches.length === 5) {
      const [file, row, column, line] = matches.slice(1);
      return _rxjsBundlesRxMinJs.Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        column: parseInt(column, 10) - 1,
        line
      });
    }
  }
  return _rxjsBundlesRxMinJs.Observable.empty();
}

function parseGrepLine(event, cwd, regex) {
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(GREP_PARSE_REGEX);
    if (matches != null && matches.length === 4) {
      const [file, row, line] = matches.slice(1);
      // Grep does not have a --column option so we have to do our own.
      // Finding the first index is consistent with the other 'ack'-like tools.
      const match = regex.exec(line);
      // match cannot be null because grep used the regex to find this line.

      if (!(match != null)) {
        throw new Error('Invariant violation: "match != null"');
      }

      const column = match.index;
      // Then reset the regex for the next search.
      regex.lastIndex = 0;
      // Note: the vcs-grep searches return paths rooted from their cwd,
      // so join the paths to make them absolute.
      return _rxjsBundlesRxMinJs.Observable.of({
        file: (_nuclideUri || _load_nuclideUri()).default.isAbsolute(file) ? file : (_nuclideUri || _load_nuclideUri()).default.join(cwd, file),
        row: parseInt(row, 10) - 1,
        column,
        line
      });
    }
  }
  return _rxjsBundlesRxMinJs.Observable.empty();
}