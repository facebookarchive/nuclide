"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = observePaneItemVisibility;
exports.observeVisibleItems = observeVisibleItems;

function _event() {
  const data = require("../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _memoizeUntilChanged() {
  const data = _interopRequireDefault(require("../nuclide-commons/memoizeUntilChanged"));

  _memoizeUntilChanged = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// TODO(T17495608): Currently, docks don't have a way of observing their visibility so this will
//   have some false positives when an item is its pane's active item but its dock is hidden.
function observePaneItemVisibility(item) {
  patchDocks();
  const workspaceEl = atom.workspace.getElement();
  return _RxMin.Observable.combineLatest( // atom.workspace.reset() (in tests) resets all the panes.
  // Pass in the workspace dom element to act as a cache-breaker.
  observeActiveItems(workspaceEl), observePaneContainerVisibilities(workspaceEl)).map(([activeItems, locationVisibilities]) => {
    // If it's not active, it's not visible.
    if (!activeItems.has(item)) {
      return false;
    } // If it's active, it's only visible if its container is.


    const paneContainer = atom.workspace.paneContainerForItem(item);
    return paneContainer == null ? false : locationVisibilities[paneContainer.getLocation()];
  }).distinctUntilChanged();
}

function observeVisibleItems() {
  patchDocks();
  const workspaceEl = atom.workspace.getElement();
  return _RxMin.Observable.combineLatest(observeActiveItems(workspaceEl), observePaneContainerVisibilities(workspaceEl)).map(([activeItems, locationVisibilities]) => {
    // If it's not active, it's not visible.
    // If it's active, it's only visible if its container is.
    return (0, _collection().setFilter)(activeItems, item => {
      const paneContainer = atom.workspace.paneContainerForItem(item);
      const location = paneContainer && paneContainer.getLocation();
      return location ? Boolean(locationVisibilities[location]) : false;
    });
  });
}

const observeActiveItems = (0, _memoizeUntilChanged().default)(_cacheKey => {
  // An observable that emits `{pane, item}` whenever the active item of a pane changes.
  const itemActivations = _RxMin.Observable.merge(...atom.workspace.getPaneContainers().map(paneContainer => {
    const observePanes = paneContainer.observePanes.bind(paneContainer);
    return (0, _event().observableFromSubscribeFunction)(observePanes).flatMap(pane => {
      const paneDestroyed = (0, _event().observableFromSubscribeFunction)(pane.onDidDestroy.bind(pane));
      const activeItems = (0, _event().observableFromSubscribeFunction)(pane.observeActiveItem.bind(pane)).takeUntil(paneDestroyed);
      return _RxMin.Observable.concat(activeItems.map(item => ({
        pane,
        item
      })), _RxMin.Observable.of({
        pane,
        item: null
      }));
    });
  })); // Create a map of panes to their active items. We could look this up by examining the workspace
  // every time; this is an optimization.


  const panesToActiveItem = itemActivations.scan((acc, {
    pane,
    item
  }) => {
    if (item == null) {
      acc.delete(pane);
    } else {
      acc.set(pane, item);
    }

    return acc;
  }, new Map());
  return panesToActiveItem // When dragging items between panes, they'll be quickly deactivated and activated again. To
  // avoid doing extra work, we debounce and use the rAF scheduler.
  .debounceTime(0, _RxMin.Scheduler.animationFrame).map(map => new Set(map.values())) // $FlowIgnore: this is just not listed in the flow-typed defs
  .shareReplay(1);
}); // Create an observable that contains the current visibility state of each dock, but where the
// "false" values are delayed to account for the time it takes to animate the dock closed.

const observePaneContainerVisibilities = (0, _memoizeUntilChanged().default)(_cacheKey => {
  const visibilitiesByDock = ['left', 'right', 'bottom'].map(loc => dockStateChanges.filter(({
    location
  }) => location === loc).switchMap(({
    location,
    visible
  }) => // Delay the "false" values so they don't occur while the dock is being animated closed.
  visible ? _RxMin.Observable.of({
    location,
    visible
  }) : _RxMin.Observable.of({
    location,
    visible
  }).delay(300)).distinctUntilKeyChanged('visible'));
  const initialVisibilities = {
    // The center is always visible.
    center: true,
    left: atom.workspace.getLeftDock().isVisible(),
    right: atom.workspace.getRightDock().isVisible(),
    bottom: atom.workspace.getBottomDock().isVisible()
  }; // Accumulate the dock visibilities.

  const visibilityStates = _RxMin.Observable.merge(...visibilitiesByDock).scan((acc, {
    location,
    visible
  }) => Object.assign({}, acc, {
    [location]: visible
  }), initialVisibilities).startWith(initialVisibilities).distinctUntilChanged(_shallowequal().default).publishReplay(1);

  visibilityStates.connect();
  return visibilityStates;
}); // HACK: Monkey-patch Docks in order to observe visibility toggling.
// TODO: Use `Dock::observeVisibility` once atom/atom#14736 is in our lowest-supported version

let docksPatched = false;
const dockStateChanges = new _RxMin.Subject();

function patchDocks() {
  if (docksPatched || typeof atom.workspace.getLeftDock !== 'function') {
    return;
  }

  docksPatched = true;
  const ctor = atom.workspace.getLeftDock().constructor;
  const proto = ctor.prototype; // $FlowIgnore

  const originalSetState = proto.setState; // $FlowIgnore

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