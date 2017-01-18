'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeAddedPaneItems = observeAddedPaneItems;

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Atom's PaneContainer [doesn't call onDidAddItem when panes are moved][1]. Since we need to
 * include that, we have to roll our own.
 *
 * [1]: https://github.com/atom/atom/blob/v1.12.7/src/pane-container.coffee#L235
 */
function observeAddedPaneItems(paneContainer) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(paneContainer.observePanes.bind(paneContainer)).mergeMap(pane => (0, (_event || _load_event()).observableFromSubscribeFunction)(pane.onDidAddItem.bind(pane))).map(event => {
    // Technically, Viewable isn't a subtype of PaneItem.
    const item = event.item;
    return item;
  });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */