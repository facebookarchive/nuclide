'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResizableFlexContainerExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _ResizableFlexContainer;

function _load_ResizableFlexContainer() {
  return _ResizableFlexContainer = require('./ResizableFlexContainer');
}

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

const ResizableFlexContainerExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    'div',
    { style: { display: 'flex', height: 100 } },
    _react.default.createElement(
      (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexContainer,
      { direction: (_ResizableFlexContainer || _load_ResizableFlexContainer()).FlexDirections.HORIZONTAL },
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        'HORIZONTAL Content1 (1 flex scale)'
      ),
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 0.5 },
        'HORIZONTAL Content2 (0.5 flex scale)'
      )
    )
  ),
  _react.default.createElement(
    'div',
    { style: { display: 'flex', height: 200 } },
    _react.default.createElement(
      (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexContainer,
      {
        direction: (_ResizableFlexContainer || _load_ResizableFlexContainer()).FlexDirections.VERTICAL,
        flexScales: [0.5, 1, 0.5] },
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 0.5 },
        'VERTICAL Content1 (0.5 flex scale)'
      ),
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        'VERTICAL Content2 (1 flex scale)'
      ),
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 0.5 },
        'VERTICAL Content3 (0.5 flex scale)'
      )
    )
  )
);

const ResizableFlexContainerExamples = exports.ResizableFlexContainerExamples = {
  sectionName: 'ResizableFlexContainer',
  description: 'Flex container to host resizable elements',
  examples: [{
    title: 'Flex Container Example',
    component: ResizableFlexContainerExample
  }]
};