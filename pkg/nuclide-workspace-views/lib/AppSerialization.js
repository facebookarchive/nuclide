'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serialize = serialize;
exports.deserialize = deserialize;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function serialize(state) {
  return {
    serializedLocationStates: (0, (_collection || _load_collection()).objectFromMap)(new Map(Array.from(state.locations.entries()).map(([id, location]) => {
      const serialized = typeof location.serialize === 'function' ? location.serialize() : null;
      return [id, serialized];
    }).filter(([, serialized]) => serialized != null)))
  };
}

function deserialize(rawState) {
  return {
    // Viewables and locations will re-register using the service.
    locations: new Map(),
    serializedLocationStates: new Map((0, (_collection || _load_collection()).objectEntries)(rawState.serializedLocationStates || {})),
    openers: new Set()
  };
}