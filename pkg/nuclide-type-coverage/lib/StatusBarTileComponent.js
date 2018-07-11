"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusBarTileComponent = void 0;

function _UnstyledButton() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/UnstyledButton"));

  _UnstyledButton = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Icon() {
  const data = require("../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const REALLY_BAD_THRESHOLD = 50;
const NOT_GREAT_THRESHOLD = 80;
const COLOR_DISPLAY_SETTING = 'nuclide-type-coverage.colorizeStatusBar';

class StatusBarTileComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const result = this.props.result;

    if (result != null) {
      const percentage = result.percentage;
      let colorClasses = {};

      if (_featureConfig().default.get(COLOR_DISPLAY_SETTING)) {
        colorClasses = {
          'text-error': percentage <= REALLY_BAD_THRESHOLD,
          'text-warning': percentage > REALLY_BAD_THRESHOLD && percentage <= NOT_GREAT_THRESHOLD,
          // Nothing applied if percentage > NOT_GREAT_THRESHOLD,
          'nuclide-type-coverage-status-bar-active': this.props.isActive
        };
      }

      const classes = (0, _classnames().default)(Object.assign({
        'inline-block': true,
        'nuclide-type-coverage-status-bar': true,
        'nuclide-type-coverage-status-bar-pending': this.props.pending,
        'nuclide-type-coverage-status-bar-ready': !this.props.pending
      }, colorClasses));
      const formattedPercentage = `${Math.floor(percentage)}%`;
      const tooltipString = getTooltipString(formattedPercentage, result.providerName);
      return React.createElement(_UnstyledButton().default, {
        onClick: this.props.onClick,
        className: classes // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        ,
        ref: (0, _addTooltip().default)({
          title: tooltipString,
          delay: 0,
          placement: 'top'
        })
      }, result.icon == null ? null : React.createElement(_Icon().Icon, {
        icon: result.icon
      }), React.createElement("span", {
        className: "nuclide-type-coverage-status-bar-percentage"
      }, formattedPercentage));
    } else {
      return null;
    }
  }

}

exports.StatusBarTileComponent = StatusBarTileComponent;

function getTooltipString(formattedPercentage, providerName) {
  return `This file is ${formattedPercentage} covered by ${providerName}.<br/>` + 'Click to toggle display of uncovered areas.';
}