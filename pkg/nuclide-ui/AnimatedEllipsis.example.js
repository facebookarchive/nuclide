"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnimatedEllipsisExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("../../modules/nuclide-commons-ui/Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _AnimatedEllipsis() {
  const data = _interopRequireDefault(require("./AnimatedEllipsis"));

  _AnimatedEllipsis = function () {
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
const BasicExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, "Still waiting", React.createElement(_AnimatedEllipsis().default, null)));

const AnimatedEllipsisExamples = {
  sectionName: 'AnimatedEllipsis',
  description: 'AnimatedEllipsis is an ellipsis (...) that animated automatically while preserving constant width.',
  examples: [{
    title: 'Example',
    component: BasicExample
  }]
};
exports.AnimatedEllipsisExamples = AnimatedEllipsisExamples;