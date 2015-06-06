'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class AbstractProvider {
  async query(cwd: string, queryString: string): Promise<any> {
    throw new Error('not implemented');
  }

  async isAvailable(cwd: string): Promise<boolean> {
    throw new Error('not implemented');
  }
}

module.exports = AbstractProvider;
