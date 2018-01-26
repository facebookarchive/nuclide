/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/* eslint-env browser */

import {arrayEqual} from 'nuclide-commons/collection';
import * as React from 'react';
import classnames from 'classnames';
import invariant from 'assert';
import shallowEqual from 'shallowequal';
import {scrollIntoView} from './scrollIntoView';
import {TreeList} from './Tree';

export type NodePath = Array<number>;
export type TreeNode = TreeLeafNode | TreeNestedNode;

type TreeLeafNode = {|
  type: 'LEAF',
  label: React.Node,
  hidden?: boolean,
|};

type TreeNestedNode = {|
  type: 'NESTED',
  children: Array<TreeNode>,
  label: React.Node,
  hidden?: boolean,
|};

type TreeProps = {|
  className?: string,
  itemClassName?: string,
  items: Array<TreeNode>,
  onSelect: (path: NodePath) => mixed,
  onConfirm: (path: NodePath) => mixed,
  onTripleClick: (path: NodePath) => mixed,
  selectedPaths: Array<NodePath>,
  collapsedPaths: Array<NodePath>,
  onCollapse: (path: NodePath) => mixed,
  onExpand: (path: NodePath) => mixed,
|};

export class Tree extends React.Component<TreeProps> {
  _handleSelect = (path: NodePath) => {
    this.props.onSelect(path);
  };

  _handleConfirm = (path: NodePath) => {
    this.props.onConfirm(path);
  };

  render() {
    const {
      className,
      collapsedPaths,
      itemClassName,
      items: nodes,
      selectedPaths,
    } = this.props;

    return (
      <ol
        className={classnames(
          'list-tree',
          'nuclide-selectable-tree',
          'has-collapsable-children',
          className,
        )}
        role="tree"
        style={{position: 'relative'}}>
        {nodes.map((node, i) => (
          <AbstractTreeItem
            key={i}
            node={node}
            path={[i]}
            collapsedPaths={collapsedPaths}
            selectedPaths={selectedPaths}
            className={itemClassName}
            onSelect={this._handleSelect}
            onConfirm={this._handleConfirm}
            onTripleClick={this.props.onTripleClick}
            onCollapse={this.props.onCollapse}
            onExpand={this.props.onExpand}
          />
        ))}
      </ol>
    );
  }
}

function AbstractTreeItem({
  className,
  collapsedPaths,
  onConfirm,
  onSelect,
  onTripleClick,
  onCollapse,
  onExpand,
  node,
  path,
  selectedPaths,
}: {
  className: ?string,
  collapsedPaths: Array<NodePath>,
  onConfirm: (path: NodePath) => mixed,
  onSelect: (path: NodePath) => mixed,
  onTripleClick: (path: NodePath) => mixed,
  onCollapse: (path: NodePath) => mixed,
  onExpand: (path: NodePath) => mixed,
  node: TreeNode,
  path: NodePath,
  selectedPaths: Array<NodePath>,
}): ?React.Element<*> {
  if (node.hidden) {
    return null;
  }

  if (node.type === 'LEAF') {
    return (
      // $FlowIgnore
      <TreeItem
        className={className}
        onConfirm={onConfirm}
        onSelect={onSelect}
        onTripleClick={onTripleClick}
        path={path}
        selectedPaths={selectedPaths}>
        {node.label}
      </TreeItem>
    );
  }

  const hasFlatChildren = node.children.every(child => child.type === 'LEAF');
  return (
    // $FlowIgnore
    <NestedTreeItem
      className={className}
      collapsed={false}
      hasFlatChildren={hasFlatChildren}
      onConfirm={onConfirm}
      onSelect={onSelect}
      onTripleClick={onTripleClick}
      onCollapse={onCollapse}
      onExpand={onExpand}
      path={path}
      collapsedPaths={collapsedPaths}
      selectedPaths={selectedPaths}
      label={node.label}>
      {node.children.map((child, i) => {
        const childPath = path.concat([i]);
        return (
          <AbstractTreeItem
            className={className}
            collapsedPaths={collapsedPaths}
            key={childPath.join('.')}
            node={child}
            onConfirm={onConfirm}
            onSelect={onSelect}
            onTripleClick={onTripleClick}
            onCollapse={onCollapse}
            onExpand={onExpand}
            path={childPath}
            selectedPaths={selectedPaths}
          />
        );
      })}
    </NestedTreeItem>
  );
}

type TreeItemProps = {|
  children?: React.Node,
  className?: ?string,
  onSelect: (path: NodePath) => mixed,
  onConfirm: (path: NodePath) => mixed,
  onTripleClick: (path: NodePath) => mixed,
  path: NodePath,
  selectedPaths: Array<NodePath>,
|};

