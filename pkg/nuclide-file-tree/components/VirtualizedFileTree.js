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

import * as React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import invariant from 'assert';
import List from 'react-virtualized/dist/commonjs/List';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import {FileTreeStore} from '../lib/FileTreeStore';
import FileTreeActions from '../lib/FileTreeActions';
import {FileTreeEntryComponent} from './FileTreeEntryComponent';
import {ProjectSelection} from './ProjectSelection';

// flowlint-next-line untyped-type-import:off
import type Immutable from 'immutable';
import type {FileTreeNode} from '../lib/FileTreeNode';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

type State = {|
  trackedIndex: ?number,
  isEditingWorkingSet: boolean,
  roots: Immutable.OrderedMap<NuclideUri, FileTreeNode>,
  shownNodes: number,
  selectedNodes: Immutable.Set<FileTreeNode>,
  focusedNodes: Immutable.Set<FileTreeNode>,
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
|};

type RowType = 'root' | 'node' | 'footer';

const BUFFER_ELEMENTS = 10;
const DEFAULT_ROOT_HEIGHT = 30;
const DEFAULT_NODE_HEIGHT = 24;
const DEFAULT_FOOTER_HEIGHT = 74;

export class VirtualizedFileTree extends React.Component<Props, State> {
  _store: FileTreeStore;
  _disposables: UniversalDisposable;
  _actions: FileTreeActions;
  _getNodeByIndex: (index: number) => ?FileTreeNode;

  _listRef: ?List;
  _rootRef: ?FileTreeEntryComponent;
  _nodeRef: ?FileTreeEntryComponent;
  _footerRef: ?ProjectSelection;

  _indexOfFirstRowInView: number;
  _indexOfLastRowInView: number;
  _nextScrollingIsProgrammatic: boolean;

  constructor(props: Props) {
    super(props);
    this._store = FileTreeStore.getInstance();
    this._actions = FileTreeActions.getInstance();
    this._getNodeByIndex = this._buildGetNodeByIndex(this._store.roots);

    const shownNodes = countShownNodes(this._store.roots);
    this.state = {
      trackedIndex: findIndexOfTheTrackedNode(this._store, shownNodes),
      isEditingWorkingSet: this._store.isEditingWorkingSet(),
      roots: this._store.roots,
      shownNodes,
      selectedNodes: this._store.selectionManager.selectedNodes(),
      focusedNodes: this._store.selectionManager.focusedNodes(),
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
    this._processStoreUpdate();
    this._disposables.add(
      this._store.subscribe(() => this._processStoreUpdate()),
    );

    this._remeasureHeights();
  }

  componentWillUpdate(nextProps: Props, nextState: State): void {
    if (this.state.shownNodes !== nextState.shownNodes) {
      // Some folder was expanded/collaplsed or roots were modified.
      // In some themes the height of a root node is different from the height of plain node
      // The indices of root nodes could have changed -- we'll better recompute the heights

      if (this._listRef != null) {
        this._listRef.recomputeRowHeights();
      }
    }
  }

  componentDidUpdate(): void {
    this._remeasureHeights();
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _remeasureHeights(): void {
    let heightUpdated = false;
    const newState = {};

    if (this.state.rootHeight == null && this._rootRef != null) {
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

    if (this.state.nodeHeight == null && this._nodeRef != null) {
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

    if (this.state.footerHeight == null && this._footerRef != null) {
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

  _processStoreUpdate(): void {
    const isEditingWorkingSet = this._store.isEditingWorkingSet();
    const roots = this._store.roots;
    const shownNodes = countShownNodes(roots);
    const trackedIndex = findIndexOfTheTrackedNode(this._store, shownNodes);
    const selectedNodes = this._store.selectionManager.selectedNodes();
    const focusedNodes = this._store.selectionManager.focusedNodes();

    this.setState({
      trackedIndex,
      isEditingWorkingSet,
      roots,
      shownNodes,
      selectedNodes,
      focusedNodes,
    });
  }

  render(): React.Node {
    const classes = {
      'nuclide-file-tree': true,
      'focusable-panel': true,
      'tree-view': true,
      'nuclide-file-tree-editing-working-set': this.state.isEditingWorkingSet,
    };

    let trackedIndex = undefined;
    let scrollToAlignment = 'auto';
    let willBeActivelyScrolling = false;

    if (this.state.trackedIndex != null) {
      trackedIndex = this.state.trackedIndex;
      if (
        trackedIndex <= this._indexOfFirstRowInView ||
        trackedIndex >= this._indexOfLastRowInView
      ) {
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
          rowCount={this.state.shownNodes + 1}
          rowRenderer={this._rowRenderer}
          rowHeight={this._rowHeight}
          scrollToIndex={trackedIndex}
          scrollTop={scrollTop}
          scrollToAlignment={scrollToAlignment}
          overscanRowCount={BUFFER_ELEMENTS}
          onScroll={this._handleScroll}
          rootHeight={this.state.rootHeight}
          nodeHeight={this.state.nodeHeight}
          footerHeight={this.state.footerHeight}
          onRowsRendered={this._onRowsRendered}
          tabIndex={null}
          containerStyle={{overflowX: 'scroll'}}
          /* This is a workaround. React doesn't detect that a change in this component's state
            should affect the properties of this List's children. Maybe it's an interop problem
            with react-virtualized.
            To workaround this, we add the properties below as properties
            of the List element itself
            List does not use them, but they will give a hint to React that the component
            should be updated, and this will cause it to rerender its children.
          */
          roots={this.state.roots}
          selectedNodes={this.state.selectedNodes}
          focusedNodes={this.state.focusedNodes}
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
    if (!this._nextScrollingIsProgrammatic && this.state.trackedIndex != null) {
      this._actions.clearTrackedNode();
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
      prevRoots = this.state.roots;
      prevIndexQuery = index;
      prevNode = this._store.getNodeByIndex(index + 1);
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

  _rowRenderer = (args: {
    index: number,
    isScrolling: boolean,
    key: string,
    parent: mixed,
    style: Object,
  }): ?React$Node => {
    const {index, key, style} = args;

    if (index === this.state.shownNodes) {
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
            ref={node.isRoot ? this._setRootRef : this._setNodeRef}
            node={node}
            selectedNodes={this.state.selectedNodes}
            focusedNodes={this.state.focusedNodes}
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

    if (
      this.state.trackedIndex != null &&
      this.state.trackedIndex >= startIndex &&
      this.state.trackedIndex <= stopIndex
    ) {
      this._actions.clearTrackedNodeIfNotLoading();
    }
  };

  _clearFooterHeight = (): void => {
    this.setState({footerHeight: null});
  };

  _rowTypeMapper(rowIndex: number): RowType {
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

function findIndexOfTheTrackedNode(
  store: FileTreeStore,
  shownNodes: number,
): ?number {
  const trackedNode = store.getTrackedNode();
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
  roots: Immutable.OrderedMap<mixed, FileTreeNode>,
): number {
  return roots.reduce((sum, root) => sum + root.shownChildrenCount, 0);
}
