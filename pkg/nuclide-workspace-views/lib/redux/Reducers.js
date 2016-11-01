'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.viewableFactories = viewableFactories;
exports.locations = locations;
exports.serializedLocationStates = serializedLocationStates;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function viewableFactories() {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Map();
  let action = arguments[1];

  switch (action.type) {
    case (_Actions || _load_Actions()).REGISTER_VIEWABLE_FACTORY:
      {
        const viewableFactory = action.payload.viewableFactory;

        return new Map(state).set(viewableFactory.id, viewableFactory);
      }
    case (_Actions || _load_Actions()).VIEWABLE_FACTORY_UNREGISTERED:
      {
        const newState = new Map(state);
        newState.delete(action.payload.id);
        return newState;
      }
    default:
      return state;
  }
}

function locations() {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Map();
  let action = arguments[1];

  switch (action.type) {
    case (_Actions || _load_Actions()).REGISTER_LOCATION:
      {
        var _action$payload = action.payload;
        const id = _action$payload.id,
              location = _action$payload.location;

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

function serializedLocationStates() {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Map();
  let action = arguments[1];

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