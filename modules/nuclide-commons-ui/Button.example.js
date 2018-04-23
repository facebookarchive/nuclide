'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.ButtonExamples = undefined;











var _react = _interopRequireWildcard(require('react'));var _Button;
function _load_Button() {return _Button = require('./Button');}var _ButtonGroup;
function _load_ButtonGroup() {return _ButtonGroup = require('./ButtonGroup');}var _ButtonToolbar;
function _load_ButtonToolbar() {return _ButtonToolbar = require('./ButtonToolbar');}var _Block;
function _load_Block() {return _Block = require('./Block');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}

const ButtonSizeExample = () =>
_react.createElement((_Block || _load_Block()).Block, null,
  _react.createElement((_Button || _load_Button()).Button, { className: 'inline-block', size: 'EXTRA_SMALL' }, 'extra_small'),


  _react.createElement((_Button || _load_Button()).Button, { className: 'inline-block', size: 'SMALL' }, 'small'),


  _react.createElement((_Button || _load_Button()).Button, { className: 'inline-block' }, 'regular'),
  _react.createElement((_Button || _load_Button()).Button, { className: 'inline-block', size: 'LARGE' }, 'large')); /**
                                                                                                                     * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                     * All rights reserved.
                                                                                                                     *
                                                                                                                     * This source code is licensed under the BSD-style license found in the
                                                                                                                     * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                     * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                     *
                                                                                                                     * 
                                                                                                                     * @format
                                                                                                                     */const ButtonDisabledExample = () => _react.createElement((_Block || _load_Block()).Block, null, _react.createElement((_Button || _load_Button()).Button, { className: 'inline-block' }, 'enabled'), _react.createElement((_Button || _load_Button()).Button, { className: 'inline-block', disabled: true }, 'disabled'));




const ButtonColorExample = () =>
_react.createElement('div', null,
  _react.createElement((_Block || _load_Block()).Block, null,
    _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'PRIMARY' }, 'primary'),
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'INFO' }, 'info'),
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'SUCCESS' }, 'success'),
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'WARNING' }, 'warning'),
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'ERROR' }, 'error'))),


  _react.createElement((_Block || _load_Block()).Block, null,
    _react.createElement('p', null, 'selected:'),
    _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
      _react.createElement((_Button || _load_Button()).Button, { selected: true, buttonType: 'PRIMARY' }, 'primary'),


      _react.createElement((_Button || _load_Button()).Button, { selected: true, buttonType: 'INFO' }, 'info'),


      _react.createElement((_Button || _load_Button()).Button, { selected: true, buttonType: 'SUCCESS' }, 'success'),


      _react.createElement((_Button || _load_Button()).Button, { selected: true, buttonType: 'WARNING' }, 'warning'),


      _react.createElement((_Button || _load_Button()).Button, { selected: true, buttonType: 'ERROR' }, 'error'))));







const ButtonIconExample = () =>
_react.createElement((_Block || _load_Block()).Block, null,
  _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
    _react.createElement((_Button || _load_Button()).Button, { icon: 'gear' }),
    _react.createElement((_Button || _load_Button()).Button, { icon: 'cloud-download' }),
    _react.createElement((_Button || _load_Button()).Button, { icon: 'code' }),
    _react.createElement((_Button || _load_Button()).Button, { icon: 'check' }),
    _react.createElement((_Button || _load_Button()).Button, { icon: 'device-mobile' }),
    _react.createElement((_Button || _load_Button()).Button, { icon: 'alert' })));




const ButtonGroupExample = () =>
_react.createElement('div', null,
  _react.createElement((_Block || _load_Block()).Block, null,
    _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, { size: 'EXTRA_SMALL' },
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'SUCCESS' }, 'extra small'),
      _react.createElement((_Button || _load_Button()).Button, null, 'button'),
      _react.createElement((_Button || _load_Button()).Button, null, 'group'))),


  _react.createElement((_Block || _load_Block()).Block, null,
    _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, { size: 'SMALL' },
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'SUCCESS' }, 'small'),
      _react.createElement((_Button || _load_Button()).Button, null, 'button'),
      _react.createElement((_Button || _load_Button()).Button, null, 'group'))),


  _react.createElement((_Block || _load_Block()).Block, null,
    _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'SUCCESS' }, 'regular'),
      _react.createElement((_Button || _load_Button()).Button, null, 'button'),
      _react.createElement((_Button || _load_Button()).Button, null, 'group'))),


  _react.createElement((_Block || _load_Block()).Block, null,
    _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, { size: 'LARGE' },
      _react.createElement((_Button || _load_Button()).Button, { buttonType: 'SUCCESS' }, 'large'),
      _react.createElement((_Button || _load_Button()).Button, null, 'button'),
      _react.createElement((_Button || _load_Button()).Button, null, 'group'))));





const ButtonToolbarExample = () =>
_react.createElement('div', null,
  _react.createElement((_Block || _load_Block()).Block, null,
    _react.createElement((_ButtonToolbar || _load_ButtonToolbar()).ButtonToolbar, null,
      _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
        _react.createElement((_Button || _load_Button()).Button, null, 'ButtonGroup'),
        _react.createElement((_Button || _load_Button()).Button, null, 'in a'),
        _react.createElement((_Button || _load_Button()).Button, null, 'toolbar')),

      _react.createElement((_Button || _load_Button()).Button, null, 'single buttons'),
      _react.createElement((_Button || _load_Button()).Button, null, 'in toolbar'))));





const ButtonExamples = exports.ButtonExamples = {
  sectionName: 'Buttons',
  description: 'For clicking things.',
  examples: [
  {
    title: 'Button sizes',
    component: ButtonSizeExample },

  {
    title: 'Disabled/enabled',
    component: ButtonDisabledExample },

  {
    title: 'Button colors',
    component: ButtonColorExample },

  {
    title: 'Buttons with icons',
    component: ButtonIconExample },

  {
    title: 'Button Group',
    component: ButtonGroupExample },

  {
    title: 'Button Toolbar',
    component: ButtonToolbarExample }] };