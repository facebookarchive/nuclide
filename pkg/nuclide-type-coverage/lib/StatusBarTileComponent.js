Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibAddTooltip2;

function _nuclideUiLibAddTooltip() {
  return _nuclideUiLibAddTooltip2 = _interopRequireDefault(require('../../nuclide-ui/lib/add-tooltip'));
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var REALLY_BAD_THRESHOLD = 50;
var NOT_GREAT_THRESHOLD = 80;
var COLOR_DISPLAY_SETTING = 'nuclide-type-coverage.colorizeStatusBar';

var StatusBarTileComponent = (function (_React$Component) {
  _inherits(StatusBarTileComponent, _React$Component);

  function StatusBarTileComponent(props) {
    _classCallCheck(this, StatusBarTileComponent);

    _get(Object.getPrototypeOf(StatusBarTileComponent.prototype), 'constructor', this).call(this, props);
  }

  _createClass(StatusBarTileComponent, [{
    key: 'render',
    value: function render() {
      var result = this.props.result;
      if (result != null) {
        var _percentage = result.percentage;
        var colorClasses = {};
        if ((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get(COLOR_DISPLAY_SETTING)) {
          colorClasses = {
            'text-error': _percentage <= REALLY_BAD_THRESHOLD,
            'text-warning': _percentage > REALLY_BAD_THRESHOLD && _percentage <= NOT_GREAT_THRESHOLD,
            // Nothing applied if percentage > NOT_GREAT_THRESHOLD,
            'nuclide-type-coverage-status-bar-active': this.props.isActive
          };
        }
        var classes = (0, (_classnames2 || _classnames()).default)(_extends({
          'nuclide-type-coverage-status-bar-pending': this.props.pending,
          'nuclide-type-coverage-status-bar-ready': !this.props.pending
        }, colorClasses));
        var formattedPercentage = Math.floor(_percentage) + '%';
        var tooltipString = getTooltipString(formattedPercentage, result.providerName);
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          {
            style: { cursor: 'pointer' },
            onClick: this.props.onClick,
            className: classes,
            ref: (0, (_nuclideUiLibAddTooltip2 || _nuclideUiLibAddTooltip()).default)({
              title: tooltipString,
              delay: 0,
              placement: 'top'
            }) },
          formattedPercentage
        );
      } else {
        return null;
      }
    }
  }]);

  return StatusBarTileComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.StatusBarTileComponent = StatusBarTileComponent;

function getTooltipString(formattedPercentage, providerName) {
  return 'This file is ' + formattedPercentage + ' covered by ' + providerName + '.<br/>' + 'Click to toggle display of uncovered areas.';
}

// true iff we are currently displaying uncovered regions in the editor.