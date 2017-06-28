'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = observePaneItemVisibility;

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _memoizeUntilChanged;

function _load_memoizeUntilChanged() {
  return _memoizeUntilChanged = _interopRequireDefault(require('nuclide-commons/memoizeUntilChanged'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO(T17495608): Currently, docks don't have a way of observing their visibility so this will
//   have some false positives when an item is its pane's active item but its dock is hidden.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function observePaneItemVisibility(item) {
  // If this is a version of Atom that doesn't have Docks, return an empty observable. Until they
  // land, the functionality is provided by the workspace views package, which calls
  // `didChangeVisibility()` on items automatically.
  // TODO cleanup post Atom 1.17
  if (atom.workspace.getPaneContainers == null) {
    return _rxjsBundlesRxMinJs.Observable.empty();
  }

  patchDocks();

  return _rxjsBundlesRxMinJs.Observable.combineLatest(
  // atom.workspace.reset() (in tests) resets all the panes.
  // Pass in atom.workspace.getElement() to act as a cache-breaker.
  // $FlowFixMe: Add atom.workspace.getElement() after 1.17.
  observeActiveItems(atom.workspace.getElement()),
  // $FlowFixMe: Add atom.workspace.getElement() after 1.17.
  observePaneContainerVisibilities(atom.workspace.getElement())).map(([activeItems, locationVisibilities]) => {
    // If it's not active, it's not visible.
    if (!activeItems.has(item)) {
      return false;
    }
    // If it's active, it's only visible if its container is.
    // $FlowFixMe: Add atom.workspace.paneContainerForItem() after 1.17.
    const paneContainer = atom.workspace.paneContainerForItem(item);
    const location = paneContainer && paneContainer.getLocation();
    return Boolean(locationVisibilities[location]);
  }).distinctUntilChanged();
}

const observeActiveItems = (0, (_memoizeUntilChanged || _load_memoizeUntilChanged()).default)(_cacheKey => {
  // An observable that emits `{pane, item}` whenever the active item of a pane changes.
  const itemActivations = _rxjsBundlesRxMinJs.Observable.merge(
  // $FlowFixMe: Add `getPaneContainers()` to the type defs once Atom 1.17 lands.
  ...atom.workspace.getPaneContainers().map(paneContainer => {
    const observePanes = paneContainer.observePanes.bind(paneContainer);
    return (0, (_event || _load_event()).observableFromSubscribeFunction)(observePanes).flatMap(pane => {
      const paneDestroyed = (0, (_event || _load_event()).observableFromSubscribeFunction)(pane.onDidDestroy.bind(pane));
      const activeItems = (0, (_event || _load_event()).observableFromSubscribeFunction)(pane.observeActiveItem.bind(pane)).takeUntil(paneDestroyed);
      return _rxjsBundlesRxMinJs.Observable.concat(activeItems.map(item => ({ pane, item })), _rxjsBundlesRxMinJs.Observable.of({ pane, item: null }));
    });
  }));

  // Create a map of panes to their active items. We could look this up by examining the workspace
  // every time; this is an optimization.
  const panesToActiveItem = itemActivations.scan((acc, { pane, item }) => {
    if (item == null) {
      acc.delete(pane);
    } else {
      acc.set(pane, item);
    }
    return acc;
  }, new Map());

  return panesToActiveItem
  // When dragging items between panes, they'll be quickly deactivated and activated again. To
  // avoid doing extra work, we debounce and use the rAF scheduler.
  .debounceTime(0, _rxjsBundlesRxMinJs.Scheduler.animationFrame).map(map => new Set(map.values())).share();
});

// Create an observable that contains the current visibility state of each dock, but where the
// "false" values are delayed to account for the time it takes to animate the dock closed.
const observePaneContainerVisibilities = (0, (_memoizeUntilChanged || _load_memoizeUntilChanged()).default)(_cacheKey => {
  const visibilitiesByDock = ['left', 'right', 'bottom'].map(loc => dockStateChanges.filter(({ location }) => location === loc).switchMap(({ location, visible }) =>
  // Delay the "false" values so they don't occur while the dock is being animated closed.
  visible ? _rxjsBundlesRxMinJs.Observable.of({ location, visible }) : _rxjsBundlesRxMinJs.Observable.of({ location, visible }).delay(300)).distinctUntilKeyChanged('visible'));

  const initialVisibilities = {
    // The center is always visible.
    center: true,
    // $FlowFixMe: This definition will be updated once we migrate to 1.17
    left: atom.workspace.getLeftDock().isVisible(),
    // $FlowFixMe: This definition will be updated once we migrate to 1.17
    right: atom.workspace.getRightDock().isVisible(),
    // $FlowFixMe: This definition will be updated once we migrate to 1.17
    bottom: atom.workspace.getBottomDock().isVisible()
  };

  // Accumulate the dock visibilities.
  const visibilityStates = _rxjsBundlesRxMinJs.Observable.merge(...visibilitiesByDock).scan((acc, { location, visible }) => Object.assign({}, acc, {
    [location]: visible
  }), initialVisibilities).startWith(initialVisibilities).distinctUntilChanged((_shallowequal || _load_shallowequal()).default).publishReplay(1);
  visibilityStates.connect();

  return visibilityStates;
});

// HACK: Monkey-patch Docks in order to observe visibility toggling.
// TODO: Get a `Dock::observeVisibility()` upstreamed and use that API instead.
let docksPatched = false;
const dockStateChanges = new _rxjsBundlesRxMinJs.Subject();
function patchDocks() {
  if (docksPatched || typeof atom.workspace.getLeftDock !== 'function') {
    return;
  }
  docksPatched = true;
  const ctor = atom.workspace.getLeftDock().constructor;
  const proto = ctor.prototype;
  // $FlowIgnore
  const originalSetState = proto.setState;
  // $FlowIgnore
  proto.setState = function (newState, ...args) {
    originalSetState.call(this, newState, ...args);
    if (newState.hasOwnProperty('visible')) {
      dockStateChanges.next({
        location: this.getLocation(),
        visible: newState.visible
      });
    }
  };
}