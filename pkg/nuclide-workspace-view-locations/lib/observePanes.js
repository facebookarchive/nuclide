'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observePanes = observePanes;

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Observe all of the panes in the container. This custom logic is required because of a weird Atom
 * behavior (bug?): `PaneContainer::getPanes()` doesn't include the added pane when called in the
 * `onDidAddPane` event callback. This function works around that issue by maintaining its own list
 * of panes.
 *
 * See https://github.com/atom/atom/issues/12654
 *     https://github.com/atom/atom/pull/12674
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

function observePanes(paneContainer) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    let panes = new Set(paneContainer.getPanes());
    return _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of(null), (0, (_event || _load_event()).observableFromSubscribeFunction)(paneContainer.onDidDestroyPane.bind(paneContainer)).do(event => {
      panes = new Set(paneContainer.getPanes());
      panes.delete(event.pane);
    }), (0, (_event || _load_event()).observableFromSubscribeFunction)(paneContainer.onDidAddPane.bind(paneContainer)).do(event => {
      panes = new Set(panes).add(event.pane);
    })).map(() => panes);
  });
}