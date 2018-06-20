'use strict';

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../Checkbox');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _testUtils;

function _load_testUtils() {
  return _testUtils = _interopRequireDefault(require('react-dom/test-utils'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let hostEl; /**
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

function createWithProps(props) {
  return _reactDom.default.render(_react.createElement((_Checkbox || _load_Checkbox()).Checkbox, props), (0, (_nullthrows || _load_nullthrows()).default)(hostEl));
}

describe('Checkbox', () => {
  beforeEach(() => {
    hostEl = document.createElement('div');
  });

  afterEach(() => {
    _reactDom.default.unmountComponentAtNode(hostEl);
    hostEl = null;
  });

  it('onChange handler fires when change event dispatched from checkbox', () => {
    const onChange = jest.fn();
    const reactElement = createWithProps({
      checked: false,
      label: 'click me!',
      onChange
    });

    const inputEl = (0, (_nullthrows || _load_nullthrows()).default)((_testUtils || _load_testUtils()).default.findRenderedDOMComponentWithTag(reactElement, 'input'));
    // Unfortunately, TestUtils does not seem to turn a click into a change event for a checkbox.
    (_testUtils || _load_testUtils()).default.Simulate.change(inputEl);
    expect(onChange.mock.calls.length).toBe(1);

    // Nor does it seem to change the state of the checkbox, as the following fails:
    //   expect(inputEl.checked).toBe(true);
    // Presumably this is because TestUtils deals only with synthetic events, not native ones.
  });

  it('sets `indeterminate` on the element instance', () => {
    const reactElement = createWithProps({
      checked: false,
      indeterminate: true,
      label: 'click me!',
      onChange() {}
    });

    const inputEl = (0, (_nullthrows || _load_nullthrows()).default)((_testUtils || _load_testUtils()).default.findRenderedDOMComponentWithTag(reactElement, 'input'));
    expect(inputEl.indeterminate).toBe(true);
  });
});