'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PulseButtonExample = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _PulseButtonWithTooltip;

function _load_PulseButtonWithTooltip() {
  return _PulseButtonWithTooltip = _interopRequireDefault(require('./PulseButtonWithTooltip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Example extends _react.Component {
  render() {
    return _react.createElement(
      'div',
      null,
      _react.createElement(
        (_Block || _load_Block()).Block,
        null,
        _react.createElement(
          'div',
          {
            style: {
              height: 100,
              width: '100%',
              display: 'flex'
            } },
          _react.createElement((_PulseButtonWithTooltip || _load_PulseButtonWithTooltip()).default, {
            ariaLabel: 'New feature!',
            wrapperStyle: { margin: 'auto' },
            tooltipText: 'Look I\'m a tooltip!'
          })
        )
      )
    );
  }
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   *  strict-local
   * @format
   */

const PulseButtonExample = exports.PulseButtonExample = {
  sectionName: 'PulseButton',
  description: 'A glowing button that often triggers a dismissable tooltip',
  examples: [{
    title: 'PulseButton',
    component: Example
  }]
};