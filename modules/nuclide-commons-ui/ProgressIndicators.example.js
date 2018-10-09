"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProgressIndicatorExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _ProgressBar() {
  const data = require("./ProgressBar");

  _ProgressBar = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("./LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const ProgressBarExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_ProgressBar().ProgressBar, null)), React.createElement(_Block().Block, null, React.createElement(_ProgressBar().ProgressBar, {
  max: 100,
  value: 0
})), React.createElement(_Block().Block, null, React.createElement(_ProgressBar().ProgressBar, {
  max: 100,
  value: 50
})), React.createElement(_Block().Block, null, React.createElement(_ProgressBar().ProgressBar, {
  max: 100,
  value: 100
})));

const LoadingSpinnerExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_LoadingSpinner().LoadingSpinner, {
  size: "EXTRA_SMALL"
})), React.createElement(_Block().Block, null, React.createElement(_LoadingSpinner().LoadingSpinner, {
  size: "SMALL"
})), React.createElement(_Block().Block, null, React.createElement(_LoadingSpinner().LoadingSpinner, {
  size: "MEDIUM"
})), React.createElement(_Block().Block, null, React.createElement(_LoadingSpinner().LoadingSpinner, {
  size: "LARGE"
})));

const ProgressIndicatorExamples = {
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
exports.ProgressIndicatorExamples = ProgressIndicatorExamples;