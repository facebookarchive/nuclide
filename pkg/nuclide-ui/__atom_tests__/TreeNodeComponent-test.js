'use strict';

var _LazyTestTreeNode;

function _load_LazyTestTreeNode() {
  return _LazyTestTreeNode = require('../__mocks__/LazyTestTreeNode');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _testUtils;

function _load_testUtils() {
  return _testUtils = _interopRequireDefault(require('react-dom/test-utils'));
}

var _TreeNodeComponent;

function _load_TreeNodeComponent() {
  return _TreeNodeComponent = require('../TreeNodeComponent');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('TreeNodeComponent', () => {
  let props;
  let treeNodeComponent;

  const iconClassName = 'icon-file-text';
  const label = 'file.js';

  beforeEach(() => {
    props = {
      depth: 0,
      isContainer: false,
      isExpanded: false,
      isLoading: false,
      isSelected: false,
      label,
      labelClassName: iconClassName,
      node: new (_LazyTestTreeNode || _load_LazyTestTreeNode()).LazyTestTreeNode({ label }, null, false, null),
      onClick: () => {},
      onClickArrow: () => {},
      onDoubleClick: () => {},
      onMouseDown: () => {},
      path: '',
      rowClassName: ''
    };

    jest.spyOn(props, 'onClick').mockImplementation(() => {});
    jest.spyOn(props, 'onClickArrow').mockImplementation(() => {});
    jest.spyOn(props, 'onDoubleClick').mockImplementation(() => {});

    treeNodeComponent = (_testUtils || _load_testUtils()).default.renderIntoDocument(_react.createElement((_TreeNodeComponent || _load_TreeNodeComponent()).TreeNodeComponent, props));
  });

  describe('rendering its icons', () => {
    // The package expects icons to have a `data-name` attribute with the name
    // of the file and for the list item in the tree to have the class names
    // 'entry', 'file', and 'list-item'.
    //
    // See: https://atom.io/packages/file-icons
    it('uses selectors necessary for the "file-icons" package', () => {
      const domNode = _reactDom.default.findDOMNode(treeNodeComponent);

      // $FlowFixMe
      expect(domNode.classList.contains('entry')).toBe(true);
      // $FlowFixMe
      expect(domNode.classList.contains('file')).toBe(true);
      // $FlowFixMe
      expect(domNode.classList.contains('list-item')).toBe(true);

      const iconComponent = (_testUtils || _load_testUtils()).default.findRenderedDOMComponentWithClass(treeNodeComponent, iconClassName);

      // $FlowFixMe
      expect(_reactDom.default.findDOMNode(iconComponent).dataset.name).toEqual(label);
    });
  });

  describe('clicking a node', () => {
    it('calls its `onClick` callback', () => {
      const domNode = _reactDom.default.findDOMNode(treeNodeComponent);

      if (!(domNode instanceof Element)) {
        throw new Error('Invariant violation: "domNode instanceof Element"');
      }

      (_testUtils || _load_testUtils()).default.Simulate.click(domNode);

      if (!props) {
        throw new Error('Invariant violation: "props"');
      }

      expect(props.onClick).toHaveBeenCalled();
    });
  });

  describe("clicking a node's arrow", () => {
    it('calls its `onClickArrow` callback, not its `onClick` callback', () => {
      const arrow = (_testUtils || _load_testUtils()).default.findRenderedDOMComponentWithClass(treeNodeComponent, 'nuclide-tree-component-item-arrow');

      if (!(arrow instanceof Element)) {
        throw new Error('Invariant violation: "arrow instanceof Element"');
      }

      (_testUtils || _load_testUtils()).default.Simulate.click(arrow);

      if (!props) {
        throw new Error('Invariant violation: "props"');
      }

      expect(props.onClick).not.toHaveBeenCalled();
      expect(props.onClickArrow).toHaveBeenCalled();
    });
  });

  describe('double clicking a node', () => {
    it('calls its `onDoubleClick` callback', () => {
      const domNode = _reactDom.default.findDOMNode(treeNodeComponent);

      if (!(domNode instanceof Element)) {
        throw new Error('Invariant violation: "domNode instanceof Element"');
      }

      (_testUtils || _load_testUtils()).default.Simulate.doubleClick(domNode);

      if (!props) {
        throw new Error('Invariant violation: "props"');
      }

      expect(props.onDoubleClick).toHaveBeenCalled();
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */

/* global Element */