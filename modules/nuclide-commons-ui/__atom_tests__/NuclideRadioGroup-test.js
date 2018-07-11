"use strict";

function _RadioGroup() {
  const data = _interopRequireDefault(require("../RadioGroup"));

  _RadioGroup = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _testUtils() {
  const data = _interopRequireDefault(require("react-dom/test-utils"));

  _testUtils = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */

/* global Element */
const {
  Simulate,
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag
} = _testUtils().default;

describe('RadioGroup', () => {
  it('honors the selectedIndex param', () => {
    const component = renderIntoDocument(React.createElement(_RadioGroup().default, {
      optionLabels: ['foo', 'bar'],
      selectedIndex: 1
    }));
    expect(component.props.selectedIndex).toBe(1);
    const radioInputs = scryRenderedDOMComponentsWithTag(component, 'input'); // $FlowFixMe

    expect(_reactDom.default.findDOMNode(radioInputs[0]).checked).toBe(false); // $FlowFixMe

    expect(_reactDom.default.findDOMNode(radioInputs[1]).checked).toBe(true);
  });
  it('should use the correct, unique radio group name', () => {
    const props = {
      optionLabels: ['foo', 'bar'],
      selectedIndex: 1
    };
    const component = renderIntoDocument(React.createElement(_RadioGroup().default, props));
    const radioInputs = scryRenderedDOMComponentsWithTag(component, 'input'); // Global uid is `1` as this point, since this is the second RadioGroup component to be created.
    // $FlowFixMe

    expect(_reactDom.default.findDOMNode(radioInputs[0]).getAttribute('name')).toEqual('radiogroup-1'); // $FlowFixMe

    expect(_reactDom.default.findDOMNode(radioInputs[1]).getAttribute('name')).toEqual('radiogroup-1');
    const component2 = renderIntoDocument(React.createElement(_RadioGroup().default, props));
    const radioInputs2 = scryRenderedDOMComponentsWithTag(component2, 'input'); // $FlowFixMe

    expect(_reactDom.default.findDOMNode(radioInputs2[0]).getAttribute('name')).toEqual('radiogroup-2'); // $FlowFixMe

    expect(_reactDom.default.findDOMNode(radioInputs2[1]).getAttribute('name')).toEqual('radiogroup-2');
  });
  it('calls its onSelectedChange handler when a radio input is changed', () => {
    const onSelectedChange = jest.fn();
    const props = {
      optionLabels: ['foo', 'bar'],
      selectedIndex: 0,
      onSelectedChange
    };
    const component = renderIntoDocument(React.createElement(_RadioGroup().default, props));
    const radioInputs = scryRenderedDOMComponentsWithTag(component, 'input');
    const secondRadioElement = radioInputs[1];

    if (!(secondRadioElement instanceof Element)) {
      throw new Error("Invariant violation: \"secondRadioElement instanceof Element\"");
    }

    const foundRadio = _reactDom.default.findDOMNode(secondRadioElement);

    if (!(foundRadio instanceof Element)) {
      throw new Error("Invariant violation: \"foundRadio instanceof Element\"");
    }

    Simulate.change(foundRadio);
    expect(onSelectedChange.mock.calls[0][0]).toEqual(1);
  });
});