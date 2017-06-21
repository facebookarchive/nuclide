'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmptyAppState = createEmptyAppState;
exports.serialize = serialize;
exports.deserialize = deserialize;

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function createEmptyAppState() {
  return {
    customAdbPaths: new Map(),
    customSdbPaths: new Map(),
    adbPorts: new Map()
  };
}

function serialize(state) {
  return {
    customAdbPaths: (0, (_collection || _load_collection()).objectFromMap)(state.customAdbPaths),
    customSdbPaths: (0, (_collection || _load_collection()).objectFromMap)(state.customSdbPaths),
    adbPorts: (0, (_collection || _load_collection()).objectFromMap)(state.adbPorts)
  };
}

function deserialize(rawState) {
  if (rawState != null) {
    ['customAdbPaths', 'customSdbPaths', 'adbPorts'].forEach(objectProp => {
      if (rawState.hasOwnProperty(objectProp)) {
        rawState[objectProp] = new Map((0, (_collection || _load_collection()).objectEntries)(rawState[objectProp] || {}));
      }
    });
  }
  return rawState;
}