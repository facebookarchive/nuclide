'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

module.exports = {
  // Get name of the user who starts this process, supports both *nix and Windows.
  get USER(): string {
    const user = process.env['USER'] || process.env['USERNAME'];
    invariant(user != null);
    return user;
  },

  // Get home directory of the user who starts this process, supports both *nix and Windows.
  get HOME() {
    return process.env['HOME'] || process.env['USERPROFILE'];
  },
};
