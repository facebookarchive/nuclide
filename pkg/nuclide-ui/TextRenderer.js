'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextRenderer = TextRenderer;

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function TextRenderer(evaluationResult) {
  const { type, value } = evaluationResult;
  if (type === 'text') {
    return _react.default.createElement(
      'span',
      null,
      value
    );
  } else {
    return null;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */