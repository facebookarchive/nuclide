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

var _getNewLocation;

function _load_getNewLocation() {
  return _getNewLocation = _interopRequireDefault(require('./getNewLocation'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function serialize(state) {
  return {
    serializedLocationStates: (0, (_collection || _load_collection()).objectFromMap)(new Map(Array.from(state.locations.entries()).map(([id, location]) => {
      const serialized = typeof location.serialize === 'function' ? location.serialize() : null;
      return [id, serialized];
    }).filter(([, serialized]) => serialized != null)))
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function deserialize(rawState) {
  return {
    // Viewables and locations will re-register using the service.
    locations: new Map(),
    serializedLocationStates: new Map(
    // Translate the old location ids ("left-panel", "pane", etc.) into the new, Atom-compatible
    // ones ("left", "center", etc.)
    (0, (_collection || _load_collection()).objectEntries)(rawState.serializedLocationStates || {}).map(([key, value]) => [(0, (_getNewLocation || _load_getNewLocation()).default)(key), value])),
    openers: new Set()
  };
}