'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTree = undefined;

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _reactForAtom = require('react-for-atom');

var _FileTreeEntryComponent;

function _load_FileTreeEntryComponent() {
  return _FileTreeEntryComponent = require('./FileTreeEntryComponent');
}

var _EmptyComponent;

function _load_EmptyComponent() {
  return _EmptyComponent = require('./EmptyComponent');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BUFFER_ELEMENTS = 15;

let FileTree = exports.FileTree = class FileTree extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._disposables = new _atom.CompositeDisposable();

    this.state = {
      elementHeight: 22 };

    this._initialHeightMeasured = false;
    this._afRequestId = null;
    this._measureHeights = this._measureHeights.bind(this);
  }

  componentDidMount() {
    this._scrollToTrackedNodeIfNeeded();
    this._measureHeights();
    window.addEventListener('resize', this._measureHeights);

    this._disposables.add(atom.themes.onDidChangeActiveThemes(() => {
      this._initialHeightMeasured = false;
      this._afRequestId = window.requestAnimationFrame(() => {
        this._afRequestId = null;
        this._measureHeights();
      });
    }), new _atom.Disposable(() => {
      window.removeEventListener('resize', this._measureHeights);
    }));
  }

  componentWillUnmount() {
    if (this._afRequestId != null) {
      window.cancelAnimationFrame(this._afRequestId);
    }
    this._disposables.dispose();
  }

  componentDidUpdate() {
    if (!this._initialHeightMeasured) {
      this._measureHeights();
    }

    this._scrollToTrackedNodeIfNeeded();
  }

  _scrollToTrackedNodeIfNeeded() {
    const trackedIndex = findIndexOfTheTrackedNode(this._store.roots);
    if (trackedIndex < 0) {
      return;
    }

    this.props.scrollToPosition(trackedIndex * this.state.elementHeight, this.state.elementHeight);
  }

  _measureHeights() {
    const measuredComponent = this.refs.measured;
    if (measuredComponent == null) {
      return;
    }

    this._initialHeightMeasured = true;

    const node = _reactForAtom.ReactDOM.findDOMNode(measuredComponent);
    const elementHeight = node.clientHeight;
    if (elementHeight !== this.state.elementHeight && elementHeight > 0) {
      this.setState({ elementHeight: elementHeight });
    }
  }

  render() {
    const classes = {
      'nuclide-file-tree': true,
      'focusable-panel': true,
      'tree-view': true,
      'nuclide-file-tree-editing-working-set': this._store.isEditingWorkingSet()
    };

    return _reactForAtom.React.createElement(
      'div',
      { className: (0, (_classnames || _load_classnames()).default)(classes), tabIndex: 0 },
      this._renderChildren()
    );
  }

  _renderChildren() {
    const roots = this._store.roots;
    const childrenCount = countShownNodes(roots);

    if (childrenCount === 0) {
      return _reactForAtom.React.createElement((_EmptyComponent || _load_EmptyComponent()).EmptyComponent, null);
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
        visibleChildren.push(_reactForAtom.React.createElement((_FileTreeEntryComponent || _load_FileTreeEntryComponent()).FileTreeEntryComponent, { key: key, node: node, ref: 'measured' }));
        chosenMeasured = true;
      } else {
        visibleChildren.push(_reactForAtom.React.createElement((_FileTreeEntryComponent || _load_FileTreeEntryComponent()).FileTreeEntryComponent, { key: key, node: node }));
      }
      node = node.findNext();
      key = (key + 1) % amountToRender;
    }

    const topPlaceholderSize = firstToRender * elementHeight;
    const bottomPlaceholderCount = childrenCount - (firstToRender + visibleChildren.length);
    const bottomPlaceholderSize = bottomPlaceholderCount * elementHeight;

    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement('div', { style: { height: topPlaceholderSize + 'px' } }),
      _reactForAtom.React.createElement(
        'ul',
        { className: 'list-tree has-collapsable-children' },
        visibleChildren
      ),
      _reactForAtom.React.createElement('div', { style: { height: bottomPlaceholderSize + 'px' } })
    );
  }
};


function findFirstNodeToRender(roots, firstToRender) {
  let skipped = 0;

  const node = roots.find(r => {
    if (skipped + r.shownChildrenBelow > firstToRender) {
      return true;
    }

    skipped += r.shownChildrenBelow;
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

    skipped += node.shownChildrenBelow;
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
  return roots.reduce((sum, root) => sum + root.shownChildrenBelow, 0);
}