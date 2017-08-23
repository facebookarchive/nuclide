'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FullWidthProgressBarExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _FullWidthProgressBar;

function _load_FullWidthProgressBar() {
  return _FullWidthProgressBar = _interopRequireDefault(require('./FullWidthProgressBar'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Wrapper = ({ children }) => _react.default.createElement(
  'div',
  { style: { position: 'relative', paddingBottom: 5 } },
  children
); /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

const FullWidthProgressBarExample = () => _react.default.createElement(
  'div',
  null,
  '0%:',
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      Wrapper,
      null,
      _react.default.createElement((_FullWidthProgressBar || _load_FullWidthProgressBar()).default, { progress: 0, visible: true })
    )
  ),
  '50%:',
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      Wrapper,
      null,
      _react.default.createElement((_FullWidthProgressBar || _load_FullWidthProgressBar()).default, { progress: 0.5, visible: true })
    )
  ),
  '100%:',
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      Wrapper,
      null,
      _react.default.createElement((_FullWidthProgressBar || _load_FullWidthProgressBar()).default, { progress: 1, visible: true })
    )
  ),
  'Indeterminate (progress=null):',
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      Wrapper,
      null,
      _react.default.createElement((_FullWidthProgressBar || _load_FullWidthProgressBar()).default, { progress: null, visible: true })
    )
  )
);

const FullWidthProgressBarExamples = exports.FullWidthProgressBarExamples = {
  sectionName: 'FullWidthProgressBar',
  description: 'A subtle progress indicator that stretches across an entire pane or panel, indicating general progress.',
  examples: [{
    title: 'FullWidthProgressBar',
    component: FullWidthProgressBarExample
  }]
};