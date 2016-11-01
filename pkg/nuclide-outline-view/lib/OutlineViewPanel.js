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
exports.OutlineViewPanelState = undefined;

var _reactForAtom = require('react-for-atom');

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../commons-atom/renderReactRoot');
}

var _OutlineView;

function _load_OutlineView() {
  return _OutlineView = require('./OutlineView');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

let OutlineViewPanelState = exports.OutlineViewPanelState = class OutlineViewPanelState {

  constructor(outlines) {
    this._outlines = outlines;
    this._visibility = new _rxjsBundlesRxMinJs.BehaviorSubject(true);
  }

  getTitle() {
    return 'Outline View';
  }

  getIconName() {
    return 'list-unordered';
  }

  getPreferredInitialWidth() {
    return 300;
  }

  didChangeVisibility(visible) {
    this._visibility.next(visible);
  }

  getElement() {
    const outlines = this._visibility.switchMap(visible => visible ? this._outlines : _rxjsBundlesRxMinJs.Observable.of({ kind: 'empty' }));
    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_reactForAtom.React.createElement((_OutlineView || _load_OutlineView()).OutlineView, { outlines: outlines }));
  }

  serialize() {
    return {
      deserializer: 'nuclide.OutlineViewPanelState'
    };
  }

};