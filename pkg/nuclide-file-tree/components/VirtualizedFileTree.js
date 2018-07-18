"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VirtualizedFileTree = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _List() {
  const data = _interopRequireDefault(require("react-virtualized/dist/commonjs/List"));

  _List = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function _FileTreeActions() {
  const data = _interopRequireDefault(require("../lib/FileTreeActions"));

  _FileTreeActions = function () {
    return data;
  };

  return data;
}

function _FileTreeEntryComponent() {
  const data = require("./FileTreeEntryComponent");

  _FileTreeEntryComponent = function () {
    return data;
  };

  return data;
}

function _ProjectSelection() {
  const data = require("./ProjectSelection");

  _ProjectSelection = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/FileTreeSelectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/* global HTMLElement */
const BUFFER_ELEMENTS = 10;
const DEFAULT_ROOT_HEIGHT = 30;
const DEFAULT_NODE_HEIGHT = 24;
const DEFAULT_FOOTER_HEIGHT = 74;

class VirtualizedFileTree extends React.Component {
  constructor(props) {
    super(props);

    this._setListRef = node => {
      this._listRef = node;
    };

    this._setRootRef = node => {
      this._rootRef = node;
    };

    this._setNodeRef = node => {
      this._nodeRef = node;
    };

    this._setFooterRef = node => {
      this._footerRef = node;
    };

    this._rowHeight = args => {
      const {
        index
      } = args;

      const rowType = this._rowTypeMapper(index);

      switch (rowType) {
        case 'root':
          return this.state.rootHeight == null ? DEFAULT_ROOT_HEIGHT : this.state.rootHeight;

        case 'node':
          return this.state.nodeHeight == null ? DEFAULT_NODE_HEIGHT : this.state.nodeHeight;

        default:
          return this.state.footerHeight == null ? DEFAULT_FOOTER_HEIGHT : this.state.footerHeight;
      }
    };

    this._handleScroll = args => {
      const {
        scrollTop
      } = args;

      if (!this._nextScrollingIsProgrammatic && this.state.trackedIndex != null) {
        this.props.actions.clearTrackedNode();
      }

      this._nextScrollingIsProgrammatic = false;
      this.props.onScroll(scrollTop);
    };

    this._rowRenderer = args => {
      const {
        index,
        key,
        style
      } = args;

      if (index === this.state.shownNodes) {
        // The footer
        return React.createElement("div", {
          key: key,
          style: style
        }, React.createElement(_ProjectSelection().ProjectSelection, {
          ref: this._setFooterRef,
          store: this.props.store,
          remeasureHeight: this._clearFooterHeight
        }));
      } else {
        const node = this._getNodeByIndex(index);

        if (node == null) {
          return null;
        }

        return React.createElement("div", {
          key: key,
          style: style
        }, React.createElement(_FileTreeEntryComponent().FileTreeEntryComponent // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        , {
          ref: node.isRoot ? this._setRootRef : this._setNodeRef,
          node: node,
          selectedNodes: this.state.selectedNodes,
          focusedNodes: this.state.focusedNodes,
          store: this.props.store,
          actions: this.props.actions
        }));
      }
    };

    this._onRowsRendered = args => {
      const {
        startIndex,
        stopIndex
      } = args;
      this._indexOfFirstRowInView = startIndex;
      this._indexOfLastRowInView = stopIndex;

      if (this.state.trackedIndex != null && this.state.trackedIndex >= startIndex && this.state.trackedIndex <= stopIndex) {
        this.props.actions.clearTrackedNodeIfNotLoading();
      }
    };

    this._clearFooterHeight = () => {
      this.setState({
        footerHeight: null
      });
    };

    this._getNodeByIndex = this._buildGetNodeByIndex(Selectors().getRoots(this.props.store));
    const shownNodes = countShownNodes(Selectors().getRoots(this.props.store));
    this.state = {
      trackedIndex: findIndexOfTheTrackedNode(this.props.store, shownNodes),
      isEditingWorkingSet: Selectors().isEditingWorkingSet(this.props.store),
      roots: Selectors().getRoots(this.props.store),
      shownNodes,
      selectedNodes: Selectors().getSelectedNodes(this.props.store).toSet(),
      focusedNodes: Selectors().getFocusedNodes(this.props.store).toSet(),
      rootHeight: null,
      nodeHeight: null,
      footerHeight: null
    };
    this._indexOfFirstRowInView = 0;
    this._indexOfLastRowInView = 0;
    this._nextScrollingIsProgrammatic = false;
    this._disposables = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    this._processStoreUpdate();

    this._disposables.add(this.props.store.subscribe(() => this._processStoreUpdate()));

    this._remeasureHeights();
  }

  componentDidUpdate(prevProps, prevState) {
    this._remeasureHeights();

    if (this.state.shownNodes !== prevState.shownNodes) {
      // Some folder was expanded/collaplsed or roots were modified.
      // In some themes the height of a root node is different from the height of plain node
      // The indices of root nodes could have changed -- we'll better recompute the heights
      if (this._listRef != null) {
        this._listRef.recomputeRowHeights();
      }
    }
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _remeasureHeights() {
    let heightUpdated = false;
    const newState = {};

    if (this.state.rootHeight == null && this._rootRef != null) {
      const rootNode = _reactDom.default.findDOMNode(this._rootRef);

      if (rootNode != null) {
        if (!(rootNode instanceof HTMLElement)) {
          throw new Error("Invariant violation: \"rootNode instanceof HTMLElement\"");
        }

        const rootHeight = rootNode.clientHeight;

        if (rootHeight > 0) {
          newState.rootHeight = rootHeight;
          heightUpdated = true;
        }
      }
    }

    if (this.state.nodeHeight == null && this._nodeRef != null) {
      const node = _reactDom.default.findDOMNode(this._nodeRef);

      if (node != null) {
        if (!(node instanceof HTMLElement)) {
          throw new Error("Invariant violation: \"node instanceof HTMLElement\"");
        }

        const nodeHeight = node.clientHeight;

        if (nodeHeight > 0) {
          newState.nodeHeight = nodeHeight;
          heightUpdated = true;
        }
      }
    }

    if (this.state.footerHeight == null && this._footerRef != null) {
      const footer = _reactDom.default.findDOMNode(this._footerRef);

      if (footer != null) {
        if (!(footer instanceof HTMLElement)) {
          throw new Error("Invariant violation: \"footer instanceof HTMLElement\"");
        }

        const footerHeight = footer.clientHeight;

        if (footerHeight > 0) {
          newState.footerHeight = footerHeight;
          heightUpdated = true;
        }
      }
    }

    if (heightUpdated) {
      this.setState(newState);

      if (this._listRef != null) {
        this._listRef.recomputeRowHeights();
      }
    }
  }

  _processStoreUpdate() {
    const isEditingWorkingSet = Selectors().isEditingWorkingSet(this.props.store);
    const roots = Selectors().getRoots(this.props.store);
    const shownNodes = countShownNodes(roots);
    const trackedIndex = findIndexOfTheTrackedNode(this.props.store, shownNodes);
    const selectedNodes = Selectors().getSelectedNodes(this.props.store).toSet();
    const focusedNodes = Selectors().getFocusedNodes(this.props.store).toSet();
    this.setState({
      trackedIndex,
      isEditingWorkingSet,
      roots,
      shownNodes,
      selectedNodes,
      focusedNodes
    });
  }

  render() {
    const classes = {
      'nuclide-file-tree': true,
      'focusable-panel': true,
      'tree-view': true,
      'nuclide-file-tree-editing-working-set': this.state.isEditingWorkingSet
    };
    let trackedIndex = undefined;
    let scrollToAlignment = 'auto';
    let willBeActivelyScrolling = false;

    if (this.state.trackedIndex != null) {
      trackedIndex = this.state.trackedIndex;

      if (trackedIndex <= this._indexOfFirstRowInView || trackedIndex >= this._indexOfLastRowInView) {
        scrollToAlignment = 'center';
        willBeActivelyScrolling = true;
      }
    }

    let scrollTop;

    if (trackedIndex == null && this.props.initialScrollTop != null) {
      scrollTop = this.props.initialScrollTop;
      willBeActivelyScrolling = true;
    }

    this._nextScrollingIsProgrammatic = willBeActivelyScrolling;
    return React.createElement("div", {
      className: (0, _classnames().default)('list-tree has-collapsable-children file-tree-scroller', classes),
      tabIndex: 0,
      onMouseEnter: this.props.onMouseEnter,
      onMouseLeave: this.props.onMouseLeave
    }, React.createElement(_List().default, {
      height: this.props.height,
      width: this.props.width,
      ref: this._setListRef,
      rowCount: this.state.shownNodes + 1,
      rowRenderer: this._rowRenderer,
      rowHeight: this._rowHeight,
      scrollToIndex: trackedIndex,
      scrollTop: scrollTop,
      scrollToAlignment: scrollToAlignment,
      overscanRowCount: BUFFER_ELEMENTS,
      onScroll: this._handleScroll,
      rootHeight: this.state.rootHeight,
      nodeHeight: this.state.nodeHeight,
      footerHeight: this.state.footerHeight,
      onRowsRendered: this._onRowsRendered,
      tabIndex: null
      /*
      The normal react-virtualized styling doesn't allow us to scroll horizontally. The
      following rules make sure that (1) the inner element isn't cropped and (2) the parent
      element scrolls it.
      */
      ,
      containerStyle: {
        overflow: 'visible'
      },
      style: {
        overflowX: 'auto'
      }
      /* This is a workaround. React doesn't detect that a change in this component's state
        should affect the properties of this List's children. Maybe it's an interop problem
        with react-virtualized.
        To workaround this, we add the properties below as properties
        of the List element itself
        List does not use them, but they will give a hint to React that the component
        should be updated, and this will cause it to rerender its children.
      */
      ,
      roots: this.state.roots,
      selectedNodes: this.state.selectedNodes,
      focusedNodes: this.state.focusedNodes
    }));
  }

  _buildGetNodeByIndex(roots) {
    let prevRoots = roots;
    let prevIndexQuery = -1;
    let prevNode = null;

    const fallbackGetByIndex = index => {
      prevRoots = this.state.roots;
      prevIndexQuery = index;
      prevNode = Selectors().getNodeByIndex(this.props.store)(index + 1);
      return prevNode;
    };

    return index => {
      if (this.state.roots !== prevRoots) {
        // The tree structure was updated
        return fallbackGetByIndex(index);
      }

      if (index === prevIndexQuery) {
        return prevNode;
      }

      if (index === prevIndexQuery + 1) {
        // The likely case when we're moving forward in our scanning - FileTreeNode has
        // more efficient utility to find the next node - we prefer that to a naive scanning
        // from the root of the tree
        prevIndexQuery = index;

        if (prevNode == null) {
          return null;
        }

        prevNode = prevNode.findNext();
        return prevNode;
      }

      return fallbackGetByIndex(index);
    };
  }

  _rowTypeMapper(rowIndex) {
    if (rowIndex === this.state.shownNodes) {
      return 'footer';
    }

    const node = this._getNodeByIndex(rowIndex);

    if (node != null) {
      return node.isRoot ? 'root' : 'node';
    }

    return 'footer';
  }

}

exports.VirtualizedFileTree = VirtualizedFileTree;

function findIndexOfTheTrackedNode(store, shownNodes) {
  const trackedNode = Selectors().getTrackedNode(store);

  if (trackedNode == null) {
    return null;
  }

  const inTreeTrackedNode = trackedNode.calculateVisualIndex() - 1;

  if (inTreeTrackedNode === shownNodes - 1) {
    // The last node in tree is tracked. Let's show the footer instead
    return inTreeTrackedNode + 1;
  }

  return inTreeTrackedNode;
}

function countShownNodes(roots) {
  return roots.reduce((sum, root) => sum + root.shownChildrenCount, 0);
}