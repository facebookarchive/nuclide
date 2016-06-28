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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _Block2;

function _Block() {
  return _Block2 = require('./Block');
}

var _Listview2;

function _Listview() {
  return _Listview2 = require('./Listview');
}

var _Checkbox2;

function _Checkbox() {
  return _Checkbox2 = require('./Checkbox');
}

var NOOP = function NOOP() {};

var ListviewExample1 = function ListviewExample1() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Listview2 || _Listview()).Listview,
      { alternateBackground: true },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        'test'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        'test'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        'test'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        'test'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        'test'
      )
    )
  );
};
var ListviewExample2 = function ListviewExample2() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Listview2 || _Listview()).Listview,
      { alternateBackground: true },
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Checkbox2 || _Checkbox()).Checkbox, {
        checked: true,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Checkbox2 || _Checkbox()).Checkbox, {
        checked: true,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Checkbox2 || _Checkbox()).Checkbox, {
        checked: true,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Checkbox2 || _Checkbox()).Checkbox, {
        checked: false,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Checkbox2 || _Checkbox()).Checkbox, {
        checked: false,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    )
  );
};

var ListviewExamples = {
  sectionName: 'Listview',
  description: '',
  examples: [{
    title: 'Simple Listview',
    component: ListviewExample1
  }, {
    title: 'Arbitrary components as list items',
    component: ListviewExample2
  }]
};
exports.ListviewExamples = ListviewExamples;