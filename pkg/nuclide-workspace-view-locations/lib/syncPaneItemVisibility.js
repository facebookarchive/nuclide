Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.syncPaneItemVisibility = syncPaneItemVisibility;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

function syncPaneItemVisibility(panesStream, visibilityStream) {
  var activeItemsStream = panesStream.switchMap(function (panes_) {
    var _Observable;

    var panes = Array.from(panes_);
    var activeItemChanges = panes.map(function (pane) {
      return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(pane.observeActiveItem.bind(pane));
    });
    return (_Observable = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable, _toConsumableArray(activeItemChanges)).map(function () {
      return new Set((0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayCompact)(panes.map(function (pane) {
        return pane.getActiveItem();
      })));
    });
  }).share();

  return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(
  // Whenever an item becomes active, `setItemVisibility(true)`
  activeItemsStream.subscribe(function (activeItems) {
    return activeItems.forEach(function (item) {
      setItemVisibility(item, true);
    });
  }),

  // When the pane container switches visibility, `setItemVisibility(paneContainerVisibility)`
  (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(activeItemsStream, visibilityStream).subscribe(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var activeItems = _ref2[0];
    var visible = _ref2[1];

    activeItems.forEach(function (item) {
      return setItemVisibility(item, visible);
    });
  }),

  // When an item becomes inactive: if it's still in the container, `setItemVisibility(false)`
  // $FlowFixMe: Add `pairwise()` to Flow defs
  activeItemsStream.pairwise().withLatestFrom(panesStream).subscribe(function (_ref3) {
    var _ref32 = _slicedToArray(_ref3, 2);

    var _ref32$0 = _slicedToArray(_ref32[0], 2);

    var prev = _ref32$0[0];
    var next = _ref32$0[1];
    var panes_ = _ref32[1];

    var deactivatedItems = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).setDifference)(prev || new Set(), next || new Set());
    var panes = Array.from(panes_);
    deactivatedItems.forEach(function (item) {
      var stillInContainer = panes.some(function (pane) {
        return pane.getItems().some(function (it) {
          return it === item;
        });
      });
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