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
exports.CheckboxExamples = undefined;

var _reactForAtom = require('react-for-atom');

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('./Checkbox');
}

const NOOP = () => {};

const CheckboxExample = () => _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      checked: false,
      onClick: NOOP,
      onChange: NOOP,
      label: 'A Checkbox.'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      onClick: NOOP,
      onChange: NOOP,
      checked: true,
      label: 'A checked Checkbox.'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      onClick: NOOP,
      onChange: NOOP,
      disabled: true,
      checked: false,
      label: 'A disabled Checkbox.'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      onClick: NOOP,
      onChange: NOOP,
      checked: true,
      disabled: true,
      label: 'A disabled, checked Checkbox.'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      onClick: NOOP,
      onChange: NOOP,
      indeterminate: true,
      checked: false,
      label: 'An indeterminate Checkbox.'
    })
  )
);

const CheckboxExamples = exports.CheckboxExamples = {
  sectionName: 'Checkbox',
  description: '',
  examples: [{
    title: '',
    component: CheckboxExample
  }]
};