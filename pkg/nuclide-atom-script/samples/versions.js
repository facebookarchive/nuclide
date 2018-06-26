'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk;

function _load_chalk() {
  return _chalk = _interopRequireDefault(require('chalk'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function runCommand() {
  const ctx = new (_chalk || _load_chalk()).default.constructor({ enabled: true });
  const out = Object.keys(process.versions).map(key => [key, process.versions[key]]).concat([['atom', atom.getVersion()]]).map(([name, version]) => `${ctx.yellow(name)}=${ctx.green(version)}`).sort().join('\n');
  console.log(out);
  return 0;
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    *  strict-local
    * @format
    */

/* eslint-disable no-console */