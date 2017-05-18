'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _chalk;

function _load_chalk() {
  return _chalk = _interopRequireDefault(require('chalk'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const ctx = new (_chalk || _load_chalk()).default.constructor({ enabled: true });
    const out = Object.keys(process.versions).map(function (key) {
      return [key, process.versions[key]];
    }).concat([['atom', atom.getVersion()]]).map(function ([name, version]) {
      return `${ctx.yellow(name)}=${ctx.green(version)}`;
    }).sort().join('\n');
    console.log(out);
    return 0;
  });

  function runCommand() {
    return _ref.apply(this, arguments);
  }

  return runCommand;
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

/* eslint-disable no-console */