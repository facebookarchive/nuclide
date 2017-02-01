'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerLocationFactoryEpic = registerLocationFactoryEpic;
exports.trackItemLocationsEpic = trackItemLocationsEpic;
exports.trackActionsEpic = trackActionsEpic;
exports.trackEpic = trackEpic;
exports.openEpic = openEpic;
exports.toggleItemVisibilityEpic = toggleItemVisibilityEpic;
exports.setItemVisibilityEpic = setItemVisibilityEpic;
exports.unregisterLocationEpic = unregisterLocationEpic;
exports.destroyWhereEpic = destroyWhereEpic;

var _LocalStorageJsonTable;

function _load_LocalStorageJsonTable() {
  return _LocalStorageJsonTable = require('../../../commons-atom/LocalStorageJsonTable');
}

var _event;

function _load_event() {
  return _event = require('../../../commons-node/event');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const preferredLocationStorage = new (_LocalStorageJsonTable || _load_LocalStorageJsonTable()).LocalStorageJsonTable('nuclide:nuclide-workspace-views:preferredLocationIds');

/**
 * Register a record provider for every executor.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function registerLocationFactoryEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REGISTER_LOCATION_FACTORY).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).REGISTER_LOCATION_FACTORY)) {
      throw new Error('Invariant violation: "action.type === Actions.REGISTER_LOCATION_FACTORY"');
    }

    const { locationFactory: factory } = action.payload;

    // Create the location using the state we have serialized for it.
    const { serializedLocationStates } = store.getState();
    const serializedLocationState = serializedLocationStates.get(factory.id);
    const location = factory.create(serializedLocationState);
    return (_Actions || _load_Actions()).registerLocation(factory.id, location);
  });
}

function trackItemLocationsEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REGISTER_LOCATION).mergeMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).REGISTER_LOCATION)) {
      throw new Error('Invariant violation: "action.type === Actions.REGISTER_LOCATION"');
    }

    const { id, location } = action.payload;
    const unregistered = actions.filter(a => a.type === (_Actions || _load_Actions()).UNREGISTER_LOCATION && a.payload.id === id);
    // Since items can be added via means other than the workspace views API (e.g. dragging and
    // dropping), we need to register a listener.
    return (0, (_event || _load_event()).observableFromSubscribeFunction)(location.onDidAddItem.bind(location)).filter(item => item.getURI != null).takeUntil(unregistered).do(item => {
      // Store the preferred location for recall later.
      if (!(item.getURI != null)) {
        throw new Error('Invariant violation: "item.getURI != null"');
      }

      preferredLocationStorage.setItem(item.getURI(), id);
    }).ignoreElements();
  });
}

/**
 * Convert actions into tracking events. We perform the side-effect of actually calling track in
 * another epic and keep this one pure.
 */
function trackActionsEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).ITEM_CREATED)
  // Map to a tracking event.
  .map(action => {
    if (!(action.type === (_Actions || _load_Actions()).ITEM_CREATED)) {
      throw new Error('Invariant violation: "action.type === Actions.ITEM_CREATED"');
    }

    const { itemType } = action.payload;
    // TODO: Appeal to `item` for custom tracking event here. Let's wait until we need that
    //   though.
    return (_Actions || _load_Actions()).track({
      type: 'workspace-view-created',
      data: { itemType }
    });
  });
}

/**
 * Make tracking requests.
 */
function trackEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TRACK).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).TRACK)) {
      throw new Error('Invariant violation: "action.type === Actions.TRACK"');
    }

    return action.payload.event;
  }).do((_nuclideAnalytics || _load_nuclideAnalytics()).trackEvent).ignoreElements();
}

function openEpic(actions, store) {
  return bufferUntilDidActivateInitialPackages(actions).filter(action => action.type === (_Actions || _load_Actions()).OPEN).switchMap(action => {
    const { locations, openers } = store.getState();

    if (!(action.type === (_Actions || _load_Actions()).OPEN)) {
      throw new Error('Invariant violation: "action.type === Actions.OPEN"');
    }

    const { uri, options } = action.payload;
    const { searchAllPanes, activateItem, activateLocation } = options;

    let itemAndLocation;
    let item;
    let location;
    let itemCreated = false;

    if (searchAllPanes) {
      itemAndLocation = findItem(locations.values(), it => it.getURI != null && it.getURI() === uri);
    }

    if (itemAndLocation == null) {
      // We need to create the item.
      item = createViewable(uri, openers);
      if (item == null) {
        throw new Error(`No opener found for URI ${uri}`);
      }

      // Find a location for this viewable.
      const preferredLocationId = preferredLocationStorage.getItem(uri);
      if (preferredLocationId != null) {
        location = locations.get(preferredLocationId);
      }
      if (location == null) {
        const defaultLocationId = item.getDefaultLocation != null ? item.getDefaultLocation() : null;
        if (defaultLocationId != null) {
          location = locations.get(defaultLocationId);
        }
      }

      // If we don't have a location, just use any one we know about.
      if (location == null) {
        location = getFirstValue(locations);
      }

      // If we still don't have a location, give up.
      if (location == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      itemCreated = true;
    } else {
      item = itemAndLocation.item;
      location = itemAndLocation.location;
    }

    location.addItem(item);

    if (activateItem) {
      location.activateItem(item);
    }

    if (activateLocation) {
      location.activate();
    }

    return itemCreated ? _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).itemCreated(item, uri)) : _rxjsBundlesRxMinJs.Observable.empty();
  });
}

