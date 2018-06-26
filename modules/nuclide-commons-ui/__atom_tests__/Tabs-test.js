'use strict';

var _Tabs;

function _load_Tabs() {
  return _Tabs = _interopRequireDefault(require('../Tabs'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _testUtils;

function _load_testUtils() {
  return _testUtils = _interopRequireDefault(require('react-dom/test-utils'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const {
  Simulate,
  // $FlowFixMe(>=0.66.0) Flow suppress
  SimulateNative,
  renderIntoDocument,
  scryRenderedDOMComponentsWithClass
} = (_testUtils || _load_testUtils()).default;

describe('Checkbox', () => {
  it('notifies callback of tab changes', () => {
    const onChange = jest.fn();

    const props = {
      tabs: [{ name: 'first', tabContent: _react.createElement(
          'i',
          null,
          '123'
        ) }, { name: 'second', tabContent: _react.createElement(
          'i',
          null,
          '456'
        ) }],
      activeTabName: 'first',
      onActiveTabChange: onChange
    };
    const component = renderIntoDocument(_react.createElement((_Tabs || _load_Tabs()).default, props));
    const node = scryRenderedDOMComponentsWithClass(component, 'title')[1];

    Simulate.click(node);

    expect(onChange).toHaveBeenCalledWith(props.tabs[1]);
  });

  it('should work with customized event types', () => {
    const onChange = jest.fn();

    const props = {
      tabs: [{ name: 'first', tabContent: _react.createElement(
          'i',
          null,
          '123'
        ) }, { name: 'second', tabContent: _react.createElement(
          'i',
          null,
          '456'
        ) }],
      activeTabName: 'first',
      triggeringEvent: 'onMouseEnter',
      onActiveTabChange: onChange
    };
    const component = renderIntoDocument(_react.createElement((_Tabs || _load_Tabs()).default, props));
    const node = scryRenderedDOMComponentsWithClass(component, 'title')[1];

    // `Simulate` does not currently support mouseEnter: https://github.com/facebook/react/issues/1297.
    SimulateNative.mouseOver(_reactDom.default.findDOMNode(node));

    expect(onChange).toHaveBeenCalledWith(props.tabs[1]);
  });
});