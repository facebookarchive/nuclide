"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseProcessLine = parseProcessLine;
exports.parseVcsGrepLine = parseVcsGrepLine;
exports.PARSE_REGEXES = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
const PARSE_REGEXES = Object.freeze({
  rg: /^(.+)\0(\d+)[:-](.*)$/,
  ack: /^(.+)[:-](\d+)[:-](.*)$/,
  grep: /^(.+)\0(\d+)[:-](.*)$/,
  vcsGrep: /^(.+)[:-](\d+)[:-](.*)$/
});
exports.PARSE_REGEXES = PARSE_REGEXES;

function parseProcessLine(event, tool) {
  const parseRegex = PARSE_REGEXES[tool];

  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(parseRegex);

    if (matches != null && matches.length === 4) {
      const [file, row, line] = matches.slice(1);
      return _RxMin.Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        line
      });
    }
  }

  return _RxMin.Observable.empty();
}

function parseVcsGrepLine(event, cwd, regex) {
  // Note: the vcs-grep searches return paths rooted from their cwd,
  // so join the paths to make them absolute.
  return parseProcessLine(event, 'vcsGrep').map(result => Object.assign({}, result, {
    file: _nuclideUri().default.isAbsolute(result.file) ? result.file : _nuclideUri().default.join(cwd, result.file)
  }));
}