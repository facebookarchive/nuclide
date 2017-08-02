'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTree = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _FileTreeEntryComponent;

function _load_FileTreeEntryComponent() {
  return _FileTreeEntryComponent = require('./FileTreeEntryComponent');
}

var _ProjectSelection;

function _load_ProjectSelection() {
  return _ProjectSelection = require('./ProjectSelection');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// flowlint-next-line untyped-type-import:off
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const BUFFER_ELEMENTS = 15;

class FileTree extends _react.default.Component {

  constructor(props) {
    super(props);

    this._measureHeights = () => {
      const measuredComponent = this.refs.measured;
      if (measuredComponent == null) {
        return;
      }

      const node = _reactDom.default.findDOMNode(measuredComponent);

      // $FlowFixMe
      const elementHeight = node.clientHeight;
      if (elementHeight > 0) {
        this.setState({
          elementHeight,
          initialHeightMeasured: true
        });
      }
    };

    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    this.state = {
      elementHeight: 22, // The minimal observed height makes a good default
      initialHeightMeasured: false
    };
  }

  componentDidMount() {
    setImmediate(() => {
      // Parent refs are not avalaible until _after_ children have mounted, so
      // must wait to update the tracked node until our parent has a reference
      // to our root DOM node.
      this._scrollToTrackedNodeIfNeeded();
    });
    this._measureHeights();
    window.addEventListener('resize', this._measureHeights);

    this._disposables.add(atom.themes.onDidChangeActiveThemes(() => {
      this.setState({ initialHeightMeasured: false });
      const sub = (_observable || _load_observable()).nextAnimationFrame.subscribe(() => {
        this._disposables.remove(sub);
        this._measureHeights();
      });
      this._disposables.add(sub);
    }), () => {
      window.removeEventListener('resize', this._measureHeights);
    });
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  componentDidUpdate() {
    if (!this.state.initialHeightMeasured) {
      this._measureHeights();
    }

    this._scrollToTrackedNodeIfNeeded();
  }

  _scrollToTrackedNodeIfNeeded() {
    const trackedIndex = findIndexOfTheTrackedNode(this._store.roots);
    if (trackedIndex < 0) {
      return;
    }

    const positionIsApproximate = !this.state.initialHeightMeasured;

    this.props.scrollToPosition(trackedIndex * this.state.elementHeight, this.state.elementHeight, positionIsApproximate);
  }

  render() {
    const classes = {
      'nuclide-file-tree': true,
      'focusable-panel': true,
      'tree-view': true,
      'nuclide-file-tree-editing-working-set': this._store.isEditingWorkingSet()
    };

    return _react.default.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)(classes),
        tabIndex: 0,
        onMouseEnter: this.props.onMouseEnter,
        onMouseLeave: this.props.onMouseLeave },
      this._renderChildren()
    );
  }

  _renderChildren() {
    const roots = this._store.roots;
    const childrenCount = countShownNodes(roots);

    if (childrenCount === 0) {
      return _react.default.createElement((_ProjectSelection || _load_ProjectSelection()).ProjectSelection, null);
    }

    const scrollTop = this.props.containerScrollTop;
    const containerHeight = this.props.containerHeight;
    const elementHeight = this.state.elementHeight;
    const elementsInView = Math.ceil(containerHeight / elementHeight);
    let firstToRender = Math.floor(scrollTop / elementHeight) - BUFFER_ELEMENTS;
    // The container might have been scrolled too far for the current elements
    if (firstToRender > childrenCount - elementsInView) {
      firstToRender = childrenCount - elementsInView;
    }
    firstToRender = Math.max(firstToRender, 0);
    const amountToRender = elementsInView + 2 * BUFFER_ELEMENTS;

    const visibleChildren = [];
    let chosenMeasured = false;
    let node = findFirstNodeToRender(roots, firstToRender);

    // The chosen key is intentionally non-unique. This is to force React to reuse nodes
    // when scrolling is performed, rather then delete one and create another.
    // The selected key is a node's index modulo the amount of the rendered nodes. This way,
    // when a node is scrolled out of the view, another is added with just the same index.
    // Were React allowed to delete and creates nodes at its will it would have caused an
    // abrupt stop in the scrolling process.
    // See: https://github.com/facebook/react/issues/2295
    let key = firstToRender % amountToRender;
    while (node != null && visibleChildren.length < amountToRender) {
      if (!node.isRoot && !chosenMeasured) {
        visibleChildren.push(_react.default.createElement((_FileTreeEntryComponent || _load_FileTreeEntryComponent()).FileTreeEntryComponent, { key: key, node: node, ref: 'measured' }));
        chosenMeasured = true;
      } else {
        visibleChildren.push(_react.default.createElement((_FileTreeEntryComponent || _load_FileTreeEntryComponent()).FileTreeEntryComponent, { key: key, node: node }));
      }
      node = node.findNext();
      key = (key + 1) % amountToRender;
    }

    const topPlaceholderSize = firstToRender * elementHeight;
    const bottomPlaceholderCount = childrenCount - (firstToRender + visibleChildren.length);
    const bottomPlaceholderSize = bottomPlaceholderCount * elementHeight;

    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement('div', { style: { height: topPlaceholderSize + 'px' } }),
      _react.default.createElement(
        'ul',
        { className: 'list-tree has-collapsable-children' },
        visibleChildren
      ),
      _react.default.createElement('div', { style: { height: bottomPlaceholderSize + 'px' } }),
      _react.default.createElement((_ProjectSelection || _load_ProjectSelection()).ProjectSelection, null)
    );
  }
}

exports.FileTree = FileTree;
function findFirstNodeToRender(roots, firstToRender) {
  let skipped = 0;

  const node = roots.find(r => {
    if (skipped + r.shownChildrenCount > firstToRender) {
      return true;
    }

    skipped += r.shownChildrenCount;
    return false;
  });

  if (node == null) {
    return null;
  }

  if (skipped === firstToRender) {
    return node;
  }

  // The result is under this root, but not the root itself - skipping it and searching recursively
  return findFirstNodeToRender(node.children, firstToRender - skipped - 1);
}

function findIndexOfTheTrackedNode(nodes) {
  let skipped = 0;
  const trackedNodeRoot = nodes.find(node => {
    if (node.containsTrackedNode) {
      return true;
    }

    skipped += node.shownChildrenCount;
    return false;
  });

  if (trackedNodeRoot == null) {
    return -1;
  }

  if (trackedNodeRoot.isTracked) {
    return skipped;
  }

  return skipped + 1 + findIndexOfTheTrackedNode(trackedNodeRoot.children);
}

function countShownNodes(roots) {
  return roots.reduce((sum, root) => sum + root.shownChildrenCount, 0);
}