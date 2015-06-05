'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class EventService {

  onOnceEvent(callback: () => void): Promise<Disposable> {
    return Promise.reject('not implemented');
  }

  onRevealTruthOnceEvent(callback: (augend: number, addend: number, sum: number) => void): Promise<Disposable> {
    return Promise.reject('not implemented');
  }

  onRepeatEvent(callback: (id: number) => void): Promise<Disposable> {
    return Promise.reject('not implemented');
  }
}

module.exports = EventService;
