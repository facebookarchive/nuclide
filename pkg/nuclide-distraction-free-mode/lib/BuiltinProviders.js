'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DistractionFreeModeProvider} from '..';

import invariant from 'assert';

import featureConfig from '../../commons-atom/featureConfig';

export function getBuiltinProviders(): Array<DistractionFreeModeProvider> {
  const providers = [];
  if (featureConfig.get('nuclide-distraction-free-mode.hideToolBar')) {
    providers.push(new ToolBarProvider());
  }
  if (featureConfig.get('nuclide-distraction-free-mode.hideStatusBar')) {
    providers.push(new StatusBarProvider());
  }
  if (featureConfig.get('nuclide-distraction-free-mode.hideFindAndReplace')) {
    providers.push(new FindAndReplaceProvider('find-and-replace'));
    providers.push(new FindAndReplaceProvider('project-find'));
  }

  return providers;
}

class FindAndReplaceProvider {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  isVisible(): boolean {
    const paneElem = document.querySelector('.' + this.name);
    if (paneElem != null) {
      const paneContainer = paneElem.parentElement;
      if (paneContainer != null
        && paneContainer.style != null
        && paneContainer.style.display != null) {
        const display = paneContainer.style.display;
        if (display !== 'none') {
          return true;
        }
      }
    }

    return false;
  }
  toggle(): void {
    if (!atom.packages.isPackageActive('find-and-replace')) { return; }

    const command = this.isVisible() ? 'toggle' : 'show';
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      this.name + ':' + command,
    );
  }

}

class ToolBarProvider {
  name: string;
  constructor() {
    this.name = 'tool-bar';
  }
  isVisible(): boolean {
    return Boolean(atom.config.get('tool-bar.visible'));
  }
  toggle(): void {
    atom.config.set('tool-bar.visible', !this.isVisible());
  }
}

class StatusBarProvider {
  name: string;
  _oldDisplay: ?string;
  constructor() {
    this.name = 'status-bar';
    this._oldDisplay = null;
  }
  isVisible(): boolean {
    return this._getStatusBarElement() != null && this._oldDisplay == null;
  }
  toggle(): void {
    const element = this._getStatusBarElement();
    if (element == null) {
      return;
    }
    if (this.isVisible()) {
      this._oldDisplay = element.style.display;
      element.style.display = 'none';
    } else {
      // isVisible is false, so oldDisplay is non-null
      invariant(this._oldDisplay != null);
      element.style.display = this._oldDisplay;
      this._oldDisplay = null;
    }
  }
  _getStatusBarElement(): ?HTMLElement {
    return document.querySelector('status-bar');
  }
}
