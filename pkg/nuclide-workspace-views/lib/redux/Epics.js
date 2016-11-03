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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.registerLocationFactoryEpic = registerLocationFactoryEpic;
exports.createViewableEpic = createViewableEpic;
exports.trackActionsEpic = trackActionsEpic;
exports.trackEpic = trackEpic;
exports.toggleItemVisibilityEpic = toggleItemVisibilityEpic;
exports.toggleItemVisibilityImmediatelyEpic = toggleItemVisibilityImmediatelyEpic;
exports.setItemVisibilityEpic = setItemVisibilityEpic;
exports.unregisterViewableFactoryEpic = unregisterViewableFactoryEpic;
exports.unregisterLocationEpic = unregisterLocationEpic;

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

    const factory = action.payload.locationFactory;

    // Create the location using the state we have serialized for it.

    var _store$getState = store.getState();

    const serializedLocationStates = _store$getState.serializedLocationStates;

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

    const itemType = action.payload.itemType;

    const state = store.getState();
    const factory = state.viewableFactories.get(itemType);

    if (!(factory != null)) {
      throw new Error('Invariant violation: "factory != null"');
    }

    // Find a location for this viewable.


    let location;
    if (factory.defaultLocation != null) {
      location = state.locations.get(factory.defaultLocation);
    }
    if (location == null) {
      const entry = Array.from(state.locations.entries()).find((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let id = _ref2[0],
            loc = _ref2[1];
        return locationIsAllowed(id, factory);
      });
      location = entry == null ? null : entry[1];
    }

    if (location == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const item = factory.create();
    location.showItem(item);
    return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).itemCreated(item, itemType));
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

    const itemType = action.payload.itemType;
    // TODO: Appeal to `item` for custom tracking event here. Let's wait until we need that
    //   though.

    return (_Actions || _load_Actions()).track({
      type: 'workspace-view-created',
      data: { itemType: itemType }
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

/**
 * Some packages (nuclide-home) will call the command that triggers this action during their
 * activation. However, that may be before locations have had a chance to register. Therefore, we
 * want to defer the command. Atom does offer an event for listening to when the activation phase is
 * done (`PackageManager::onDidActivateInitialPackages`), but there's no way to tell if we missed
 * it! So we'll just settle for using `nextTick`.
 */
function toggleItemVisibilityEpic(actions, store) {
  const toggleActions = actions.filter(action => action.type === (_Actions || _load_Actions()).TOGGLE_ITEM_VISIBILITY && !action.payload.immediate);
  const nextTick = _rxjsBundlesRxMinJs.Observable.create(observer => {
    process.nextTick(() => {
      observer.next();
    });
  });
  const missedActions = toggleActions.buffer(nextTick).take(1).concatAll();
  return _rxjsBundlesRxMinJs.Observable.concat(missedActions, toggleActions).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_ITEM_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_ITEM_VISIBILITY"');
    }

    var _action$payload = action.payload;
    const itemType = _action$payload.itemType,
          visible = _action$payload.visible;

    return (_Actions || _load_Actions()).toggleItemVisibility(itemType, visible == null ? undefined : visible, true);
  });
}

function toggleItemVisibilityImmediatelyEpic(actions, store) {
  return actions.filter(action => action.type === (_Actions || _load_Actions()).TOGGLE_ITEM_VISIBILITY && action.payload.immediate).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_ITEM_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_ITEM_VISIBILITY"');
    }

    var _action$payload2 = action.payload;
    const itemType = _action$payload2.itemType,
          visible = _action$payload2.visible;

    const state = store.getState();

    // Does an item of this type already exist?
    const viewableFactory = state.viewableFactories.get(itemType);

    if (!(viewableFactory != null)) {
      throw new Error('Invariant violation: "viewableFactory != null"');
    }

    const itemsAndLocations = findAllItems(state.locations.values(), it => viewableFactory.isInstance(it));

    if (itemsAndLocations.length === 0) {
      if (visible === false) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      // We need to create and add the item.
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).createViewable(itemType));
    }

    // Change the visibility of all matching items. If some are visible and some aren't, this
    // won't be a true toggle, but it makes more sense.
    const makeVisible = visible != null ? visible : !itemsAndLocations.some((_ref3) => {
      let item = _ref3.item,
          location = _ref3.location;
      return location.itemIsVisible(item);
    });
    return _rxjsBundlesRxMinJs.Observable.from(itemsAndLocations.map((_ref4) => {
      let item = _ref4.item,
          location = _ref4.location;
      return (_Actions || _load_Actions()).setItemVisibility({
        item: item,
        locationId: getLocationId(location, state),
        visible: makeVisible
      });
    }));
  });
}

function setItemVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_ITEM_VISIBILITY).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_ITEM_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_ITEM_VISIBILITY"');
    }

    var _action$payload3 = action.payload;
    const item = _action$payload3.item,
          locationId = _action$payload3.locationId,
          visible = _action$payload3.visible;

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

function unregisterViewableFactoryEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).UNREGISTER_VIEWABLE_FACTORY).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).UNREGISTER_VIEWABLE_FACTORY)) {
      throw new Error('Invariant violation: "action.type === Actions.UNREGISTER_VIEWABLE_FACTORY"');
    }

    const state = store.getState();
    const factory = state.viewableFactories.get(action.payload.id);

    if (factory == null) {
      return;
    }

    // When a viewable is unregistered, we need to remove all instances of it.
    for (const location of state.locations.values()) {
      location.getItems().forEach(item => {
        if (factory.isInstance(item)) {
          location.destroyItem(item);
        }
      });
    }
  }).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).UNREGISTER_VIEWABLE_FACTORY)) {
      throw new Error('Invariant violation: "action.type === Actions.UNREGISTER_VIEWABLE_FACTORY"');
    }

    return (_Actions || _load_Actions()).viewableFactoryUnregistered(action.payload.id);
  });
}

function unregisterLocationEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).UNREGISTER_LOCATION).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).UNREGISTER_LOCATION)) {
      throw new Error('Invariant violation: "action.type === Actions.UNREGISTER_LOCATION"');
    }

    const id = action.payload.id;
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

function findAllItems(locations, predicate) {
  const itemsAndLocations = [];
  for (const location of locations) {
    for (const item of location.getItems()) {
      if (predicate(item)) {
        itemsAndLocations.push({ item: item, location: location });
      }
    }
  }
  return itemsAndLocations;
}

function getLocationId(location, state) {
  for (const _ref5 of state.locations.entries()) {
    var _ref6 = _slicedToArray(_ref5, 2);

    const id = _ref6[0];
    const loc = _ref6[1];

    if (location === loc) {
      return id;
    }
  }
  // You should never get here.
  throw new Error();
}

function locationIsAllowed(locationId, viewableFactory) {
  const defaultLocation = viewableFactory.defaultLocation,
        allowedLocations = viewableFactory.allowedLocations,
        disallowedLocations = viewableFactory.disallowedLocations;

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