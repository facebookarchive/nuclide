"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = syncAtomCommands;

function _observable() {
  const data = require("../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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

/**
 * A utility that adds and removes commands to the Atom command registry based on their presence in
 * a stream. This is basically like a mini-React for Atom commands, however, instead of diffing the
 * result (commands), we diff the input (sets) since it's easier and less likely to contain
 * functions (which are unlikely to be able to be safely compared using `===`).
 */
function syncAtomCommands(source, project, hash) {
  // Add empty sets before completing and erroring to make sure that we remove remaining commands
  // in both cases.
  const sets = source.concat(_RxMin.Observable.of(new Set())).catch(err => _RxMin.Observable.of(new Set()).concat(_RxMin.Observable.throw(err)));
  return (0, _observable().reconcileSets)(sets, item => {
    const commands = project(item);
    const disposables = Object.keys(commands).map(target => atom.commands.add(target, commands[target]));
    return new (_UniversalDisposable().default)(...disposables);
  }, hash);
}