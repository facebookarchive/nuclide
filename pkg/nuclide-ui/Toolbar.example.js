'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarExamples = undefined;

var _reactForAtom = require('react-for-atom');

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

const ToolbarExampleLeft = () => _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      (_Toolbar || _load_Toolbar()).Toolbar,
      { location: 'top' },
      _reactForAtom.React.createElement(
        (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'a toolbar can have multiple children,'
        ),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'such as this button.'
        )
      )
    )
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      'div',
      null,
      'Be sure to use ',
      '<ToolbarLeft/>, <ToolbarLeft/>, and <ToolbarLeft/>',
      ' as children.'
    )
  )
);

const ToolbarExampleCenter = () => _reactForAtom.React.createElement(
  (_Block || _load_Block()).Block,
  null,
  _reactForAtom.React.createElement(
    (_Toolbar || _load_Toolbar()).Toolbar,
    { location: 'top' },
    _reactForAtom.React.createElement(
      (_ToolbarCenter || _load_ToolbarCenter()).ToolbarCenter,
      null,
      _reactForAtom.React.createElement(
        'div',
        null,
        'Example of ',
        '<ToolbarCenter />',
        '.'
      )
    )
  )
);

const ToolbarExampleRight = () => _reactForAtom.React.createElement(
  (_Block || _load_Block()).Block,
  null,
  _reactForAtom.React.createElement(
    (_Toolbar || _load_Toolbar()).Toolbar,
    { location: 'top' },
    _reactForAtom.React.createElement(
      (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
      null,
      _reactForAtom.React.createElement(
        'div',
        null,
        'Example of ',
        '<ToolbarRight />'
      )
    )
  )
);

const ToolbarExampleMultiple = () => _reactForAtom.React.createElement(
  (_Block || _load_Block()).Block,
  null,
  _reactForAtom.React.createElement(
    (_Toolbar || _load_Toolbar()).Toolbar,
    { location: 'top' },
    _reactForAtom.React.createElement(
      (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
      null,
      _reactForAtom.React.createElement(
        'div',
        null,
        'You can combine'
      )
    ),
    _reactForAtom.React.createElement(
      (_ToolbarCenter || _load_ToolbarCenter()).ToolbarCenter,
      null,
      _reactForAtom.React.createElement(
        'div',
        null,
        'the various kinds'
      )
    ),
    _reactForAtom.React.createElement(
      (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
      null,
      _reactForAtom.React.createElement(
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