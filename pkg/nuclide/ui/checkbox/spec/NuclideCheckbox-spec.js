'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import NuclideCheckbox from '../lib/NuclideCheckbox';
import React from 'react-for-atom';
const {TestUtils} = React.addons;

let hostEl;

function createWithProps(props: mixed) {
  return React.render(<NuclideCheckbox {...props} />, hostEl);
}

describe('NuclideCheckbox', () => {

  beforeEach(() => {
    hostEl = document.createElement('div');
  });

  afterEach(() => {
    React.unmountComponentAtNode(hostEl);
    hostEl = null;
  });

  it('onChange handler fires when change event dispatched from checkbox', () => {
    const onChange = jasmine.createSpy();
    const reactElement = createWithProps({
      checked: false,
      label: 'click me!',
      onChange,
    });

    const inputEl = TestUtils.findRenderedDOMComponentWithTag(reactElement, 'input');
    // Unfortunately, TestUtils does not seem to turn a click into a change event for a checkbox.
    TestUtils.Simulate.change(inputEl);
    expect(onChange.callCount).toBe(1);

    // Nor does it seem to change the state of the checkbox, as the following fails:
    //   expect(inputEl.checked).toBe(true);
    // Presumably this is because TestUtils deals only with synthetic events, not native ones.
  });
});
