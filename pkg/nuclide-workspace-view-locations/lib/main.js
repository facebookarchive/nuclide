'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _PaneLocation;

function _load_PaneLocation() {
  return _PaneLocation = require('./PaneLocation');
}

var _PanelLocation;

function _load_PanelLocation() {
  return _PanelLocation = require('./PanelLocation');
}

var _PanelLocationIds;

function _load_PanelLocationIds() {
  return _PanelLocationIds = _interopRequireDefault(require('./PanelLocationIds'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This package doesn't actually serialize its own state. The reason is that we want to centralize
// that so that we can (eventually) associate them with profiles or workspace configurations.

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Activation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._panelLocations = new Map();
    this._initialPanelVisibility = new Map();
  }

  // The initial visiblity of each panel. A null/undefined value signifies that the serialized
  // visibility should be used.


  dispose() {
    this._disposables.dispose();
  }

  _toggleVisibility(id) {
    const location = this._panelLocations.get(id);
    if (location == null) {
      // We haven't created the panel yet. Store the visibility value so we can use it once we
      // do.
      const prevVisibility = this._initialPanelVisibility.get(id);
      this._initialPanelVisibility.set(id, !prevVisibility);
    } else {
      location.toggle();
    }
  }

  consumeWorkspaceViewsService(api) {
    const layout = require('../../nuclide-ui/VendorLib/atom-tabs/lib/layout');
    layout.activate();
    this._disposables.add(() => {
      layout.deactivate();
    }, api.registerLocation({ id: 'pane', create: () => new (_PaneLocation || _load_PaneLocation()).PaneLocation() }), ...(_PanelLocationIds || _load_PanelLocationIds()).default.map(id => api.registerLocation({
      id,
      create: serializedState_ => {
        const serializedState = serializedState_ == null ? {} : serializedState_;
        const initialVisibility = this._initialPanelVisibility.get(id);
        if (initialVisibility != null) {
          serializedState.visible = initialVisibility;
        }
        const location = new (_PanelLocation || _load_PanelLocation()).PanelLocation(id, serializedState);
        location.initialize();
        this._panelLocations.set(id, location);
        return location;
      }
    })), ...(_PanelLocationIds || _load_PanelLocationIds()).default.map(id => atom.commands.add('atom-workspace', `nuclide-workspace-views:toggle-${id}`, () => {
      this._toggleVisibility(id);
    })));
  }

  /**
   * Provide an interface to DSF for each panel. Because the services are asynchronous, we have to
   * account for the posibility that the panel hasn't yet been created (and we can't just create it
   * early beccause we need the serialized state which we get asynchronously as well). In that case,
   * store the visiblity DSF wants and use it when we create the panel later.
   */
  provideDistractionFreeModeProvider() {
    this._initialPanelVisibility = new Map((_PanelLocationIds || _load_PanelLocationIds()).default.map(id => [id, false]));
    return (_PanelLocationIds || _load_PanelLocationIds()).default.map(id => ({
      name: `nuclide-workspace-view-locations:${id}`,
      isVisible: () => {
        const location = this._panelLocations.get(id);
        return location == null ? Boolean(this._initialPanelVisibility.get(id)) : location.isVisible();
      },
      toggle: () => {
        this._toggleVisibility(id);
      }
    }));
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);