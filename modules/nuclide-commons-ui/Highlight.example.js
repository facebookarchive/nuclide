'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HighlightExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Highlight;

function _load_Highlight() {
  return _Highlight = require('./Highlight');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const HighlightExample = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      (_Highlight || _load_Highlight()).Highlight,
      null,
      'Default'
    )
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      (_Highlight || _load_Highlight()).Highlight,
      { color: (_Highlight || _load_Highlight()).HighlightColors.info },
      'Info'
    )
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      (_Highlight || _load_Highlight()).Highlight,
      { color: (_Highlight || _load_Highlight()).HighlightColors.success },
      'Success'
    )
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      (_Highlight || _load_Highlight()).Highlight,
      { color: (_Highlight || _load_Highlight()).HighlightColors.warning },
      'Warning'
    )
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      (_Highlight || _load_Highlight()).Highlight,
      { color: (_Highlight || _load_Highlight()).HighlightColors.error },
      'Error'
    )
  )
); /**
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

const HighlightExamples = exports.HighlightExamples = {
  sectionName: 'Highlight',
  description: 'Highlights are useful for calling out inline content, such as tags.',
  examples: [{
    title: 'Highlights',
    component: HighlightExample
  }]
};