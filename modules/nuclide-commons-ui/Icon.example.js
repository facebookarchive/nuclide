"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IconExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("./Icon");

  _Icon = function () {
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
const IconExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Icon().Icon, {
  icon: "gift"
}), React.createElement(_Icon().Icon, {
  icon: "heart"
}), React.createElement(_Icon().Icon, {
  icon: "info"
})));

const IconWithTextExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement("div", null, React.createElement(_Icon().Icon, {
  icon: "gift"
}, "gift")), React.createElement("div", null, React.createElement(_Icon().Icon, {
  icon: "heart"
}, "heart")), React.createElement("div", null, React.createElement(_Icon().Icon, {
  icon: "info"
}, "info"))));

const IconExamples = {
  sectionName: 'Icons',
  description: 'Octicons with optional text.',
  examples: [{
    title: 'Icons',
    component: IconExample
  }, {
    title: 'You can pass optional text as children.',
    component: IconWithTextExample
  }]
};
exports.IconExamples = IconExamples;