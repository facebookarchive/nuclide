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

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../nuclide-commons');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _rxjs2;

function _rxjs() {
  return _rxjs2 = require('rxjs');
}

/**
 * A utility that adds and removes commands to the Atom command registry based on their presence in
 * a stream. This is basically like a mini-React for Atom commands, however, instead of diffing the
 * result (commands), we diff the input (sets) since it's easier and less likely to contain
 * functions (which are unlikely to be able to be safely compared using `===`).
 */

function syncAtomCommands(source, project) {
  // Add empty sets before completing and erroring to make sure that we remove remaining commands
  // in both cases.
  var sets = source.concat((_rxjs2 || _rxjs()).Observable.of(new Set())).catch(function (err) {
    return (_rxjs2 || _rxjs()).Observable.of(new Set()).concat((_rxjs2 || _rxjs()).Observable.throw(err));
  });

  return (0, (_nuclideCommons2 || _nuclideCommons()).reconcileSetDiffs)((0, (_nuclideCommons2 || _nuclideCommons()).diffSets)(sets), function (item) {
    var commands = project(item);
    var disposables = Object.keys(commands).map(function (target) {
      return atom.commands.add(target, commands[target]);
    });
    return new (_bind.apply((_atom2 || _atom()).CompositeDisposable, [null].concat(_toConsumableArray(disposables))))();
  });
}

module.exports = exports.default;