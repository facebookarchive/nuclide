'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var LazyTestTreeNode = require('./LazyTestTreeNode');
var React = require('react-for-atom');
var TreeNodeComponent = require('../lib/TreeNodeComponent');

var {TestUtils} = React.addons;

describe('TreeNodeComponent', () => {

  var props;
  var treeNodeComponent;

  var iconClassName = 'icon-file-text';
  var label = 'file.js';

  beforeEach(() => {
    props = {
      depth: 0,
      isExpanded: () => {},
      isSelected: false,
      labelClassNameForNode: () => iconClassName,
      node: new LazyTestTreeNode({label}, null, false, null),
      onClick: () => {},
      onClickArrow: () => {},
      onDoubleClick: () => {},
      onMouseDown: () => {},
    };

    spyOn(props, 'onClick');
    spyOn(props, 'onClickArrow');
    spyOn(props, 'onDoubleClick');

    treeNodeComponent = TestUtils.renderIntoDocument(
        <TreeNodeComponent {...props} />
      );
  });

  describe('rendering its icons', () => {

    // The package expects icons to have a `data-name` attribute with the name
    // of the file and for the list item in the tree to have the class names
    // 'entry', 'file', and 'list-item'.
    //
    // See: https://atom.io/packages/file-icons
    it('uses selectors necessary for the "file-icons" package', () => {
      var domNode = React.findDOMNode(treeNodeComponent);

      expect(domNode.classList.contains('entry')).toBe(true);
      expect(domNode.classList.contains('file')).toBe(true);
      expect(domNode.classList.contains('list-item')).toBe(true);

      var iconComponent = TestUtils.findRenderedDOMComponentWithClass(
        treeNodeComponent,
        iconClassName
      );

      expect(React.findDOMNode(iconComponent).dataset.name).toEqual(label);
    });

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

  describe('double clicking a node', () => {

    it('calls its `onDoubleClick` callback', () => {
      var domNode = React.findDOMNode(treeNodeComponent);

      TestUtils.Simulate.doubleClick(domNode);
      expect(props.onDoubleClick).toHaveBeenCalled();
    });

  });

});
