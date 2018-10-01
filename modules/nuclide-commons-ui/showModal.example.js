"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("./Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _showModal() {
  const data = _interopRequireDefault(require("./showModal"));

  _showModal = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
function ModalButton() {
  return React.createElement(_Button().Button, {
    onClick: showExampleModal
  }, "Show Modal");
}

function showExampleModal() {
  (0, _showModal().default)(({
    dismiss
  }) => {
    return React.createElement("div", null, React.createElement("div", null, "I'm a modal. You can add any content you like. I have all the standard behavior, like obeying the \"core:cancel\" command!"), React.createElement(_Button().Button, {
      onClick: dismiss
    }, "Hide Modal"));
  });
}

const ModalExamples = {
  sectionName: 'Modal',
  description: 'Overlays that cover the entire screen. ',
  examples: [{
    title: 'Click the button to toggle a modal:',
    component: ModalButton
  }]
};
exports.ModalExamples = ModalExamples;