/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */
/* global HTMLElement */

import type {AppState, Roots} from '../lib/types';

import * as React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import invariant from 'assert';
import {connect} from 'react-redux';
import List from 'react-virtualized/dist/commonjs/List';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import * as Actions from '../lib/redux/Actions';
import FileTreeEntryComponent from './FileTreeEntryComponent';
import ProjectSelection from './ProjectSelection';

import type Immutable from 'immutable';
import type {FileTreeNode} from '../lib/FileTreeNode';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import * as Selectors from '../lib/FileTreeSelectors';

type State = {|
  rootHeight: ?number,
  nodeHeight: ?number,
  footerHeight: ?number,
|};

type Props = {|
  onMouseEnter: (event: SyntheticMouseEvent<>) => mixed,
  onMouseLeave: (event: SyntheticMouseEvent<>) => mixed,
  onScroll: (scrollTop: number) => mixed,
  height: number,
  width: number,
  initialScrollTop: number,
  roots: Roots,
  trackedNode: ?FileTreeNode,
  selectedNodes: Immutable.Set<FileTreeNode>,
  focusedNodes: Immutable.Set<FileTreeNode>,
  isEditingWorkingSet: boolean,
  clearTrackedNode: () => void,
  clearTrackedNodeIfNotLoading: () => void,
  getNodeByIndex: (index: number) => ?FileTreeNode,
|};

type RowType = 'root' | 'node' | 'footer';

const BUFFER_ELEMENTS = 10;
const DEFAULT_ROOT_HEIGHT = 30;
const DEFAULT_NODE_HEIGHT = 24;
const DEFAULT_FOOTER_HEIGHT = 74;

class VirtualizedFileTree extends React.PureComponent<Props, State> {
  _disposables: UniversalDisposable;
  _getNodeByIndex: (index: number) => ?FileTreeNode;

  _listRef: ?List;
  _rootRef: ?FileTreeEntryComponent;
  _nodeRef: ?FileTreeEntryComponent;
  _footerRef: ?ProjectSelection;
  _prevShownNodes: number = 0;

  _indexOfFirstRowInView: number;
  _indexOfLastRowInView: number;
  _nextScrollingIsProgrammatic: boolean;

  constructor(props: Props) {
    super(props);
    this._getNodeByIndex = this._buildGetNodeByIndex(props.roots);

    this.state = {
      rootHeight: null,
      nodeHeight: null,
      footerHeight: null,
    };

    this._indexOfFirstRowInView = 0;
    this._indexOfLastRowInView = 0;
    this._nextScrollingIsProgrammatic = false;

    this._disposables = new UniversalDisposable();
  }

