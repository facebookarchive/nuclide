'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListviewExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _ListView;

function _load_ListView() {
  return _ListView = require('./ListView');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _MultiSelectList;

function _load_MultiSelectList() {
  return _MultiSelectList = require('./MultiSelectList');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const NOOP = () => {}; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        * 
                        * @format
                        */

const ListviewExample1 = () => _react.createElement(
  (_Block || _load_Block()).Block,
  null,
  _react.createElement(
    (_ListView || _load_ListView()).ListView,
    { alternateBackground: true },
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      { value: { id: 1 } },
      'test1'
    ),
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      { value: { id: 2 } },
      'test2'
    ),
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      { value: { id: 3 } },
      'test3'
    ),
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      { value: { id: 4 } },
      'test4'
    ),
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      { value: { id: 5 } },
      'test5'
    )
  )
);
const ListviewExample2 = () => _react.createElement(
  (_Block || _load_Block()).Block,
  null,
  _react.createElement(
    (_ListView || _load_ListView()).ListView,
    { alternateBackground: true },
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      null,
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: true,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    ),
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      null,
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: true,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    ),
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      null,
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: true,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    ),
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      null,
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: false,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    ),
    _react.createElement(
      (_ListView || _load_ListView()).ListViewItem,
      null,
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: false,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    )
  )
);

class MultiSelectListExample extends _react.Component {
  constructor(props) {
    super(props);
    this.state = { value: [2] };
  }
  render() {
    const options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }, { value: 3, label: 'Three' }, { value: 4, label: 'Four' }];

    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement((_MultiSelectList || _load_MultiSelectList()).MultiSelectList, {
        options: options,
        value: this.state.value,
        onChange: value => {
          this.setState({ value });
        }
      })
    );
  }
}

const ListviewExamples = exports.ListviewExamples = {
  sectionName: 'ListView',
  description: '',
  examples: [{
    title: 'Simple ListView',
    component: ListviewExample1
  }, {
    title: 'Arbitrary components as list items',
    component: ListviewExample2
  }, {
    title: 'Multi-Select List',
    component: MultiSelectListExample
  }]
};