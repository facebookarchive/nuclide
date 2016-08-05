'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, Location, LocationFactory, Viewable, ViewableFactory} from '../types';

export const CREATE_VIEWABLE = 'CREATE_VIEWABLE';
export const SET_ITEM_VISIBILITY = 'SET_ITEM_VISIBILITY';
export const TOGGLE_ITEM_VISIBILITY = 'TOGGLE_ITEM_VISIBILITY';
export const REGISTER_VIEWABLE_FACTORY = 'REGISTER_VIEWABLE_FACTORY';
export const UNREGISTER_VIEWABLE_FACTORY = 'UNREGISTER_VIEWABLE_FACTORY';
export const REGISTER_LOCATION = 'REGISTER_LOCATION';
export const REGISTER_LOCATION_FACTORY = 'REGISTER_LOCATION_FACTORY';
export const UNREGISTER_LOCATION = 'UNREGISTER_LOCATION';
export const LOCATION_UNREGISTERED = 'LOCATION_UNREGISTERED';
export const VIEWABLE_FACTORY_UNREGISTERED = 'VIEWABLE_FACTORY_UNREGISTERED';

export function createViewable(itemType: string): Action {
  return {
    type: CREATE_VIEWABLE,
    payload: {itemType},
  };
}

export function registerViewableFactory(viewableFactory: ViewableFactory): Action {
  return {
    type: REGISTER_VIEWABLE_FACTORY,
    payload: {viewableFactory},
  };
}

export function unregisterViewableFactory(id: string): Action {
  return {
    type: UNREGISTER_VIEWABLE_FACTORY,
    payload: {id},
  };
}

export function viewableFactoryUnregistered(id: string): Action {
  return {
    type: VIEWABLE_FACTORY_UNREGISTERED,
    payload: {id},
  };
}

export function registerLocation(id: string, location: Location): Action {
  return {
    type: REGISTER_LOCATION,
    payload: {id, location},
  };
}

export function registerLocationFactory(locationFactory: LocationFactory): Action {
  return {
    type: REGISTER_LOCATION_FACTORY,
    payload: {locationFactory},
  };
}

export function unregisterLocation(id: string): Action {
  return {
    type: UNREGISTER_LOCATION,
    payload: {id},
  };
}

export function locationUnregistered(id: string): Action {
  return {
    type: LOCATION_UNREGISTERED,
    payload: {id},
  };
}

type SetItemVisibilityOptions = {
  item: Viewable,
  locationId: string,
  visible: boolean,
};
export function setItemVisibility(options: SetItemVisibilityOptions): Action {
  return {
    type: SET_ITEM_VISIBILITY,
    payload: options,
  };
}

export function toggleItemVisibility(itemType: string, visible?: boolean): Action {
  return {
    type: TOGGLE_ITEM_VISIBILITY,
    payload: {itemType, visible},
  };
}
