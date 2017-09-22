'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelativeDateExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _RelativeDate;

function _load_RelativeDate() {
  return _RelativeDate = _interopRequireDefault(require('./RelativeDate'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const RelativeDateExample = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      'div',
      null,
      'Updated every 10 seconds (default): "',
      _react.createElement((_RelativeDate || _load_RelativeDate()).default, { date: new Date() }),
      '"'
    ),
    _react.createElement(
      'div',
      null,
      'Updated every 1 second: "',
      _react.createElement((_RelativeDate || _load_RelativeDate()).default, { date: new Date(), delay: 1000 }),
      '"'
    )
  )
); /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

const RelativeDateExamples = exports.RelativeDateExamples = {
  sectionName: 'Relative Date',
  description: 'Renders and periodically updates a relative date string.',
  examples: [{
    title: 'Simple relative date',
    component: RelativeDateExample
  }]
};