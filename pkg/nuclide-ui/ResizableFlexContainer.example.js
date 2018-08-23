"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResizableFlexContainerExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _ResizableFlexContainer() {
  const data = require("./ResizableFlexContainer");

  _ResizableFlexContainer = function () {
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
const ResizableFlexContainerExample = () => React.createElement("div", null, React.createElement("div", {
  style: {
    display: 'flex',
    height: 100
  }
}, React.createElement(_ResizableFlexContainer().ResizableFlexContainer, {
  direction: _ResizableFlexContainer().FlexDirections.HORIZONTAL
}, React.createElement(_ResizableFlexContainer().ResizableFlexItem, {
  initialFlexScale: 1
}, "HORIZONTAL Content1 (1 flex scale)"), React.createElement(_ResizableFlexContainer().ResizableFlexItem, {
  initialFlexScale: 0.5
}, "HORIZONTAL Content2 (0.5 flex scale)"))), React.createElement("div", {
  style: {
    display: 'flex',
    height: 200
  }
}, React.createElement(_ResizableFlexContainer().ResizableFlexContainer, {
  direction: _ResizableFlexContainer().FlexDirections.VERTICAL,
  flexScales: [0.5, 1, 0.5]
}, React.createElement(_ResizableFlexContainer().ResizableFlexItem, {
  initialFlexScale: 0.5
}, "VERTICAL Content1 (0.5 flex scale)"), React.createElement(_ResizableFlexContainer().ResizableFlexItem, {
  initialFlexScale: 1
}, "VERTICAL Content2 (1 flex scale)"), React.createElement(_ResizableFlexContainer().ResizableFlexItem, {
  initialFlexScale: 0.5
}, "VERTICAL Content3 (0.5 flex scale)"))));

const ResizableFlexContainerExamples = {
  sectionName: 'ResizableFlexContainer',
  description: 'Flex container to host resizable elements',
  examples: [{
    title: 'Flex Container Example',
    component: ResizableFlexContainerExample
  }]
};
exports.ResizableFlexContainerExamples = ResizableFlexContainerExamples;