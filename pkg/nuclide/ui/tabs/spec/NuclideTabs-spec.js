'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const Tabs = require('../lib/NuclideTabs');
const {
  React,
  TestUtils,
} = require('react-for-atom');

const {
  Simulate,
  SimulateNative,
  renderIntoDocument,
  scryRenderedDOMComponentsWithClass,
} = TestUtils;

describe('NuclideCheckbox', () => {

  it('notifies callback of tab changes', () => {
    const onChange = jasmine.createSpy('onChange');

    const props = {
      tabs: [{name: 'first', tabContent: 123}, {name: 'second', tabContent: 456}],
      activeTabName: 'first',
      onActiveTabChange: onChange,
    };
    const component = renderIntoDocument(
      <Tabs {...props} />
    );
    const node = scryRenderedDOMComponentsWithClass(
      component,
      'title'
    )[1];

    Simulate.click(node);

    expect(onChange).toHaveBeenCalledWith(props.tabs[1]);
  });

  it('should work with customized event types', () => {
    const onChange = jasmine.createSpy('onChange');

    const props = {
      tabs: [{name: 'first', tabContent: 123}, {name: 'second', tabContent: 456}],
      activeTabName: 'first',
      triggeringEvent: 'onMouseEnter',
      onActiveTabChange: onChange,
    };
    const component = renderIntoDocument(
      <Tabs {...props} />
    );
    const node = scryRenderedDOMComponentsWithClass(
      component,
      'title'
    )[1];

    // `Simulate` does not currently support mouseEnter: https://github.com/facebook/react/issues/1297.
    SimulateNative.mouseOver(React.findDOMNode(node));

    expect(onChange).toHaveBeenCalledWith(props.tabs[1]);
  });

});
