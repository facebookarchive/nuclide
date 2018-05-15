'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.ModalExamples = undefined;











var _react = _interopRequireWildcard(require('react'));var _Button;
function _load_Button() {return _Button = require('./Button');}var _showModal;
function _load_showModal() {return _showModal = _interopRequireDefault(require('./showModal'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}

function ModalButton() {
  return _react.createElement((_Button || _load_Button()).Button, { onClick: showExampleModal }, 'Show Modal');
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   *  strict-local
   * @format
   */function showExampleModal() {(0, (_showModal || _load_showModal()).default)(({ dismiss }) => {return _react.createElement('div', null, _react.createElement('div', null, 'I\'m a modal. You can add any content you like. I have all the standard behavior, like obeying the "core:cancel" command!'), _react.createElement((_Button || _load_Button()).Button, { onClick: dismiss }, 'Hide Modal'));


  });
}

const ModalExamples = exports.ModalExamples = {
  sectionName: 'Modal',
  description: 'Overlays that cover the entire screen. ',
  examples: [
  {
    title: 'Click the button to toggle a modal:',
    component: ModalButton }] };