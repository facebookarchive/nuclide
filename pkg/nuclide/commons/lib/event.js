'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type Disposable = {
  dispose: () => void;
};

import type {EventEmitter} from 'events';

export function attachEvent(emitter: EventEmitter, eventName: string, callback: Function): Disposable {
  emitter.addListener(eventName, callback);
  return {
    dispose() {
      emitter.removeListener(eventName, callback);
    },
  };
}
