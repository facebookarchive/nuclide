'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Tabs = require('../lib/NuclideTabs');
var React = require('react-for-atom');

var {TestUtils} = React.addons;
var {
  Simulate,
  SimulateNative,
  renderIntoDocument,
  scryRenderedDOMComponentsWithClass,
} = TestUtils;

describe('NuclideCheckbox', () => {

  it('notifies callback of tab changes', () => {
    var onChange = jasmine.createSpy('onChange');

    var props = {
      tabs: [{name: 'first', tabContent: 123}, {name: 'second', tabContent: 456}],
      activeTabName: 'first',
      onActiveTabChange: onChange,
    };
    var component = renderIntoDocument(
      <Tabs {...props} />
    );
    var node = scryRenderedDOMComponentsWithClass(
      component,
      'title'
    )[1];

    Simulate.click(node);

    expect(onChange).toHaveBeenCalledWith(props.tabs[1]);
  });

  it('should work with customized event types', () => {
    var onChange = jasmine.createSpy('onChange');

    var props = {
      tabs: [{name: 'first', tabContent: 123}, {name: 'second', tabContent: 456}],
      activeTabName: 'first',
      triggeringEvent: 'onMouseEnter',
      onActiveTabChange: onChange,
    };
    var component = renderIntoDocument(
      <Tabs {...props} />
    );
    var node = scryRenderedDOMComponentsWithClass(
      component,
      'title'
    )[1];

    // `Simulate` does not currently support mouseEnter: https://github.com/facebook/react/issues/1297
    SimulateNative.mouseOver(React.findDOMNode(node));

    expect(onChange).toHaveBeenCalledWith(props.tabs[1]);
  });

});
