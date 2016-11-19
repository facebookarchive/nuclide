'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState, Location, Opener, Store, Viewable} from '../types';
import type {ActionsObservable} from '../../../commons-node/redux-observable';

import {trackEvent} from '../../../nuclide-analytics';
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
    .switchMap(action => {
      invariant(action.type === Actions.CREATE_VIEWABLE);
      const {uri} = action.payload;
      const state = store.getState();

      const item = createViewable(uri, state.openers);
      if (item == null) {
        throw new Error(`No opener found for URI ${uri}`);
      }

      // Find a location for this viewable.
      let location;
      const defaultLocationId = item.getDefaultLocation != null ? item.getDefaultLocation() : null;
      if (defaultLocationId != null) {
        location = state.locations.get(defaultLocationId);
      }

      if (location == null) {
        return Observable.empty();
      }

      location.showItem(item);
      return Observable.of(Actions.itemCreated(item, uri));
    });
}

/**
 * Convert actions into tracking events. We perform the side-effect of actually calling track in
 * another epic and keep this one pure.
 */
export function trackActionsEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.ITEM_CREATED)
    // Map to a tracking event.
    .map(action => {
      invariant(action.type === Actions.ITEM_CREATED);
      const {itemType} = action.payload;
      // TODO: Appeal to `item` for custom tracking event here. Let's wait until we need that
      //   though.
      return Actions.track({
        type: 'workspace-view-created',
        data: {itemType},
      });
    });
}

/**
 * Make tracking requests.
 */
export function trackEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.TRACK)
    .map(action => {
      invariant(action.type === Actions.TRACK);
      return action.payload.event;
    })
    .do(trackEvent)
    .ignoreElements();
}

export function toggleItemVisibilityEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  const visibilityActions = actions.filter(
    action => action.type === Actions.TOGGLE_ITEM_VISIBILITY || action.type === Actions.OPEN,
  );
  return bufferUntilDidActivateInitialPackages(visibilityActions)
    .map(action => {
      const {payload} = action;
      switch (action.type) {
        case Actions.TOGGLE_ITEM_VISIBILITY:
          return {...payload, searchAllPanes: true};
        case Actions.OPEN:
          return {...payload, visible: true};
        default:
          throw new Error(`Invalid action type: ${action.type}`);
      }
    })
    .switchMap(({uri, searchAllPanes, visible}) => {
      const state = store.getState();

      // Does an item matching this URI already exist?
      const itemsAndLocations = searchAllPanes
        ? findAllItems(
          state.locations.values(), it => it.getURI != null && it.getURI() === uri,
        )
        : [];

      if (itemsAndLocations.length === 0) {
        if (visible === false) {
          return Observable.empty();
        }
        // We need to create and add the item.
        return Observable.of(Actions.createViewable(uri));
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

export function destroyWhereEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.DESTROY_WHERE)
    .do(action => {
      invariant(action.type === Actions.DESTROY_WHERE);
      const {predicate} = action.payload;

      for (const location of store.getState().locations.values()) {
        for (const item of location.getItems()) {
          if (predicate(item)) {
            location.destroyItem(item);
          }
        }
      }
    })
    .ignoreElements();
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

function createViewable(uri: string, openers: Set<Opener>): ?Viewable {
  for (const opener of openers) {
    const viewable = opener(uri);
    if (viewable != null) {
      return viewable;
    }
  }
}

const nextTick = Observable.create(observer => { process.nextTick(() => { observer.next(); }); });

/**
 * Some packages (nuclide-home) will call the command that triggers this action during their
 * activation. However, that may be before locations have had a chance to register. Therefore, we
 * want to defer the command. Atom does offer an event for listening to when the activation phase is
 * done (`PackageManager::onDidActivateInitialPackages`), but there's no way to tell if we missed
 * it! So we'll just settle for using `nextTick`.
 */
function bufferUntilDidActivateInitialPackages<T>(source: Observable<T>): Observable<T> {
  const missed = source.buffer(nextTick).take(1).concatAll();
  return Observable.concat(missed, source);
}
