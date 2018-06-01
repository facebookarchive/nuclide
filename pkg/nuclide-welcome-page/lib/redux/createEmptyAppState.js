/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {AppState, SerializedState} from '../types';

export function createEmptyAppState(
  serializedState: ?SerializedState,
  overriddenDefaults: Object = {},
): AppState {
  const hiddenTopics =
    serializedState == null ? new Set() : new Set(serializedState.hiddenTopics);
  return {
    welcomePages: new Map(),
    hiddenTopics,
    showAll: false,
    isWelcomePageVisible: false,
  };
}
