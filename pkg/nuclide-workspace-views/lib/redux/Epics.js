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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.registerLocationFactoryEpic = registerLocationFactoryEpic;
exports.createViewableEpic = createViewableEpic;
exports.trackActionsEpic = trackActionsEpic;
exports.trackEpic = trackEpic;
exports.toggleItemVisibilityEpic = toggleItemVisibilityEpic;
exports.toggleItemVisibilityImmediatelyEpic = toggleItemVisibilityImmediatelyEpic;
exports.setItemVisibilityEpic = setItemVisibilityEpic;
exports.unregisterViewableFactoryEpic = unregisterViewableFactoryEpic;
exports.unregisterLocationEpic = unregisterLocationEpic;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../../nuclide-analytics');
}

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

/**
 * Register a record provider for every executor.
 */

function registerLocationFactoryEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).REGISTER_LOCATION_FACTORY).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).REGISTER_LOCATION_FACTORY);
    var factory = action.payload.locationFactory;

    // Create the location using the state we have serialized for it.

    var _store$getState = store.getState();

    var serializedLocationStates = _store$getState.serializedLocationStates;

    var serializedLocationState = serializedLocationStates.get(factory.id);
    var location = factory.create(serializedLocationState);
    return (_Actions2 || _Actions()).registerLocation(factory.id, location);
  });
}

/**
 * Create and show an item of the specified type.
 */

function createViewableEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).CREATE_VIEWABLE).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).CREATE_VIEWABLE);
    var itemType = action.payload.itemType;

    var state = store.getState();
    var factory = state.viewableFactories.get(itemType);
    (0, (_assert2 || _assert()).default)(factory != null);

    // Find a location for this viewable.
    var location = undefined;
    if (factory.defaultLocation != null) {
      location = state.locations.get(factory.defaultLocation);
    }
    if (location == null) {
      var entry = Array.from(state.locations.entries()).find(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var id = _ref2[0];
        var loc = _ref2[1];
        return locationIsAllowed(id, factory);
      });
      location = entry == null ? null : entry[1];
    }

    if (location == null) {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }

    var item = factory.create();
    location.showItem(item);
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).itemCreated(item, itemType));
  });
}

/**
 * Convert actions into tracking events. We perform the side-effect of actually calling track in
 * another epic and keep this one pure.
 */

function trackActionsEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).ITEM_CREATED)
  // Map to a tracking event.
  .map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).ITEM_CREATED);
    var itemType = action.payload.itemType;

    // TODO: Appeal to `item` for custom tracking event here. Let's wait until we need that
    //   though.
    return (_Actions2 || _Actions()).track({
      type: 'workspace-view-created',
      data: { itemType: itemType }
    });
  });
}

/**
 * Make tracking requests.
 */

function trackEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).TRACK).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).TRACK);
    return action.payload.event;
  }).do((_nuclideAnalytics2 || _nuclideAnalytics()).trackEvent).ignoreElements();
}

/**
 * Some packages (nuclide-home) will call the command that triggers this action during their
 * activation. However, that may be before locations have had a chance to register. Therefore, we
 * want to defer the command. Atom does offer an event for listening to when the activation phase is
 * done (`PackageManager::onDidActivateInitialPackages`), but there's no way to tell if we missed
 * it! So we'll just settle for using `nextTick`.
 */

function toggleItemVisibilityEpic(actions, store) {
  var toggleActions = actions.filter(function (action) {
    return action.type === (_Actions2 || _Actions()).TOGGLE_ITEM_VISIBILITY && !action.payload.immediate;
  });
  var nextTick = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    process.nextTick(function () {
      observer.next();
    });
  });
  // $FlowFixMe: Add `concatAll()` to flow-typed
  var missedActions = toggleActions.buffer(nextTick).take(1).concatAll();
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat(missedActions, toggleActions).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).TOGGLE_ITEM_VISIBILITY);
    var _action$payload = action.payload;
    var itemType = _action$payload.itemType;
    var visible = _action$payload.visible;

    return (_Actions2 || _Actions()).toggleItemVisibility(itemType, visible == null ? undefined : visible, true);
  });
}

