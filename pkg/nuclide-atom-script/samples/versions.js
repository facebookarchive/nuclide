"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _chalk() {
  const data = _interopRequireDefault(require("chalk"));

  _chalk = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
var runCommand = async function runCommand() {
  const ctx = new (_chalk().default.constructor)({
    enabled: true
  });
  const out = Object.keys(process.versions).map(key => [key, process.versions[key]]).concat([['atom', atom.getVersion()]]).map(([name, version]) => `${ctx.yellow(name)}=${ctx.green(version)}`).sort().join('\n');
  console.log(out);
  return 0;
};

exports.default = runCommand;