class TreeItem extends React.Component<TreeItemProps> {
  _liNode: ?HTMLLIElement;
  _handleClick = (e: SyntheticMouseEvent<>) => {
    const {onSelect, onConfirm, onTripleClick} = this.props;

    const numberOfClicks = e.detail;
    switch (numberOfClicks) {
      case 1:
        onSelect && onSelect(this.props.path);
        break;
      case 2:
        onConfirm && onConfirm(this.props.path);
        break;
      case 3:
        onTripleClick && onTripleClick(this.props.path);
        break;
      default:
        break;
    }
  };

  scrollIntoView() {
    if (this._liNode != null) {
      scrollIntoView(this._liNode);
    }
  }

  render() {
    const {className, path, selectedPaths, children} = this.props;
    const isSelected = selectedPaths.some(selectedPath =>
      shallowEqual(path, selectedPath),
    );

    return (
      <li
        aria-selected={isSelected}
        className={classnames('list-item', className, {
          selected: isSelected,
        })}
        onClick={this._handleClick}
        ref={liNode => (this._liNode = liNode)}
        role="treeitem"
        tabIndex={isSelected ? '0' : '-1'}>
        {isSelected && typeof children === 'string' ? (
          // String children must be wrapped to receive correct styles when selected.
          <span>{children}</span>
        ) : (
          children
        )}
      </li>
    );
  }
}

type NestedTreeItemProps = {
  label?: React.Node,
  children?: React.Node,
  className?: ?string,
  hasFlatChildren?: boolean, // passthrough to inner TreeList
  onSelect: (path: NodePath) => mixed,
  onConfirm: (path: NodePath) => mixed,
  onTripleClick: (path: NodePath) => mixed,
  onCollapse: (path: NodePath) => mixed,
  onExpand: (path: NodePath) => mixed,
  path: NodePath,
  selectedPaths: Array<NodePath>,
  collapsedPaths: Array<NodePath>,
};

class NestedTreeItem extends React.Component<NestedTreeItemProps> {
  _itemNode: ?HTMLDivElement;
  _handleClick = (e: SyntheticMouseEvent<>) => {
    const itemNode = this._itemNode;
    if (itemNode == null) {
      return;
    }

    invariant(e.target instanceof Element);
    if (e.target.closest('.list-item') !== itemNode) {
      // this was a click on a descendant node in the inner list
      return;
    }

    // TODO: This is gross. It assumes that the expand chevron is present in the
    // `before` pseudoelement (as is with most themes), and measures the space
    // it occupies using computed style properties, not actual measurements.
    // The toggle chevron should be reimplemented as a true dom node instead,
    // bypassing themes. Though this is more visually consistent, it's probably
    // not worth the hassle.
    const beforeStyle = window.getComputedStyle(this._itemNode, ':before');
    const itemStyle = window.getComputedStyle(this._itemNode);
    const chevronWidth =
      parsePx(itemStyle.paddingLeft) +
      parsePx(beforeStyle.paddingLeft) +
      parsePx(beforeStyle.paddingRight) +
      parsePx(beforeStyle.marginLeft) +
      parsePx(beforeStyle.marginRight) +
      parsePx(beforeStyle.width) +
      parsePx(beforeStyle.left);

    const {path, collapsedPaths} = this.props;
    invariant(e.nativeEvent instanceof MouseEvent);
    if (e.nativeEvent.offsetX <= chevronWidth) {
      if (
        collapsedPaths.some(collapsedPath => arrayEqual(path, collapsedPath))
      ) {
        this.props.onExpand(path);
      } else {
        this.props.onCollapse(path);
      }
      return;
    }

    const {onSelect, onConfirm, onTripleClick} = this.props;
    const numberOfClicks = e.detail;
    if (numberOfClicks === 1 && onSelect != null) {
      onSelect(path);
    } else if (numberOfClicks === 2 && onConfirm != null) {
      onConfirm(path);
    } else if (numberOfClicks === 3 && onTripleClick != null) {
      onTripleClick(path);
    }
  };

  render() {
    const {
      className,
      hasFlatChildren,
      selectedPaths,
      collapsedPaths,
      path,
      label,
      children,
    } = this.props;
    const isSelected = selectedPaths.some(selectedPath =>
      shallowEqual(path, selectedPath),
    );
    const isCollapsed = collapsedPaths.some(collapsedPath =>
      shallowEqual(path, collapsedPath),
    );

    return (
      <li
        aria-selected={isSelected}
        aria-expanded={!isCollapsed}
        className={classnames('list-nested-item', className, {
          collapsed: isCollapsed,
          selected: isSelected,
        })}
        onClick={this._handleClick}
        role="treeitem"
        tabIndex={isSelected ? '0' : '-1'}>
        {label == null ? null : (
          <div className="list-item" ref={node => (this._itemNode = node)}>
            {label}
          </div>
        )}
        <TreeList hasFlatChildren={hasFlatChildren}>{children}</TreeList>
      </li>
    );
  }
}

function parsePx(px: string): number {
  return px.length === 0 ? 0 : Number(px.replace('px', ''));
}
