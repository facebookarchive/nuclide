'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProgressIndicatorExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _ProgressBar;

function _load_ProgressBar() {
  return _ProgressBar = require('./ProgressBar');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('./LoadingSpinner');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const ProgressBarExample = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_ProgressBar || _load_ProgressBar()).ProgressBar, null)
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_ProgressBar || _load_ProgressBar()).ProgressBar, { max: 100, value: 0 })
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_ProgressBar || _load_ProgressBar()).ProgressBar, { max: 100, value: 50 })
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_ProgressBar || _load_ProgressBar()).ProgressBar, { max: 100, value: 100 })
  )
);

const LoadingSpinnerExample = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL' })
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'SMALL' })
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'MEDIUM' })
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'LARGE' })
  )
);

const ProgressIndicatorExamples = exports.ProgressIndicatorExamples = {
  sectionName: 'Progress Indicators',
  description: 'Show that work is being performed. Consider using one of these for any work > 1s.',
  examples: [{
    title: 'ProgressBar',
    component: ProgressBarExample
  }, {
    title: 'LoadingSpinner',
    component: LoadingSpinnerExample
  }]
};