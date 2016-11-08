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
exports.ProviderContainer = undefined;

var _reactForAtom = require('react-for-atom');

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

/**
 * Each context provider view is rendered inside a ProviderContainer.
 */
let ProviderContainer = exports.ProviderContainer = class ProviderContainer extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    };
    this._setCollapsed = this._setCollapsed.bind(this);
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-context-view-provider-container' },
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { headline: this.props.title,
          collapsable: true,
          onChange: this._setCollapsed,
          collapsed: this.state.collapsed },
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded' },
          this.props.children
        )
      )
    );
  }

  _setCollapsed(collapsed) {
    this.setState({ collapsed: collapsed });
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-context-view-toggle-provider', {
      title: this.props.title,
      collapsed: String(collapsed)
    });
  }
};