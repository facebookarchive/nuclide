'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('./Toolbar');
}

var _ToolbarCenter;

function _load_ToolbarCenter() {
  return _ToolbarCenter = require('./ToolbarCenter');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('./ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('./ToolbarRight');
}

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const ToolbarExampleLeft = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      (_Toolbar || _load_Toolbar()).Toolbar,
      { location: 'top' },
      _react.createElement(
        (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
        null,
        _react.createElement(
          'div',
          null,
          'a toolbar can have multiple children,'
        ),
        _react.createElement(
          (_Button || _load_Button()).Button,
          null,
          'such as this button.'
        )
      )
    )
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      'div',
      null,
      'Be sure to use ',
      '<ToolbarLeft/>, <ToolbarLeft/>, and <ToolbarLeft/>',
      ' as children.'
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

const ToolbarExampleCenter = () => _react.createElement(
  (_Block || _load_Block()).Block,
  null,
  _react.createElement(
    (_Toolbar || _load_Toolbar()).Toolbar,
    { location: 'top' },
    _react.createElement(
      (_ToolbarCenter || _load_ToolbarCenter()).ToolbarCenter,
      null,
      _react.createElement(
        'div',
        null,
        'Example of ',
        '<ToolbarCenter />',
        '.'
      )
    )
  )
);

const ToolbarExampleRight = () => _react.createElement(
  (_Block || _load_Block()).Block,
  null,
  _react.createElement(
    (_Toolbar || _load_Toolbar()).Toolbar,
    { location: 'top' },
    _react.createElement(
      (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
      null,
      _react.createElement(
        'div',
        null,
        'Example of ',
        '<ToolbarRight />'
      )
    )
  )
);

const ToolbarExampleMultiple = () => _react.createElement(
  (_Block || _load_Block()).Block,
  null,
  _react.createElement(
    (_Toolbar || _load_Toolbar()).Toolbar,
    { location: 'top' },
    _react.createElement(
      (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
      null,
      _react.createElement(
        'div',
        null,
        'You can combine'
      )
    ),
    _react.createElement(
      (_ToolbarCenter || _load_ToolbarCenter()).ToolbarCenter,
      null,
      _react.createElement(
        'div',
        null,
        'the various kinds'
      )
    ),
    _react.createElement(
      (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
      null,
      _react.createElement(
        'div',
        null,
        'of aligners.'
      )
    )
  )
);

const ToolbarExamples = exports.ToolbarExamples = {
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