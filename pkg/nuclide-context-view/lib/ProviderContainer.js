'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProviderContainer = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Each context provider view is rendered inside a ProviderContainer.
 */
class ProviderContainer extends _react.Component {
  constructor(props) {
    super(props);

    this._setCollapsed = collapsed => {
      this.setState({ collapsed });
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-context-view-toggle-provider', {
        title: this.props.title,
        collapsed: String(collapsed)
      });
    };

    this.state = {
      collapsed: false
    };
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'nuclide-context-view-provider-container' },
      _react.createElement(
        (_Section || _load_Section()).Section,
        {
          headline: this.props.title,
          collapsable: true,
          onChange: this._setCollapsed,
          collapsed: this.state.collapsed },
        _react.createElement(
          'div',
          { className: 'padded' },
          this.props.children
        )
      )
    );
  }

}
exports.ProviderContainer = ProviderContainer; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */