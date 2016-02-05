'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const NuclideDropdown = require('../lib/NuclideDropdown');
const {
  React,
  ReactDOM,
  TestUtils,
} = require('react-for-atom');

const {
  Simulate,
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
} = TestUtils;

describe('NuclideDropdown', () => {

  it('honors the selectedIndex param', () => {
    const props = {
      menuItems: [
        {label: 'foo', value: 'vfoo'},
        {label: 'bar', value: 'vbar'},
      ],
      selectedIndex: 1,
      onSelectedChange: () => {},
    };
    const component = renderIntoDocument(
      <NuclideDropdown {...props} />
    );

    const select = scryRenderedDOMComponentsWithTag(component, 'select');
    expect(ReactDOM.findDOMNode(select[0]).selectedIndex).toBe(1);
    expect(ReactDOM.findDOMNode(select[0]).value).toBe('vbar');
  });

  it('calls the callback with the new index when a different menu item is selected', () => {
    let changedIndex;
    const onChange = index => {
      changedIndex = index;
    };
    const props = {
      menuItems: [
        {label: 'foo', value: 'vfoo'},
        {label: 'bar', value: 'vbar'},
      ],
      selectedIndex: 0,
      onSelectedChange: onChange,
    };
    const component = renderIntoDocument(
      <NuclideDropdown {...props} />
    );

    const select = scryRenderedDOMComponentsWithTag(component, 'select');
    ReactDOM.findDOMNode(select[0]).selectedIndex = 1;
    Simulate.change(ReactDOM.findDOMNode(select[0]));
    expect(changedIndex).toBe(1);
  });
});
