Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.viewableFactories = viewableFactories;
exports.locations = locations;
exports.serializedLocationStates = serializedLocationStates;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

function viewableFactories(state, action) {
  if (state === undefined) state = new Map();

  switch (action.type) {
    case (_Actions2 || _Actions()).REGISTER_VIEWABLE_FACTORY:
      {
        var viewableFactory = action.payload.viewableFactory;

        return new Map(state).set(viewableFactory.id, viewableFactory);
      }
    case (_Actions2 || _Actions()).VIEWABLE_FACTORY_UNREGISTERED:
      {
        var newState = new Map(state);
        newState.delete(action.payload.id);
        return newState;
      }
    default:
      return state;
  }
}

function locations(state, action) {
  if (state === undefined) state = new Map();

  switch (action.type) {
    case (_Actions2 || _Actions()).REGISTER_LOCATION:
      {
        var _action$payload = action.payload;
        var id = _action$payload.id;
        var _location = _action$payload.location;

        return new Map(state).set(id, _location);
      }
    case (_Actions2 || _Actions()).LOCATION_UNREGISTERED:
      {
        var newState = new Map(state);
        newState.delete(action.payload.id);
        return newState;
      }
    default:
      return state;
  }
}

function serializedLocationStates(state, action) {
  if (state === undefined) state = new Map();

  switch (action.type) {
    case (_Actions2 || _Actions()).REGISTER_LOCATION:
      {
        // Now that we've used the serialized state (to create the location instance), we can get rid
        // of it.
        var newStates = new Map(state);
        newStates.delete(action.payload.id);
        return newStates;
      }
    default:
      return state;
  }
}