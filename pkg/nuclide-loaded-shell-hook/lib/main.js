'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {loadedShellEnvironment} from '../../commons-node/process';

/**
 * The sole purpose of this package is to listen to the
 * core:loaded-shell-environment activation hook to safely notify the process module
 * that the user's shell environment has been loaded in Atom.
 */
export function activate(state: ?mixed) {
  loadedShellEnvironment();
}
