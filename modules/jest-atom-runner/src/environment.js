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

import type {ProjectConfig} from './types';

import mock from 'jest-mock';
import {FakeTimers} from 'jest-util';

type Timer = {|
  id: number,
  ref: () => Timer,
  unref: () => Timer,
|};

const setupTimers = (config, moduleMocker) => {
  const timerIdToRef = (id: number) => ({
    id,
    ref() {
      return this;
    },
    unref() {
      return this;
    },
  });

  const timerRefToId = (timer: Timer): ?number => {
    return (timer && timer.id) || null;
  };

  const timerConfig = {
    idToRef: timerIdToRef,
    refToId: timerRefToId,
  };
  return new FakeTimers({
    config,
    global,
    moduleMocker,
    timerConfig,
  });
};

class Atom {
  global: Object;
  moduleMocker: Object;
  fakeTimers: Object;

  constructor(config: ProjectConfig) {
    this.global = global;
    this.moduleMocker = new mock.ModuleMocker(global);
    this.fakeTimers = setupTimers(config, this.moduleMocker);
  }

  async setup() {
    await this.global.atom.reset();
  }

  async teardown() {}

  runScript(script: any): ?any {
    // unfortunately electron crashes if we try to access anything
    // on global from within a vm content. The only workaround i found
    // is to lose sandboxing and run everything in a single context.
    // We should look into using iframes/webviews in the future.
    return script.runInThisContext();
  }
}

module.exports = Atom;
