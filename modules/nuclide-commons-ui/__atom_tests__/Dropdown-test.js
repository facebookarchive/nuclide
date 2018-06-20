'use strict';

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../Dropdown');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _testUtils;

function _load_testUtils() {
  return _testUtils = _interopRequireDefault(require('react-dom/test-utils'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

const { renderIntoDocument, scryRenderedDOMComponentsWithTag } = (_testUtils || _load_testUtils()).default;

describe('Dropdown', () => {
  it('honors the value param', () => {
    const component = renderIntoDocument(_react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
      options: [{ label: 'foo', value: 'vfoo' }, { label: 'bar', value: 'vbar' }],
      onChange: newValue => {},
      value: 'vbar'
    }));

    const button = scryRenderedDOMComponentsWithTag(component, 'button');
    // $FlowFixMe
    expect(_reactDom.default.findDOMNode(button[0]).innerText).toBe('bar');
  });
});