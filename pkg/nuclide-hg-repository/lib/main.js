'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function activate(state: any): void {
  // TODO(mbolin): Add activation code here.
}

export function createHgRepositoryProvider() {
  const {HgRepositoryProvider} = require('./HgRepositoryProvider');
  return new HgRepositoryProvider();
}
