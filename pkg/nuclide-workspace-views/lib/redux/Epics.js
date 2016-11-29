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
exports.registerLocationFactoryEpic = registerLocationFactoryEpic;
exports.createViewableEpic = createViewableEpic;
exports.trackActionsEpic = trackActionsEpic;
exports.trackEpic = trackEpic;
exports.toggleItemVisibilityEpic = toggleItemVisibilityEpic;
exports.setItemVisibilityEpic = setItemVisibilityEpic;
exports.unregisterLocationEpic = unregisterLocationEpic;
exports.destroyWhereEpic = destroyWhereEpic;

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

/**
 * Register a record provider for every executor.
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

/**
 * Create and show an item of the specified type.
 */
function createViewableEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).CREATE_VIEWABLE).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).CREATE_VIEWABLE)) {
      throw new Error('Invariant violation: "action.type === Actions.CREATE_VIEWABLE"');
    }

    const { uri } = action.payload;
    const state = store.getState();

    const item = createViewable(uri, state.openers);
    if (item == null) {
      throw new Error(`No opener found for URI ${ uri }`);
    }

    // Find a location for this viewable.
    let location;
    const defaultLocationId = item.getDefaultLocation != null ? item.getDefaultLocation() : null;
    if (defaultLocationId != null) {
      location = state.locations.get(defaultLocationId);
    }

    if (location == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    location.showItem(item);
    return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).itemCreated(item, uri));
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

function toggleItemVisibilityEpic(actions, store) {
  const visibilityActions = actions.filter(action => action.type === (_Actions || _load_Actions()).TOGGLE_ITEM_VISIBILITY || action.type === (_Actions || _load_Actions()).OPEN);
  return bufferUntilDidActivateInitialPackages(visibilityActions).map(action => {
    const { payload } = action;
    switch (action.type) {
      case (_Actions || _load_Actions()).TOGGLE_ITEM_VISIBILITY:
        return Object.assign({}, payload, { searchAllPanes: true });
      case (_Actions || _load_Actions()).OPEN:
        return Object.assign({}, payload, { visible: true });
      default:
        throw new Error(`Invalid action type: ${ action.type }`);
    }
  }).switchMap(({ uri, searchAllPanes, visible }) => {
    const state = store.getState();

    // Does an item matching this URI already exist?
    const itemsAndLocations = searchAllPanes ? findAllItems(state.locations.values(), it => it.getURI != null && it.getURI() === uri) : [];

    if (itemsAndLocations.length === 0) {
      if (visible === false) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      // We need to create and add the item.
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).createViewable(uri));
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
      location.showItem(item);
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

const nextTick = _rxjsBundlesRxMinJs.Observable.create(observer => {
  process.nextTick(() => {
    observer.next();
  });
});

/**
 * Some packages (nuclide-home) will call the command that triggers this action during their
 * activation. However, that may be before locations have had a chance to register. Therefore, we
 * want to defer the command. Atom does offer an event for listening to when the activation phase is
 * done (`PackageManager::onDidActivateInitialPackages`), but there's no way to tell if we missed
 * it! So we'll just settle for using `nextTick`.
 */
function bufferUntilDidActivateInitialPackages(source) {
  const missed = source.buffer(nextTick).take(1).concatAll();
  return _rxjsBundlesRxMinJs.Observable.concat(missed, source);
}