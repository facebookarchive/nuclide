"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Toolbar() {
  const data = require("./Toolbar");

  _Toolbar = function () {
    return data;
  };

  return data;
}

function _ToolbarCenter() {
  const data = require("./ToolbarCenter");

  _ToolbarCenter = function () {
    return data;
  };

  return data;
}

function _ToolbarLeft() {
  const data = require("./ToolbarLeft");

  _ToolbarLeft = function () {
    return data;
  };

  return data;
}

function _ToolbarRight() {
  const data = require("./ToolbarRight");

  _ToolbarRight = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("./Button");

  _Button = function () {
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
const ToolbarExampleLeft = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Toolbar().Toolbar, {
  location: "top"
}, React.createElement(_ToolbarLeft().ToolbarLeft, null, React.createElement("div", null, "a toolbar can have multiple children,"), React.createElement(_Button().Button, null, "such as this button.")))), React.createElement(_Block().Block, null, React.createElement("div", null, "Be sure to use ", '<ToolbarLeft/>, <ToolbarLeft/>, and <ToolbarLeft/>', " as children.")));

const ToolbarExampleCenter = () => React.createElement(_Block().Block, null, React.createElement(_Toolbar().Toolbar, {
  location: "top"
}, React.createElement(_ToolbarCenter().ToolbarCenter, null, React.createElement("div", null, "Example of ", '<ToolbarCenter />', "."))));

const ToolbarExampleRight = () => React.createElement(_Block().Block, null, React.createElement(_Toolbar().Toolbar, {
  location: "top"
}, React.createElement(_ToolbarRight().ToolbarRight, null, React.createElement("div", null, "Example of ", '<ToolbarRight />'))));

const ToolbarExampleMultiple = () => React.createElement(_Block().Block, null, React.createElement(_Toolbar().Toolbar, {
  location: "top"
}, React.createElement(_ToolbarLeft().ToolbarLeft, null, React.createElement("div", null, "You can combine")), React.createElement(_ToolbarCenter().ToolbarCenter, null, React.createElement("div", null, "the various kinds")), React.createElement(_ToolbarRight().ToolbarRight, null, React.createElement("div", null, "of aligners."))));

const ToolbarExamples = {
  sectionName: 'Toolbar',
  description: '',
  examples: [{
    title: 'Left Toolbar',
    component: ToolbarExampleLeft
  }, {
    title: 'Center Toolbar',
    component: ToolbarExampleCenter
  }, {
    title: 'Right Toolbar',
    component: ToolbarExampleRight
  }, {
    title: 'Combining Toolbar aligners',
    component: ToolbarExampleMultiple
  }]
};
exports.ToolbarExamples = ToolbarExamples;