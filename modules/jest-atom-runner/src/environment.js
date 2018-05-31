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

import mock from 'jest-mock';

class Atom {
  global: Object;
  moduleMocker: Object;

  constructor(...args: any) {
    this.global = global;
    this.moduleMocker = new mock.ModuleMocker(global);
  }

  async setup() {
    await this.global.atom.reset();
  }

  async teardown() {}

  runScript(script: any): ?any {
    // unfortunately electron clashes if we try to access anything
    // on global from within a vm content. The only workaround i found
    // is to lose sandboxing and run everything in a single context.
    // We should look into using iframes/webviews in the future.
    return script.runInThisContext();
  }
}

module.exports = Atom;