function toggleItemVisibilityImmediatelyEpic(actions, store) {
  return actions.filter(function (action) {
    return action.type === (_Actions2 || _Actions()).TOGGLE_ITEM_VISIBILITY && action.payload.immediate;
  }).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).TOGGLE_ITEM_VISIBILITY);
    var _action$payload2 = action.payload;
    var itemType = _action$payload2.itemType;
    var visible = _action$payload2.visible;

    var state = store.getState();

    // Does an item of this type already exist?
    var viewableFactory = state.viewableFactories.get(itemType);
    (0, (_assert2 || _assert()).default)(viewableFactory != null);
    var itemsAndLocations = findAllItems(state.locations.values(), function (it) {
      return viewableFactory.isInstance(it);
    });

    if (itemsAndLocations.length === 0) {
      if (visible === false) {
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
      }
      // We need to create and add the item.
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).createViewable(itemType));
    }

    // Change the visibility of all matching items. If some are visible and some aren't, this
    // won't be a true toggle, but it makes more sense.
    var makeVisible = visible != null ? visible : !itemsAndLocations.some(function (_ref3) {
      var item = _ref3.item;
      var location = _ref3.location;
      return location.itemIsVisible(item);
    });
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(itemsAndLocations.map(function (_ref4) {
      var item = _ref4.item;
      var location = _ref4.location;
      return (_Actions2 || _Actions()).setItemVisibility({
        item: item,
        locationId: getLocationId(location, state),
        visible: makeVisible
      });
    }));
  });
}

function setItemVisibilityEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).SET_ITEM_VISIBILITY).do(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).SET_ITEM_VISIBILITY);
    var _action$payload3 = action.payload;
    var item = _action$payload3.item;
    var locationId = _action$payload3.locationId;
    var visible = _action$payload3.visible;

    var location = store.getState().locations.get(locationId);
    (0, (_assert2 || _assert()).default)(location != null);
    if (visible) {
      location.showItem(item);
    } else {
      location.hideItem(item);
    }
  }).ignoreElements();
}

function unregisterViewableFactoryEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).UNREGISTER_VIEWABLE_FACTORY).do(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).UNREGISTER_VIEWABLE_FACTORY);

    var state = store.getState();
    var factory = state.viewableFactories.get(action.payload.id);

    if (factory == null) {
      return;
    }

    // When a viewable is unregistered, we need to remove all instances of it.

    var _loop = function (_location) {
      _location.getItems().forEach(function (item) {
        if (factory.isInstance(item)) {
          _location.destroyItem(item);
        }
      });
    };

    for (var _location of state.locations.values()) {
      _loop(_location);
    }
  }).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).UNREGISTER_VIEWABLE_FACTORY);
    return (_Actions2 || _Actions()).viewableFactoryUnregistered(action.payload.id);
  });
}

function unregisterLocationEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).UNREGISTER_LOCATION).do(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).UNREGISTER_LOCATION);
    var id = action.payload.id;

    // Destroy the location.
    var location = store.getState().locations.get(id);

    (0, (_assert2 || _assert()).default)(location != null);
    if (typeof location.destroy === 'function') {
      location.destroy();
    }
  }).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).UNREGISTER_LOCATION);
    return (_Actions2 || _Actions()).locationUnregistered(action.payload.id);
  });
}

function findAllItems(locations, predicate) {
  var itemsAndLocations = [];
  for (var _location2 of locations) {
    for (var _item of _location2.getItems()) {
      if (predicate(_item)) {
        itemsAndLocations.push({ item: _item, location: _location2 });
      }
    }
  }
  return itemsAndLocations;
}

function getLocationId(location, state) {
  for (var _ref53 of state.locations.entries()) {
    var _ref52 = _slicedToArray(_ref53, 2);

    var id = _ref52[0];
    var loc = _ref52[1];

    if (location === loc) {
      return id;
    }
  }
  // You should never get here.
  throw new Error();
}

function locationIsAllowed(locationId, viewableFactory) {
  var defaultLocation = viewableFactory.defaultLocation;
  var allowedLocations = viewableFactory.allowedLocations;
  var disallowedLocations = viewableFactory.disallowedLocations;

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