'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


/**
 * A class that gives us an idempotent API for rendering panels, creating them lazily.
 */
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

class PanelRenderer {

  constructor(options) {
    this._createItem = options.createItem;
    this._location = options.location;
    this._priority = options.priority;
  }

  render(props) {
    if (props.visible) {
      if (this._panel == null) {
        const item = this._item == null ? this._item = this._createItem() : this._item;
        this._panel = addPanel(this._location, {
          item,
          priority: this._priority == null ? undefined : this._priority
        });
      } else {
        this._panel.show();
      }
    } else if (this._panel != null) {
      this._panel.hide();
    }
  }

  dispose() {
    if (this._item != null && typeof this._item.destroy === 'function') {
      this._item.destroy();
    }
    if (this._panel != null) {
      this._panel.destroy();
    }
  }
}

exports.default = PanelRenderer;
function addPanel(location, options) {
  switch (location) {
    case 'top':
      return atom.workspace.addTopPanel(options);
    case 'right':
      return atom.workspace.addRightPanel(options);
    case 'bottom':
      return atom.workspace.addBottomPanel(options);
    case 'left':
      return atom.workspace.addLeftPanel(options);
    default:
      throw new Error(`Invalid location: ${location}`);
  }
}