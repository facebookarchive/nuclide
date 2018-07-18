"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FullWidthProgressBarExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("../../modules/nuclide-commons-ui/Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _FullWidthProgressBar() {
  const data = _interopRequireDefault(require("./FullWidthProgressBar"));

  _FullWidthProgressBar = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const Wrapper = ({
  children
}) => React.createElement("div", {
  style: {
    position: 'relative',
    paddingBottom: 5
  }
}, children);

const FullWidthProgressBarExample = () => React.createElement("div", null, "0%:", React.createElement(_Block().Block, null, React.createElement(Wrapper, null, React.createElement(_FullWidthProgressBar().default, {
  progress: 0,
  visible: true
}))), "50%:", React.createElement(_Block().Block, null, React.createElement(Wrapper, null, React.createElement(_FullWidthProgressBar().default, {
  progress: 0.5,
  visible: true
}))), "100%:", React.createElement(_Block().Block, null, React.createElement(Wrapper, null, React.createElement(_FullWidthProgressBar().default, {
  progress: 1,
  visible: true
}))), "Indeterminate (progress=null):", React.createElement(_Block().Block, null, React.createElement(Wrapper, null, React.createElement(_FullWidthProgressBar().default, {
  progress: null,
  visible: true
}))));

const FullWidthProgressBarExamples = {
  sectionName: 'FullWidthProgressBar',
  description: 'A subtle progress indicator that stretches across an entire pane or panel, indicating general progress.',
  examples: [{
    title: 'FullWidthProgressBar',
    component: FullWidthProgressBarExample
  }]
};
exports.FullWidthProgressBarExamples = FullWidthProgressBarExamples;