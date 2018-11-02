"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _reactRedux() {
  const data = require("react-redux");

  _reactRedux = function () {
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

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function Actions() {
  const data = _interopRequireWildcard(require("../lib/redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _FileTreeEntryComponent() {
  const data = _interopRequireDefault(require("./FileTreeEntryComponent"));

  _FileTreeEntryComponent = function () {
    return data;
  };

  return data;
}

function _ProjectSelection() {
  const data = _interopRequireDefault(require("./ProjectSelection"));

  _ProjectSelection = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../modules/nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/redux/Selectors"));

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

class VirtualizedFileTree extends React.PureComponent {
  constructor(props) {
    super(props);
    this._prevShownNodes = 0;
    this._indexOfFirstRowInView = 0;
    this._indexOfLastRowInView = 0;

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

    this._rowRenderer = args => {
      const {
        index,
        key,
        style
      } = args;

      if (index === this.props.shownNodes) {
        // The footer
        return React.createElement("div", {
          key: key,
          style: style
        }, React.createElement(_ProjectSelection().default, {
          ref: this._setFooterRef,
          remeasureHeight: this._clearFooterHeight
        }));
      } else {
        const node = this.props.getNodeByIndex(index);

        if (node == null) {
          return null;
        }

        return React.createElement("div", {
          key: key,
          style: style
        }, React.createElement(_FileTreeEntryComponent().default // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        , {
          ref: node.isRoot ? this._setRootRef : this._setNodeRef,
          node: node,
          selectedNodes: this.props.selectedNodes
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
      const trackedIndex = this.props.trackedIndex; // Stop tracking the node once we've rendered it. If it was already visible when we set the
      // List's `scrollToIndex`, this will happen on the next render. That's fine though.

      if (trackedIndex != null && trackedIndex >= startIndex && trackedIndex <= stopIndex) {
        this.props.clearTrackedNodeIfNotLoading();
      }
    };

    this._clearFooterHeight = () => {
      this.setState({
        footerHeight: null
      });
    };

    this.state = {
      rootHeight: null,
      nodeHeight: null,
      footerHeight: null
    };
    this._disposables = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    this._remeasureHeights();

    this._disposables.add( // Remeasure if the theme changes, and on initial theme load, which may
    // happen after this component mounts.
    (0, _event().observableFromSubscribeFunction)(cb => atom.themes.onDidChangeActiveThemes(cb)).switchMap(() => _rxjsCompatUmdMin.Observable.concat(_rxjsCompatUmdMin.Observable.of(null), // Atom does not actually wait for the `<style>` tag to be loaded
    // before triggering `onDidChangeActiveThemes`. For now we will
    // check again after 100ms and see if that catches the issue.
    _rxjsCompatUmdMin.Observable.of(null).delay(100))).subscribe(() => {
      this._remeasureHeights(true);
    }));
  }

  componentDidUpdate(prevProps, prevState) {
    this._remeasureHeights();

    const {
      shownNodes
    } = this.props;

    if (shownNodes !== this._prevShownNodes) {
      this._prevShownNodes = shownNodes; // Some folder was expanded/collaplsed or roots were modified.
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

  _remeasureHeights(force = false) {
    let heightUpdated = false;
    const newState = {};

    if (force || this.state.rootHeight == null && this._rootRef != null) {
      const rootNode = _reactDom.default.findDOMNode(this._rootRef);

      if (rootNode != null) {
        if (!(rootNode instanceof HTMLElement)) {
          throw new Error("Invariant violation: \"rootNode instanceof HTMLElement\"");
        }

        const rootHeight = rootNode.clientHeight;

        if (rootHeight > 0) {
          newState.rootHeight = rootHeight;
          heightUpdated = true;
          (0, _nuclideAnalytics().track)('file-tee-remeasure-root-height', {
            activeThemes: atom.themes.getActiveThemeNames().join(', '),
            rootHeight,
            force
          });
        }
      }
    }

    if (force || this.state.nodeHeight == null && this._nodeRef != null) {
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

    if (force || this.state.footerHeight == null && this._footerRef != null) {
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

  render() {
    var _this$props$trackedIn;

    const classes = {
      'nuclide-file-tree': true,
      'focusable-panel': true,
      'tree-view': true,
      'nuclide-file-tree-editing-working-set': this.props.isEditingWorkingSet
    };
    const scrollToIndex = (_this$props$trackedIn = this.props.trackedIndex) !== null && _this$props$trackedIn !== void 0 ? _this$props$trackedIn : -1; // If we're moving to an offscreen index, let's center it. Otherwise, we'll maintain the current
    // scroll position. In practice, this means centering only when the user used "Reveal in File
    // Tree" to show an offscreen file.

    const scrollToAlignment = scrollToIndex !== -1 && (scrollToIndex <= this._indexOfFirstRowInView || scrollToIndex >= this._indexOfLastRowInView) ? 'center' : 'auto';
    return React.createElement("div", {
      className: (0, _classnames().default)('list-tree', 'has-collapsable-children', 'file-tree-scroller', 'nuclide-scrollbar-style-fix', classes),
      tabIndex: 0,
      onMouseEnter: this.props.onMouseEnter,
      onMouseLeave: this.props.onMouseLeave
    }, React.createElement(_List().default, {
      height: this.props.height,
      width: this.props.width,
      ref: this._setListRef,
      rowCount: this.props.shownNodes + 1,
      rowRenderer: this._rowRenderer,
      rowHeight: this._rowHeight,
      scrollToIndex: scrollToIndex,
      scrollToAlignment: scrollToAlignment,
      overscanRowCount: BUFFER_ELEMENTS,
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
      roots: this.props.roots,
      selectedNodes: this.props.selectedNodes,
      focusedNodes: this.props.focusedNodes
    }));
  }

  _rowTypeMapper(rowIndex) {
    if (rowIndex === this.props.shownNodes) {
      return 'footer';
    }

    const node = this.props.getNodeByIndex(rowIndex);

    if (node != null) {
      return node.isRoot ? 'root' : 'node';
    }

    return 'footer';
  }

} // A version of `Selectors.getNodeByIndex()` that's optimized for sequential access.


const getNodeByIndex = (() => {
  let prevRoots;
  let prevIndexQuery = -1;
  let prevNode = null;

  const fallbackGetByIndex = (state, index) => {
    prevRoots = Selectors().getRoots(state);
    prevIndexQuery = index;
    prevNode = Selectors().getNodeByIndex(state)(index + 1);
    return prevNode;
  };

  return (state, index) => {
    const roots = Selectors().getRoots(state);

    if (roots !== prevRoots) {
      // The tree structure was updated
      return fallbackGetByIndex(state, index);
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

      prevNode = Selectors().findNext(state)(prevNode);
      return prevNode;
    }

    return fallbackGetByIndex(state, index);
  };
})();

const mapStateToProps = (state, ownProps) => ({
  roots: Selectors().getRoots(state),
  selectedNodes: Selectors().getSelectedNodes(state).toSet(),
  focusedNodes: Selectors().getFocusedNodes(state).toSet(),
  isEditingWorkingSet: Selectors().isEditingWorkingSet(state),
  getNodeByIndex: index => getNodeByIndex(state, index),
  shownNodes: Selectors().countShownNodes(state),
  trackedIndex: Selectors().getTrackedIndex(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  clearTrackedNodeIfNotLoading: () => {
    dispatch(Actions().clearTrackedNodeIfNotLoading());
  }
});

var _default = (0, _reactRedux().connect)(mapStateToProps, mapDispatchToProps)(VirtualizedFileTree);

exports.default = _default;