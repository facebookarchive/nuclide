'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syncPaneItemVisibility = syncPaneItemVisibility;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function syncPaneItemVisibility(panesStream, visibilityStream) {
  const activeItemsStream = panesStream.switchMap(panes_ => {
    const panes = Array.from(panes_);
    const activeItemChanges = panes.map(pane => (0, (_event || _load_event()).observableFromSubscribeFunction)(pane.observeActiveItem.bind(pane)));
    return _rxjsBundlesRxMinJs.Observable.merge(...activeItemChanges).map(() => new Set((0, (_collection || _load_collection()).arrayCompact)(panes.map(pane => pane.getActiveItem()))));
  }).publishReplay(1);

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(
  // Whenever an item becomes active, `setItemVisibility(true)`
  activeItemsStream.subscribe(activeItems => activeItems.forEach(item => {
    setItemVisibility(item, true);
  })),

  // When the pane container switches visibility, `setItemVisibility(paneContainerVisibility)`
  _rxjsBundlesRxMinJs.Observable.combineLatest(activeItemsStream, visibilityStream).subscribe(([activeItems, visible]) => {
    activeItems.forEach(item => setItemVisibility(item, visible));
  }),

  // When an item becomes inactive: if it's still in the container, `setItemVisibility(false)`
  activeItemsStream.pairwise().withLatestFrom(panesStream).subscribe(([[prev, next], panes_]) => {
    const deactivatedItems = (0, (_collection || _load_collection()).setDifference)(prev || new Set(), next || new Set());
    const panes = Array.from(panes_);
    deactivatedItems.forEach(item => {
      const stillInContainer = panes.some(pane => pane.getItems().some(it => it === item));
      if (stillInContainer) {
        setItemVisibility(item, false);
      }
    });
  }), activeItemsStream.connect());
}

function setItemVisibility(item, visible) {
  if (typeof item.didChangeVisibility === 'function') {
    item.didChangeVisibility(visible);
  }
}