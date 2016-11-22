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
exports.Panel = undefined;

var _PanelComponent;

function _load_PanelComponent() {
  return _PanelComponent = require('../../../nuclide-ui/PanelComponent');
}

var _View;

function _load_View() {
  return _View = require('../../../nuclide-ui/View');
}

var _reactForAtom = require('react-for-atom');

let Panel = exports.Panel = class Panel extends _reactForAtom.React.Component {

  _getInitialSize() {
    if (this.props.initialSize != null) {
      return this.props.initialSize;
    }

    // The item may not have been activated yet. If that's the case, just use the first item.
    const activePaneItem = this.props.paneContainer.getActivePaneItem() || this.props.paneContainer.getPaneItems()[0];
    if (activePaneItem != null) {
      return getPreferredInitialSize(activePaneItem, this.props.position);
    }
  }

  render() {
    if (this.props.paneContainer == null) {
      return null;
    }
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-workspace-views-panel' },
      _reactForAtom.React.createElement(
        (_PanelComponent || _load_PanelComponent()).PanelComponent,
        {
          initialLength: this._getInitialSize() || undefined,
          noScroll: true,
          onResize: this.props.onResize,
          dock: this.props.position },
        _reactForAtom.React.createElement((_View || _load_View()).View, { item: this.props.paneContainer })
      )
    );
  }

};


function getPreferredInitialSize(item, position) {
  switch (position) {
    case 'top':
    case 'bottom':
      return typeof item.getPreferredInitialHeight === 'function' ? item.getPreferredInitialHeight() : null;
    case 'left':
    case 'right':
      return typeof item.getPreferredInitialWidth === 'function' ? item.getPreferredInitialWidth() : null;
    default:
      throw new Error(`Invalid position: ${ position }`);
  }
}