Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _bind = Function.prototype.bind;
exports.default = syncAtomCommands;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _commonsNodeObservable;

function _load_commonsNodeObservable() {
  return _commonsNodeObservable = require('../commons-node/observable');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

/**
 * A utility that adds and removes commands to the Atom command registry based on their presence in
 * a stream. This is basically like a mini-React for Atom commands, however, instead of diffing the
 * result (commands), we diff the input (sets) since it's easier and less likely to contain
 * functions (which are unlikely to be able to be safely compared using `===`).
 */

function syncAtomCommands(source, project, hash) {
  // Add empty sets before completing and erroring to make sure that we remove remaining commands
  // in both cases.
  var sets = source.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(new Set())).catch(function (err) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(new Set()).concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(err));
  });

  return (0, (_commonsNodeObservable || _load_commonsNodeObservable()).reconcileSets)(sets, function (item) {
    var commands = project(item);
    var disposables = Object.keys(commands).map(function (target) {
      return atom.commands.add(target, commands[target]);
    });
    return new (_bind.apply((_atom || _load_atom()).CompositeDisposable, [null].concat(_toConsumableArray(disposables))))();
  }, hash);
}

module.exports = exports.default;