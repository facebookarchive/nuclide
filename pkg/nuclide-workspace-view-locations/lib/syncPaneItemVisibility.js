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

function syncPaneItemVisibility(panesStream, visibilityStream) {
  const activeItemsStream = panesStream.switchMap(panes_ => {
    const panes = Array.from(panes_);
    const activeItemChanges = panes.map(pane => (0, (_event || _load_event()).observableFromSubscribeFunction)(pane.observeActiveItem.bind(pane)));
    return _rxjsBundlesRxMinJs.Observable.merge(...activeItemChanges).map(() => new Set((0, (_collection || _load_collection()).arrayCompact)(panes.map(pane => pane.getActiveItem()))));
  }).share();

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(
  // Whenever an item becomes active, `setItemVisibility(true)`
  activeItemsStream.subscribe(activeItems => activeItems.forEach(item => {
    setItemVisibility(item, true);
  })),

  // When the pane container switches visibility, `setItemVisibility(paneContainerVisibility)`
  _rxjsBundlesRxMinJs.Observable.combineLatest(activeItemsStream, visibilityStream).subscribe((_ref) => {
    var _ref2 = _slicedToArray(_ref, 2);

    let activeItems = _ref2[0],
        visible = _ref2[1];

    activeItems.forEach(item => setItemVisibility(item, visible));
  }),

  // When an item becomes inactive: if it's still in the container, `setItemVisibility(false)`
  activeItemsStream.pairwise().withLatestFrom(panesStream).subscribe((_ref3) => {
    var _ref4 = _slicedToArray(_ref3, 2),
        _ref4$ = _slicedToArray(_ref4[0], 2);

    let prev = _ref4$[0],
        next = _ref4$[1],
        panes_ = _ref4[1];

    const deactivatedItems = (0, (_collection || _load_collection()).setDifference)(prev || new Set(), next || new Set());
    const panes = Array.from(panes_);
    deactivatedItems.forEach(item => {
      const stillInContainer = panes.some(pane => pane.getItems().some(it => it === item));
      if (stillInContainer) {
        setItemVisibility(item, false);
      }
    });
  }));
}

function setItemVisibility(item, visible) {
  if (typeof item.didChangeVisibility === 'function') {
    item.didChangeVisibility(visible);
  }
}