'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBuiltinProviders = getBuiltinProviders;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getBuiltinProviders() {
  const providers = [];
  if ((_featureConfig || _load_featureConfig()).default.get('nuclide-distraction-free-mode.hideToolBar')) {
    providers.push(new ToolBarProvider());
  }
  if ((_featureConfig || _load_featureConfig()).default.get('nuclide-distraction-free-mode.hideStatusBar')) {
    providers.push(new StatusBarProvider());
  }
  if ((_featureConfig || _load_featureConfig()).default.get('nuclide-distraction-free-mode.hideFindAndReplace')) {
    providers.push(new FindAndReplaceProvider('find-and-replace'));
    providers.push(new FindAndReplaceProvider('project-find'));
  }

  if (atom.workspace.getLeftDock != null) {
    providers.push(new DockProvider(atom.workspace.getLeftDock(), 'left-dock'));
  }
  if (atom.workspace.getRightDock != null) {
    providers.push(new DockProvider(atom.workspace.getRightDock(), 'right-dock'));
  }
  if (atom.workspace.getBottomDock != null) {
    providers.push(new DockProvider(atom.workspace.getBottomDock(), 'bottom-dock'));
  }

  return providers;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class FindAndReplaceProvider {
  constructor(name) {
    this.name = name;
  }
  isVisible() {
    const paneElem = document.querySelector('.' + this.name);
    if (paneElem != null) {
      const paneContainer = paneElem.parentElement;
      if (paneContainer != null && paneContainer.style != null && paneContainer.style.display != null) {
        const display = paneContainer.style.display;
        if (display !== 'none') {
          return true;
        }
      }
    }

    return false;
  }
  toggle() {
    if (!atom.packages.isPackageActive('find-and-replace')) {
      return;
    }

    const command = this.isVisible() ? 'toggle' : 'show';
    atom.commands.dispatch(atom.views.getView(atom.workspace), this.name + ':' + command);
  }
}

class ToolBarProvider {
  constructor() {
    this.name = 'tool-bar';
  }
  isVisible() {
    return Boolean(atom.config.get('tool-bar.visible'));
  }
  toggle() {
    atom.config.set('tool-bar.visible', !this.isVisible());
  }
}

class StatusBarProvider {
  constructor() {
    this.name = 'status-bar';
    this._oldDisplay = null;
  }
  isVisible() {
    return this._getStatusBarElement() != null && this._oldDisplay == null;
  }
  toggle() {
    const element = this._getStatusBarElement();
    if (element == null) {
      return;
    }
    if (this.isVisible()) {
      this._oldDisplay = element.style.display;
      element.style.display = 'none';
    } else {
      // isVisible is false, so oldDisplay is non-null
      if (!(this._oldDisplay != null)) {
        throw new Error('Invariant violation: "this._oldDisplay != null"');
      }

      element.style.display = this._oldDisplay;
      this._oldDisplay = null;
    }
  }
  _getStatusBarElement() {
    return document.querySelector('status-bar');
  }
}

class DockProvider {

  constructor(dock, name) {
    this._dock = dock;
    this.name = name;
  }

  isVisible() {
    return this._dock.isVisible();
  }

  toggle() {
    this._dock.toggle();
  }
}