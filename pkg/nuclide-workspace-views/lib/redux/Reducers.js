'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, Location, ViewableFactory} from '../types';

import * as Actions from './Actions';

export function viewableFactories(state: Map<string, ViewableFactory> = new Map(), action: Action) {
  switch (action.type) {
    case Actions.REGISTER_VIEWABLE_FACTORY: {
      const {viewableFactory} = action.payload;
      return new Map(state).set(viewableFactory.id, viewableFactory);
    }
    case Actions.VIEWABLE_FACTORY_UNREGISTERED: {
      const newState = new Map(state);
      newState.delete(action.payload.id);
      return newState;
    }
    default:
      return state;
  }
}

export function locations(state: Map<string, Location> = new Map(), action: Action) {
  switch (action.type) {
    case Actions.REGISTER_LOCATION: {
      const {id, location} = action.payload;
      return new Map(state).set(id, location);
    }
    case Actions.LOCATION_UNREGISTERED: {
      const newState = new Map(state);
      newState.delete(action.payload.id);
      return newState;
    }
    default:
      return state;
  }
}

export function serializedLocationStates(state: Map<string, ?Object> = new Map(), action: Action) {
  switch (action.type) {
    case Actions.REGISTER_LOCATION: {
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
