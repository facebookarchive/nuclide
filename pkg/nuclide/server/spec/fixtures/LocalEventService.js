'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Disposable} = require('event-kit');
var EventService = require('./EventService');

class LocalEventService extends EventService {
  onOnceEvent(callback: () => void): Disposable {
    var timeoutId = setTimeout(() => {
      callback();
    }, 400);

    return new Disposable(() => {
      clearTimeout(timeoutId);
    });
  }

  onRevealTruthOnceEvent(callback: (augend: number, addend: number, sum: number) => void): Disposable {
    var timeoutId = setTimeout(() => {
      var augend = Math.random();
      var addend = Math.random();
      callback(augend, addend, augend + addend);
    }, 100);

    return new Disposable(() => {
      clearTimeout(timeoutId);
    });
  }

  onRepeatEvent(callback: (id: number) => void): Disposable {
    var sequenceId = 0;
    var intervalId = setInterval(() => {
      callback(sequenceId);
      sequenceId++;
    }, 100);

    return new Disposable(() => clearInterval(intervalId));
  }
}

module.exports = LocalEventService;
