"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelativeDateExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("../../modules/nuclide-commons-ui/Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _RelativeDate() {
  const data = _interopRequireDefault(require("./RelativeDate"));

  _RelativeDate = function () {
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
const RelativeDateExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement("div", null, "Updated every 10 seconds (default): \"", React.createElement(_RelativeDate().default, {
  date: new Date()
}), "\""), React.createElement("div", null, "Updated every 1 second: \"", React.createElement(_RelativeDate().default, {
  date: new Date(),
  delay: 1000
}), "\"")));

const RelativeDateExamples = {
  sectionName: 'Relative Date',
  description: 'Renders and periodically updates a relative date string.',
  examples: [{
    title: 'Simple relative date',
    component: RelativeDateExample
  }]
};
exports.RelativeDateExamples = RelativeDateExamples;