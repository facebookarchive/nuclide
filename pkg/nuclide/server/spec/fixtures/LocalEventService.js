'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Disposable} = require('event-kit');
const EventService = require('./EventService');

class LocalEventService extends EventService {
  onOnceEvent(callback: () => void): Disposable {
    const timeoutId = setTimeout(() => {
      callback();
    }, 400);

    return new Disposable(() => {
      clearTimeout(timeoutId);
    });
  }

  onRevealTruthOnceEvent(callback: (augend: number, addend: number, sum: number) => void): Disposable {
    const timeoutId = setTimeout(() => {
      const augend = Math.random();
      const addend = Math.random();
      callback(augend, addend, augend + addend);
    }, 100);

    return new Disposable(() => {
      clearTimeout(timeoutId);
    });
  }

  onRepeatEvent(callback: (id: number) => void): Disposable {
    let sequenceId = 0;
    const intervalId = setInterval(() => {
      callback(sequenceId);
      sequenceId++;
    }, 100);

    return new Disposable(() => clearInterval(intervalId));
  }
}

module.exports = LocalEventService;
