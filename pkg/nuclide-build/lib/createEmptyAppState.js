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
    activeBuildSystemId: null,
    activeTaskType: null,
    buildSystems: new Map(),
    panel: null,
    previousSessionActiveTaskType: null,
    previousSessionActiveBuildSystemId: null,
    tasks: [],
    taskStatus: null,
    visible: false,
  };
}
