'use strict';Object.defineProperty(exports, "__esModule", { value: true });












var _react = _interopRequireWildcard(require('react'));var _constants;
function _load_constants() {return _constants = require('../constants');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}




// A model that will serve as the view model for all debugger panes. We must provide
// a unique instance of a view model for each pane, which Atom can destroy when the
// pane that contains it is destroyed. We therefore cannot give it the actual debugger
// model directly, since there is only one and its lifetime is tied to the lifetime
// of the debugging session.
class DebuggerPaneViewModel {






  constructor(
  config,
  isLifetimeView,
  paneDestroyed,
  preferredWidth)
  {
    this._config = config;
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
    return (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION;
  }

  getURI() {
    return this._config.uri;
  }

  getPreferredWidth() {
    return this._preferredWidth == null ? (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_WIDTH_PX :

    this._preferredWidth;
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
  }}exports.default = DebuggerPaneViewModel; /**
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