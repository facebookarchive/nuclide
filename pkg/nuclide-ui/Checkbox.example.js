Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('./Checkbox');
}

var NOOP = function NOOP() {};

var CheckboxExample = function CheckboxExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: false,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        onClick: NOOP,
        onChange: NOOP,
        checked: true,
        label: 'A checked Checkbox.'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        onClick: NOOP,
        onChange: NOOP,
        disabled: true,
        checked: false,
        label: 'A disabled Checkbox.'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        onClick: NOOP,
        onChange: NOOP,
        checked: true,
        disabled: true,
        label: 'A disabled, checked Checkbox.'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        onClick: NOOP,
        onChange: NOOP,
        indeterminate: true,
        checked: false,
        label: 'An indeterminate Checkbox.'
      })
    )
  );
};

var CheckboxExamples = {
  sectionName: 'Checkbox',
  description: '',
  examples: [{
    title: '',
    component: CheckboxExample
  }]
};
exports.CheckboxExamples = CheckboxExamples;