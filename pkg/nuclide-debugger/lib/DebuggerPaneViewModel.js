'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerPaneViewModel = undefined;

var _DebuggerModel;

function _load_DebuggerModel() {
  return _DebuggerModel = _interopRequireDefault(require('./DebuggerModel'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A model that will serve as the view model for all debugger panes. We must provide
// a unique instance of a view model for each pane, which Atom can destroy when the
// pane that contains it is destroyed. We therefore cannot give it the actual debugger
// model directly, since there is only one and its lifetime is tied to the lifetime
// of the debugging session.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class DebuggerPaneViewModel {

  constructor(config, debuggerModel, isLifetimeView, paneDestroyed, preferredWidth) {
    this._config = config;
    this._debuggerModel = debuggerModel;
    this._isLifetimeView = isLifetimeView;
    this._paneDestroyed = paneDestroyed;
    this._removedFromLayout = false;
    this._preferredWidth = preferredWidth;
  }

  dispose() {}

  destroy() {
    if (!this._removedFromLayout) {
      this._paneDestroyed(this._config);
    }
  }

  getTitle() {
    return this._config.title();
  }

  getDefaultLocation() {
    return this._debuggerModel.getDefaultLocation();
  }

  getURI() {
    return this._config.uri;
  }

  getPreferredWidth() {
    // flowlint-next-line sketchy-null-number:off
    return this._preferredWidth || this._debuggerModel.getPreferredWidth();
  }

  createView() {
    if (this._config.previousLocation != null) {
      this._config.previousLocation.userHidden = false;
    }
    return this._config.createView();
  }

  getConfig() {
    return this._config;
  }

  isLifetimeView() {
    return this._isLifetimeView;
  }

  setRemovedFromLayout(removed) {
    this._removedFromLayout = removed;
  }

  // Atom view needs to provide this, otherwise Atom throws an exception splitting panes for the view.
  serialize() {
    return {};
  }

  copy() {
    return false;
  }
}
exports.DebuggerPaneViewModel = DebuggerPaneViewModel;