'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {EventEmitter} = require('events');

class NuclideLocalEventbus extends EventEmitter {
  constructor() {
    super();
  }

  testConnection(): Promise<void> {
    return Promise.resolve();
  }

  close(): void {
  }
}

module.exports = NuclideLocalEventbus;
