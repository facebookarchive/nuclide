"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HighlightExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Highlight() {
  const data = require("./Highlight");

  _Highlight = function () {
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
const HighlightExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Highlight().Highlight, null, "Default")), React.createElement(_Block().Block, null, React.createElement(_Highlight().Highlight, {
  color: _Highlight().HighlightColors.info
}, "Info")), React.createElement(_Block().Block, null, React.createElement(_Highlight().Highlight, {
  color: _Highlight().HighlightColors.success
}, "Success")), React.createElement(_Block().Block, null, React.createElement(_Highlight().Highlight, {
  color: _Highlight().HighlightColors.warning
}, "Warning")), React.createElement(_Block().Block, null, React.createElement(_Highlight().Highlight, {
  color: _Highlight().HighlightColors.error
}, "Error")));

const HighlightExamples = {
  sectionName: 'Highlight',
  description: 'Highlights are useful for calling out inline content, such as tags.',
  examples: [{
    title: 'Highlights',
    component: HighlightExample
  }]
};
exports.HighlightExamples = HighlightExamples;