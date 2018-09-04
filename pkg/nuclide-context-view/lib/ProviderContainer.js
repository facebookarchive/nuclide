"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProviderContainer = void 0;

var React = _interopRequireWildcard(require("react"));

function _Section() {
  const data = require("../../../modules/nuclide-commons-ui/Section");

  _Section = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/**
 * Each context provider view is rendered inside a ProviderContainer.
 */
class ProviderContainer extends React.Component {
  constructor(props) {
    super(props);

    this._setCollapsed = collapsed => {
      this.setState({
        collapsed
      });
      (0, _nuclideAnalytics().track)('nuclide-context-view-toggle-provider', {
        title: this.props.title,
        collapsed: String(collapsed)
      });
    };

    this.state = {
      collapsed: false
    };
  }

  render() {
    return React.createElement("div", {
      className: "nuclide-context-view-provider-container"
    }, React.createElement(_Section().Section, {
      headline: this.props.title,
      collapsable: true,
      onChange: this._setCollapsed,
      collapsed: this.state.collapsed
    }, React.createElement("div", {
      className: "padded"
    }, this.props.children)));
  }

}

exports.ProviderContainer = ProviderContainer;