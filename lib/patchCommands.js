'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = patchCommands;

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const INCLUDES_COMMAND_METADATA = '>= 1.21';

// TODO: (wbinnssmith) T22668678 remove when 1.21 is the minimum supported
// version of Atom
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

function patchCommands() {
  const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  if ((_semver || _load_semver()).default.satisfies(atom.getVersion(), INCLUDES_COMMAND_METADATA)) {
    return disposable;
  }

  let disposed = false;
  disposable.add(() => disposed = true);

  const originalAdd = atom.commands.add.bind(atom.commands);
  // $FlowFixMe We're patching intentionally :)
  atom.commands.add = function add(target, commandNameOrCommands, listener, throwOnInvalidSelector = true) {
    if (disposed) {
      return originalAdd(...arguments);
    }

    if (typeof commandNameOrCommands === 'string') {
      if (!(listener != null)) {
        throw new Error('Invariant violation: "listener != null"');
      }

      return originalAdd(target, commandNameOrCommands, listenerToCommandCallback(listener), throwOnInvalidSelector);
    }

    const newMap = {};
    for (const key of Object.keys(commandNameOrCommands)) {
      newMap[key] = listenerToCommandCallback(commandNameOrCommands[key]);
    }

    return originalAdd(target, newMap, undefined, throwOnInvalidSelector);
  };

  return disposable;
}

function listenerToCommandCallback(listener) {
  return typeof listener === 'function' ? listener : listener.didDispatch;
}