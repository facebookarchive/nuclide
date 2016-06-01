'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Dropdown} from '../lib/Dropdown';
import {React, ReactDOM, TestUtils} from 'react-for-atom';

const {
  Simulate,
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
} = TestUtils;

describe('Dropdown', () => {

  it('honors the value param', () => {
    const component = renderIntoDocument(
      <Dropdown
        options={[
          {label: 'foo', value: 'vfoo'},
          {label: 'bar', value: 'vbar'},
        ]}
        onChange={newValue => {}}
        value={'vbar'}
      />
    );

    const select = scryRenderedDOMComponentsWithTag(component, 'select');
    expect(ReactDOM.findDOMNode(select[0]).selectedIndex).toBe(1);
  });

  it('calls the callback with the new index when a different menu item is selected', () => {
    let changedValue;
    const component = renderIntoDocument(
      <Dropdown
        options={[
          {label: 'foo', value: 'vfoo'},
          {label: 'bar', value: 'vbar'},
        ]}
        onChange={value => {
          changedValue = value;
        }}
        value="vfoo"
      />
    );

    const select = scryRenderedDOMComponentsWithTag(component, 'select');
    ReactDOM.findDOMNode(select[0]).selectedIndex = 1;
    Simulate.change(ReactDOM.findDOMNode(select[0]));
    expect(changedValue).toBe('vbar');
  });
});
