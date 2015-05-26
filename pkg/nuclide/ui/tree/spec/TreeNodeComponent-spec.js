'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var LazyTestTreeNode = require('./LazyTestTreeNode');
var React = require('react-for-atom');
var TreeNodeComponent = require('../lib/TreeNodeComponent');

var {TestUtils} = React.addons;

describe('TreeNodeComponent', () => {

  var props;
  var treeNodeComponent;

  beforeEach(() => {
    props = {
      depth: 0,
      isExpanded: () => {},
      isSelected: false,
      labelClassNameForNode: () => {},
      node: new LazyTestTreeNode({label: ''}, null, false, null),
      onClick: () => {},
      onClickArrow: () => {},
      onMouseDown: () => {},
    };

    spyOn(props, 'onClick');
    spyOn(props, 'onClickArrow');

    treeNodeComponent = TestUtils.renderIntoDocument(
        <TreeNodeComponent {...props} />
      );
  });

  describe('clicking a node', () => {

    it('calls its `onClick` callback', () => {
      var domNode = React.findDOMNode(treeNodeComponent);

      TestUtils.Simulate.click(domNode);
      expect(props.onClick).toHaveBeenCalled();
    });

  });

  describe('clicking a node\'s arrow', () => {

    it('calls its `onClickArrow` callback, not its `onClick` callback', () => {
      var arrow = TestUtils.findRenderedDOMComponentWithClass(
          treeNodeComponent,
          'nuclide-tree-component-item-arrow'
        );

      TestUtils.Simulate.click(arrow);
      expect(props.onClick).not.toHaveBeenCalled();
      expect(props.onClickArrow).toHaveBeenCalled();
    });

  });

});
