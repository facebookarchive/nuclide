'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = syncAtomCommands;

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * A utility that adds and removes commands to the Atom command registry based on their presence in
 * a stream. This is basically like a mini-React for Atom commands, however, instead of diffing the
 * result (commands), we diff the input (sets) since it's easier and less likely to contain
 * functions (which are unlikely to be able to be safely compared using `===`).
 */
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

function syncAtomCommands(source, project, hash) {
  // Add empty sets before completing and erroring to make sure that we remove remaining commands
  // in both cases.
  const sets = source.concat(_rxjsBundlesRxMinJs.Observable.of(new Set())).catch(err => _rxjsBundlesRxMinJs.Observable.of(new Set()).concat(_rxjsBundlesRxMinJs.Observable.throw(err)));

  return (0, (_observable || _load_observable()).reconcileSets)(sets, item => {
    const commands = project(item);
    const disposables = Object.keys(commands).map(target => atom.commands.add(target, commands[target]));
    return new _atom.CompositeDisposable(...disposables);
  }, hash);
}