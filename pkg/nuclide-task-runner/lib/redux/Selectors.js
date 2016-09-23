'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState, TaskId, TaskRunner} from '../types';

export function getActiveTaskId(state: AppState): ?TaskId {
  return state.activeTaskId;
}

export function getActiveTaskRunner(state: AppState): ?TaskRunner {
  const activeTaskId = getActiveTaskId(state);
  const activeTaskRunnerId = activeTaskId && activeTaskId.taskRunnerId;
  return activeTaskRunnerId == null
    ? null
    : state.taskRunners.get(activeTaskRunnerId);
}
