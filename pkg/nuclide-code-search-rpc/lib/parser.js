'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PARSE_REGEXES = undefined;
exports.parseProcessLine = parseProcessLine;
exports.parseVcsGrepLine = parseVcsGrepLine;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PARSE_REGEXES = exports.PARSE_REGEXES = Object.freeze({
  rg: /^(.+)\0(\d+)[:-](.*)$/,
  ack: /^(.+)[:-](\d+)[:-](.*)$/,
  grep: /^(.+)\0(\d+)[:-](.*)$/,
  vcsGrep: /^(.+):(\d+):(.*)$/
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

function parseProcessLine(event, tool) {
  const parseRegex = PARSE_REGEXES[tool];
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(parseRegex);
    if (matches != null && matches.length === 4) {
      const [file, row, line] = matches.slice(1);
      return _rxjsBundlesRxMinJs.Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        line
      });
    }
  }
  return _rxjsBundlesRxMinJs.Observable.empty();
}

function parseVcsGrepLine(event, cwd, regex) {
  // Note: the vcs-grep searches return paths rooted from their cwd,
  // so join the paths to make them absolute.
  return parseProcessLine(event, 'vcsGrep').map(result => Object.assign({}, result, {
    file: (_nuclideUri || _load_nuclideUri()).default.isAbsolute(result.file) ? result.file : (_nuclideUri || _load_nuclideUri()).default.join(cwd, result.file)
  }));
}