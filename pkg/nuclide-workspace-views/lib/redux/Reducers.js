'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.locations = locations;
exports.openers = openers;
exports.serializedLocationStates = serializedLocationStates;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function locations(state = new Map(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).REGISTER_LOCATION:
      {
        const { id, location } = action.payload;
        return new Map(state).set(id, location);
      }
    case (_Actions || _load_Actions()).LOCATION_UNREGISTERED:
      {
        const newState = new Map(state);
        newState.delete(action.payload.id);
        return newState;
      }
    default:
      return state;
  }
}

function openers(state = new Set(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).ADD_OPENER:
      {
        const { opener } = action.payload;
        return new Set(state).add(opener);
      }
    case (_Actions || _load_Actions()).REMOVE_OPENER:
      {
        const { opener } = action.payload;
        const newState = new Set(state);
        newState.delete(opener);
        return newState;
      }
    default:
      return state;
  }
}

function serializedLocationStates(state = new Map(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).REGISTER_LOCATION:
      {
        // Now that we've used the serialized state (to create the location instance), we can get rid
        // of it.
        const newStates = new Map(state);
        newStates.delete(action.payload.id);
        return newStates;
      }
    default:
      return state;
  }
}