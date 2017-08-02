'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;

var _whenShellEnvironmentLoaded;

function _load_whenShellEnvironmentLoaded() {
  return _whenShellEnvironmentLoaded = require('nuclide-commons/whenShellEnvironmentLoaded');
}

/**
 * The sole purpose of this package is to listen to the
 * core:loaded-shell-environment activation hook to safely notify the process module
 * that the user's shell environment has been loaded in Atom.
 */
function activate(state) {
  (0, (_whenShellEnvironmentLoaded || _load_whenShellEnvironmentLoaded()).loadedShellEnvironment)();
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

// TODO(T17266325): Remove this package when `atom.whenShellEnvironmentLoaded()` lands.