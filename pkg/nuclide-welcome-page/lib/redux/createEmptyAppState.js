'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmptyAppState = createEmptyAppState;
function createEmptyAppState(serializedState, overriddenDefaults = {}) {
  const hiddenTopics = serializedState == null ? new Set() : new Set(serializedState.hiddenTopics);
  return {
    welcomePages: new Map(),
    hiddenTopics,
    isWelcomePageVisible: false
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */