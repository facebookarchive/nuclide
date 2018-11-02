"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Message() {
  const data = require("./Message");

  _Message = function () {
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
const MessageExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Message().Message, null, React.createElement("h2", null, "Message"), "Hello, I'm a simple message.")), React.createElement(_Block().Block, null, React.createElement(_Message().Message, {
  type: _Message().MessageTypes.info
}, "Hello I'm an ", React.createElement("strong", null, "info"), " message.")), React.createElement(_Block().Block, null, React.createElement(_Message().Message, {
  type: _Message().MessageTypes.success
}, "Hello I'm a ", React.createElement("strong", null, "success"), " message.")), React.createElement(_Block().Block, null, React.createElement(_Message().Message, {
  type: _Message().MessageTypes.warning
}, "Hello I'm a ", React.createElement("strong", null, "warning"), " message.")), React.createElement(_Block().Block, null, React.createElement(_Message().Message, {
  type: _Message().MessageTypes.error
}, "Hello I'm an ", React.createElement("strong", null, "error"), " message.")));

const MessageExamples = {
  sectionName: 'Messages',
  description: 'Message boxes are used to surface issues, such as warnings, inline within Nuclide.',
  examples: [{
    title: 'Basic Messages',
    component: MessageExample
  }]
};
exports.MessageExamples = MessageExamples;