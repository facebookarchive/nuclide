'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState} from './types';

export function createEmptyAppState(): AppState {
  return {
    activeTaskId: null,
    previousSessionActiveTaskId: null,
    taskRunners: new Map(),
    panel: null,
    projectRoot: null,
    tasks: new Map(),
    taskStatus: null,
    visible: false,
  };
}