  componentDidMount(): void {
    this._remeasureHeights();
    this._disposables.add(
      // Remeasure if the theme changes, and on initial theme load, which may
      // happen after this component mounts.
      atom.themes.onDidChangeActiveThemes(() => {
        this._remeasureHeights(true);
      }),
    );
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    this._remeasureHeights();
    const shownNodes = this._getShownNodes();
    if (shownNodes !== this._prevShownNodes) {
      this._prevShownNodes = shownNodes;
      // Some folder was expanded/collaplsed or roots were modified.
      // In some themes the height of a root node is different from the height of plain node
      // The indices of root nodes could have changed -- we'll better recompute the heights

      if (this._listRef != null) {
        this._listRef.recomputeRowHeights();
      }
    }
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _remeasureHeights(force: boolean = false): void {
    let heightUpdated = false;
    const newState = {};

    if (force || (this.state.rootHeight == null && this._rootRef != null)) {
      const rootNode = ReactDOM.findDOMNode(this._rootRef);
      if (rootNode != null) {
        invariant(rootNode instanceof HTMLElement);
        const rootHeight = rootNode.clientHeight;
        if (rootHeight > 0) {
          newState.rootHeight = rootHeight;
          heightUpdated = true;
        }
      }
    }

    if (force || (this.state.nodeHeight == null && this._nodeRef != null)) {
      const node = ReactDOM.findDOMNode(this._nodeRef);
      if (node != null) {
        invariant(node instanceof HTMLElement);
        const nodeHeight = node.clientHeight;
        if (nodeHeight > 0) {
          newState.nodeHeight = nodeHeight;
          heightUpdated = true;
        }
      }
    }

    if (force || (this.state.footerHeight == null && this._footerRef != null)) {
      const footer = ReactDOM.findDOMNode(this._footerRef);
      if (footer != null) {
        invariant(footer instanceof HTMLElement);
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

  // TODO: Memoize
  _getShownNodes = () => countShownNodes(this.props.roots);

  // TODO: Memoize
  _getTrackedIndex = () =>
    findIndexOfTheTrackedNode(this.props.trackedNode, this._getShownNodes());

  render(): React.Node {
    const classes = {
      'nuclide-file-tree': true,
      'focusable-panel': true,
      'tree-view': true,
      'nuclide-file-tree-editing-working-set': this.props.isEditingWorkingSet,
    };

    let scrollToIndex = undefined;
    let scrollToAlignment = 'auto';
    let willBeActivelyScrolling = false;
    const trackedIndex = this._getTrackedIndex();

    if (trackedIndex != null) {
      scrollToIndex = trackedIndex;
      if (
        scrollToIndex <= this._indexOfFirstRowInView ||
        scrollToIndex >= this._indexOfLastRowInView
      ) {
        scrollToAlignment = 'center';
        willBeActivelyScrolling = true;
      }
    }

    let scrollTop;
    if (scrollToIndex == null && this.props.initialScrollTop != null) {
      scrollTop = this.props.initialScrollTop;
      willBeActivelyScrolling = true;
    }

    this._nextScrollingIsProgrammatic = willBeActivelyScrolling;

    return (
      <div
        className={classnames(
          'list-tree has-collapsable-children file-tree-scroller',
          classes,
        )}
        tabIndex={0}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}>
        <List
          height={this.props.height}
          width={this.props.width}
          ref={this._setListRef}
          rowCount={this._getShownNodes() + 1}
          rowRenderer={this._rowRenderer}
          rowHeight={this._rowHeight}
          scrollToIndex={scrollToIndex}
          scrollTop={scrollTop}
          scrollToAlignment={scrollToAlignment}
          overscanRowCount={BUFFER_ELEMENTS}
          onScroll={this._handleScroll}
          rootHeight={this.state.rootHeight}
          nodeHeight={this.state.nodeHeight}
          footerHeight={this.state.footerHeight}
          onRowsRendered={this._onRowsRendered}
          tabIndex={null}
          /*
          The normal react-virtualized styling doesn't allow us to scroll horizontally. The
          following rules make sure that (1) the inner element isn't cropped and (2) the parent
          element scrolls it.
          */
          containerStyle={{overflow: 'visible'}}
          style={{overflowX: 'auto'}}
          /* This is a workaround. React doesn't detect that a change in this component's state
            should affect the properties of this List's children. Maybe it's an interop problem
            with react-virtualized.
            To workaround this, we add the properties below as properties
            of the List element itself
            List does not use them, but they will give a hint to React that the component
            should be updated, and this will cause it to rerender its children.
          */
          roots={this.props.roots}
          selectedNodes={this.props.selectedNodes}
          focusedNodes={this.props.focusedNodes}
        />
      </div>
    );
  }

  _setListRef = (node: ?React$ElementRef<List>): void => {
    this._listRef = node;
  };

  // $FlowFixMe -- flow does not recognize FileTreeEntryComponent as React component
  _setRootRef = (node: ?React$ElementRef<FileTreeEntryComponent>): void => {
    this._rootRef = node;
  };

  // $FlowFixMe -- flow does not recognize FileTreeEntryComponent as React component
  _setNodeRef = (node: ?React$ElementRef<FileTreeEntryComponent>): void => {
    this._nodeRef = node;
  };

  // $FlowFixMe -- flow does not recognize ProjectSelection as React component
  _setFooterRef = (node: ?React$ElementRef<ProjectSelection>): void => {
    this._footerRef = node;
  };

  _rowHeight = (args: {index: number}): number => {
    const {index} = args;
    const rowType = this._rowTypeMapper(index);

    switch (rowType) {
      case 'root':
        return this.state.rootHeight == null
          ? DEFAULT_ROOT_HEIGHT
          : this.state.rootHeight;
      case 'node':
        return this.state.nodeHeight == null
          ? DEFAULT_NODE_HEIGHT
          : this.state.nodeHeight;
      default:
        return this.state.footerHeight == null
          ? DEFAULT_FOOTER_HEIGHT
          : this.state.footerHeight;
    }
  };

  _handleScroll = (args: {
    clientHeight: number,
    scrollHeight: number,
    scrollTop: number,
  }): void => {
    const {scrollTop} = args;
    if (!this._nextScrollingIsProgrammatic && this._getTrackedIndex() != null) {
      this.props.clearTrackedNode();
    }
    this._nextScrollingIsProgrammatic = false;
    this.props.onScroll(scrollTop);
  };

  _buildGetNodeByIndex(
    roots: Immutable.OrderedMap<NuclideUri, FileTreeNode>,
  ): (index: number) => ?FileTreeNode {
    let prevRoots = roots;
    let prevIndexQuery = -1;
    let prevNode: ?FileTreeNode = null;

    const fallbackGetByIndex = index => {
      prevRoots = this.props.roots;
      prevIndexQuery = index;
      prevNode = this.props.getNodeByIndex(index + 1);
      return prevNode;
    };

    return index => {
      if (this.props.roots !== prevRoots) {
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

  _rowRenderer = (args: {
    index: number,
    isScrolling: boolean,
    key: string,
    parent: mixed,
    style: Object,
  }): ?React$Node => {
    const {index, key, style} = args;

    if (index === this._getShownNodes()) {
      // The footer
      return (
        <div key={key} style={style}>
          <ProjectSelection
            ref={this._setFooterRef}
            remeasureHeight={this._clearFooterHeight}
          />
        </div>
      );
    } else {
      const node = this._getNodeByIndex(index);
      if (node == null) {
        return null;
      }

      return (
        <div key={key} style={style}>
          <FileTreeEntryComponent
            // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
            ref={node.isRoot ? this._setRootRef : this._setNodeRef}
            node={node}
            selectedNodes={this.props.selectedNodes}
            focusedNodes={this.props.focusedNodes}
          />
        </div>
      );
    }
  };

  _onRowsRendered = (args: {
    overscanStartIndex: number,
    overscanStopIndex: number,
    startIndex: number,
    stopIndex: number,
  }): void => {
    const {startIndex, stopIndex} = args;
    this._indexOfFirstRowInView = startIndex;
    this._indexOfLastRowInView = stopIndex;
    const trackedIndex = this._getTrackedIndex();

    if (
      trackedIndex != null &&
      trackedIndex >= startIndex &&
      trackedIndex <= stopIndex
    ) {
      this.props.clearTrackedNodeIfNotLoading();
    }
  };

  _clearFooterHeight = (): void => {
    this.setState({footerHeight: null});
  };

  _rowTypeMapper(rowIndex: number): RowType {
    if (rowIndex === this._getShownNodes()) {
      return 'footer';
    }

    const node = this._getNodeByIndex(rowIndex);
    if (node != null) {
      return node.isRoot ? 'root' : 'node';
    }

    return 'footer';
  }
}

function findIndexOfTheTrackedNode(
  trackedNode: ?FileTreeNode,
  shownNodes: number,
): ?number {
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

function countShownNodes(
  roots: Immutable.OrderedMap<NuclideUri, FileTreeNode>,
): number {
  return roots.reduce((sum, root) => sum + root.shownChildrenCount, 0);
}

const mapStateToProps = (state: AppState): $Shape<Props> => ({
  roots: Selectors.getRoots(state),
  trackedNode: Selectors.getTrackedNode(state),
  selectedNodes: Selectors.getSelectedNodes(state).toSet(),
  focusedNodes: Selectors.getFocusedNodes(state).toSet(),
  isEditingWorkingSet: Selectors.isEditingWorkingSet(state),
  getNodeByIndex: index => Selectors.getNodeByIndex(state)(index),
});

const mapDispatchToProps = (dispatch, ownProps): $Shape<Props> => ({
  clearTrackedNode: () => {
    dispatch(Actions.clearTrackedNode());
  },
  clearTrackedNodeIfNotLoading: () => {
    dispatch(Actions.clearTrackedNodeIfNotLoading());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VirtualizedFileTree);
