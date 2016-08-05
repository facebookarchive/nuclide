'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState, Location, Store, Viewable, ViewableFactory} from '../types';
import type {ActionsObservable} from '../../../commons-node/redux-observable';

import * as Actions from './Actions';
import invariant from 'assert';
import {Observable} from 'rxjs';

type ItemAndLocation = {
  item: Viewable,
  location: Location,
};

/**
 * Register a record provider for every executor.
 */
export function registerLocationFactoryEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.REGISTER_LOCATION_FACTORY).map(action => {
    invariant(action.type === Actions.REGISTER_LOCATION_FACTORY);
    const {locationFactory: factory} = action.payload;

    // Create the location using the state we have serialized for it.
    const {serializedLocationStates} = store.getState();
    const serializedLocationState = serializedLocationStates.get(factory.id);
    const location = factory.create(serializedLocationState);
    return Actions.registerLocation(factory.id, location);
  });
}

/**
 * Create and show an item of the specified type.
 */
export function createViewableEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.CREATE_VIEWABLE)
    .do(action => {
      invariant(action.type === Actions.CREATE_VIEWABLE);
      const {itemType} = action.payload;
      const state = store.getState();
      const factory = state.viewableFactories.get(itemType);
      invariant(factory != null);

      // Find a location for this viewable.
      let location;
      if (factory.defaultLocation != null) {
        location = state.locations.get(factory.defaultLocation);
      }
      if (location == null) {
        const entry = Array.from(state.locations.entries()).find(
          ([id, loc]) => locationIsAllowed(id, factory),
        );
        location = entry == null ? null : entry[1];
      }

      if (location == null) { return; }

      const item = factory.create();
      location.showItem(item);
    })
    .ignoreElements();
}

export function toggleItemVisibilityEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.TOGGLE_ITEM_VISIBILITY)
    .switchMap(action => {
      invariant(action.type === Actions.TOGGLE_ITEM_VISIBILITY);
      const {itemType, visible} = action.payload;
      const state = store.getState();

      // Does an item of this type already exist?
      const viewableFactory = state.viewableFactories.get(itemType);
      invariant(viewableFactory != null);
      const itemsAndLocations = findAllItems(
        state.locations.values(), it => viewableFactory.isInstance(it),
      );

      if (itemsAndLocations.length === 0) {
        if (visible === false) {
          return Observable.empty();
        }
        // We need to create and add the item.
        return Observable.of(Actions.createViewable(itemType));
      }

      // Change the visibility of all matching items. If some are visible and some aren't, this
      // won't be a true toggle, but it makes more sense.
      const makeVisible = visible != null
        ? visible
        : !itemsAndLocations.some(({item, location}) => location.itemIsVisible(item));
      return Observable.from(
        itemsAndLocations.map(({item, location}) => (
          Actions.setItemVisibility({
            item,
            locationId: getLocationId(location, state),
            visible: makeVisible,
          })
        )),
      );

    });
}

export function setItemVisibilityEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.SET_ITEM_VISIBILITY)
    .do(action => {
      invariant(action.type === Actions.SET_ITEM_VISIBILITY);
      const {item, locationId, visible} = action.payload;
      const location = store.getState().locations.get(locationId);
      invariant(location != null);
      if (visible) {
        location.showItem(item);
      } else {
        location.hideItem(item);
      }
    })
    .ignoreElements();
}

export function unregisterViewableFactoryEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.UNREGISTER_VIEWABLE_FACTORY)
    .do(action => {
      invariant(action.type === Actions.UNREGISTER_VIEWABLE_FACTORY);

      const state = store.getState();
      const factory = state.viewableFactories.get(action.payload.id);

      if (factory == null) { return; }

      // When a viewable is unregistered, we need to remove all instances of it.
      for (const location of state.locations.values()) {
        location.getItems().forEach(item => {
          if (factory.isInstance(item)) {
            location.destroyItem(item);
          }
        });
      }
    })
    .map(action => {
      invariant(action.type === Actions.UNREGISTER_VIEWABLE_FACTORY);
      return Actions.viewableFactoryUnregistered(action.payload.id);
    });
}

export function unregisterLocationEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.UNREGISTER_LOCATION)
    .do(action => {
      invariant(action.type === Actions.UNREGISTER_LOCATION);
      const {id} = action.payload;
      // Destroy the location.
      const location = store.getState().locations.get(id);

      invariant(location != null);
      if (typeof location.destroy === 'function') {
        location.destroy();
      }
    })
    .map(action => {
      invariant(action.type === Actions.UNREGISTER_LOCATION);
      return Actions.locationUnregistered(action.payload.id);
    });
}

function findAllItems(
  locations: Iterable<Location>,
  predicate: (item: Viewable) => boolean,
): Array<ItemAndLocation> {
  const itemsAndLocations = [];
  for (const location of locations) {
    for (const item of location.getItems()) {
      if (predicate(item)) {
        itemsAndLocations.push({item, location});
      }
    }
  }
  return itemsAndLocations;
}

function getLocationId(location: Location, state: AppState): string {
  for (const [id, loc] of state.locations.entries()) {
    if (location === loc) {
      return id;
    }
  }
  // You should never get here.
  throw new Error();
}

function locationIsAllowed(locationId: string, viewableFactory: ViewableFactory): boolean {
  const {defaultLocation, allowedLocations, disallowedLocations} = viewableFactory;
  if (locationId === defaultLocation) {
    return true;
  }
  if (disallowedLocations != null && disallowedLocations.indexOf(locationId) !== -1) {
    return false;
  }
  if (allowedLocations != null && allowedLocations.indexOf(locationId) === -1) {
    return false;
  }
  return true;
}
