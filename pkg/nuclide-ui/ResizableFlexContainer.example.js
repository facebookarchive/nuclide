'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResizableFlexContainerExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _ResizableFlexContainer;

function _load_ResizableFlexContainer() {
  return _ResizableFlexContainer = require('./ResizableFlexContainer');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const ResizableFlexContainerExample = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    'div',
    { style: { display: 'flex', height: 100 } },
    _react.createElement(
      (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexContainer,
      { direction: (_ResizableFlexContainer || _load_ResizableFlexContainer()).FlexDirections.HORIZONTAL },
      _react.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        'HORIZONTAL Content1 (1 flex scale)'
      ),
      _react.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 0.5 },
        'HORIZONTAL Content2 (0.5 flex scale)'
      )
    )
  ),
  _react.createElement(
    'div',
    { style: { display: 'flex', height: 200 } },
    _react.createElement(
      (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexContainer,
      {
        direction: (_ResizableFlexContainer || _load_ResizableFlexContainer()).FlexDirections.VERTICAL,
        flexScales: [0.5, 1, 0.5] },
      _react.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 0.5 },
        'VERTICAL Content1 (0.5 flex scale)'
      ),
      _react.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        'VERTICAL Content2 (1 flex scale)'
      ),
      _react.createElement(
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