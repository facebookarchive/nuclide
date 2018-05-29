/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/* eslint-disable nuclide-internal/no-commonjs */

import JSDom from 'jest-environment-jsdom';

class Atom extends JSDom {
  constructor(...args: any) {
    super(...args);
    this.global.atom = global.atom;
  }

  async setup() {
    await super.setup();
    await this.global.atom.reset();
  }
}

module.exports = Atom;