function toggleItemVisibilityEpic(actions, store) {
  return bufferUntilDidActivateInitialPackages(actions).filter(action => action.type === (_Actions || _load_Actions()).TOGGLE_ITEM_VISIBILITY).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_ITEM_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_ITEM_VISIBILITY"');
    }

    const { uri, visible } = action.payload;
    const state = store.getState();

    // Does an item matching this URI already exist?
    const itemsAndLocations = findAllItems(state.locations.values(), it => it.getURI != null && it.getURI() === uri);

    if (itemsAndLocations.length === 0) {
      if (visible === false) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      // We need to create and add the item.
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).open(uri, { searchAllPanes: false }));
    }

    // Change the visibility of all matching items. If some are visible and some aren't, this
    // won't be a true toggle, but it makes more sense.
    const makeVisible = visible != null ? visible : !itemsAndLocations.some(({ item, location }) => location.itemIsVisible(item));
    return _rxjsBundlesRxMinJs.Observable.from(itemsAndLocations.map(({ item, location }) => (_Actions || _load_Actions()).setItemVisibility({
      item,
      locationId: getLocationId(location, state),
      visible: makeVisible
    })));
  });
}

function setItemVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_ITEM_VISIBILITY).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_ITEM_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_ITEM_VISIBILITY"');
    }

    const { item, locationId, visible } = action.payload;
    const location = store.getState().locations.get(locationId);

    if (!(location != null)) {
      throw new Error('Invariant violation: "location != null"');
    }

    if (visible) {
      location.activateItem(item);
      location.activate();
    } else {
      location.hideItem(item);
    }
  }).ignoreElements();
}

function unregisterLocationEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).UNREGISTER_LOCATION).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).UNREGISTER_LOCATION)) {
      throw new Error('Invariant violation: "action.type === Actions.UNREGISTER_LOCATION"');
    }

    const { id } = action.payload;
    // Destroy the location.
    const location = store.getState().locations.get(id);

    if (!(location != null)) {
      throw new Error('Invariant violation: "location != null"');
    }

    if (typeof location.destroy === 'function') {
      location.destroy();
    }
  }).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).UNREGISTER_LOCATION)) {
      throw new Error('Invariant violation: "action.type === Actions.UNREGISTER_LOCATION"');
    }

    return (_Actions || _load_Actions()).locationUnregistered(action.payload.id);
  });
}

function destroyWhereEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).DESTROY_WHERE).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).DESTROY_WHERE)) {
      throw new Error('Invariant violation: "action.type === Actions.DESTROY_WHERE"');
    }

    const { predicate } = action.payload;

    for (const location of store.getState().locations.values()) {
      for (const item of location.getItems()) {
        if (predicate(item)) {
          location.destroyItem(item);
        }
      }
    }
  }).ignoreElements();
}

function findAllItems(locations, predicate) {
  const itemsAndLocations = [];
  for (const location of locations) {
    for (const item of location.getItems()) {
      if (predicate(item)) {
        itemsAndLocations.push({ item, location });
      }
    }
  }
  return itemsAndLocations;
}

function findItem(locations, predicate) {
  for (const location of locations) {
    for (const item of location.getItems()) {
      if (predicate(item)) {
        return { item, location };
      }
    }
  }
}

function getLocationId(location, state) {
  for (const [id, loc] of state.locations.entries()) {
    if (location === loc) {
      return id;
    }
  }
  // You should never get here.
  throw new Error();
}

function createViewable(uri, openers) {
  for (const opener of openers) {
    const viewable = opener(uri);
    if (viewable != null) {
      return viewable;
    }
  }
}

/**
 * Some packages (nuclide-home) will call the command that triggers actions during their activation.
 * However, that may be before locations have had a chance to register. Therefore, we want to defer
 * the command.
 */
function bufferUntilDidActivateInitialPackages(actions) {
  const didActivateInitialPackages = actions.ofType((_Actions || _load_Actions()).DID_ACTIVATE_INITIAL_PACKAGES).take(1);
  const missed = actions.buffer(didActivateInitialPackages).take(1).concatAll();
  return _rxjsBundlesRxMinJs.Observable.concat(missed, actions);
}

function getFirstValue(map) {
  for (const value of map.values()) {
    return value;
  }
}