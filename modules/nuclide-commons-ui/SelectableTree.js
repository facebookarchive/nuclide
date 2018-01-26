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

import * as React from 'react';
import classnames from 'classnames';
import invariant from 'assert';
import shallowEqual from 'shallowequal';
import {scrollIntoView} from './scrollIntoView';

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
|};

export class Tree extends React.Component<TreeProps> {
  _handleSelect = (path: NodePath) => {
    this.props.onSelect(path);
  };

  _handleConfirm = (path: NodePath) => {
    this.props.onConfirm(path);
  };

  render() {
    const {className, itemClassName, items: nodes, selectedPaths} = this.props;

    return (
      <ol
        className={classnames('list-tree', className)}
        role="tree"
        style={{position: 'relative'}}>
        {nodes.map((node, i) => (
          <AbstractTreeItem
            key={i}
            node={node}
            path={[i]}
            selectedPaths={selectedPaths}
            className={itemClassName}
            onSelect={this._handleSelect}
            onConfirm={this._handleConfirm}
            onTripleClick={this.props.onTripleClick}
          />
        ))}
      </ol>
    );
  }
}

function AbstractTreeItem({
  className,
  onConfirm,
  onSelect,
  onTripleClick,
  node,
  path,
  selectedPaths,
}: {
  className: ?string,
  onConfirm: (path: NodePath) => mixed,
  onSelect: (path: NodePath) => mixed,
  onTripleClick: (path: NodePath) => mixed,
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
      path={path}
      selectedPaths={selectedPaths}
      label={node.label}>
      {node.children.map((child, i) => {
        const childPath = path.concat([i]);
        return (
          <AbstractTreeItem
            className={className}
            key={childPath.join('.')}
            node={child}
            onConfirm={onConfirm}
            onSelect={onSelect}
            onTripleClick={onTripleClick}
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
        className={classnames(
          className,
          {
            selected: isSelected,
          },
          'list-item',
        )}
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
  path: NodePath,
  selectedPaths: Array<NodePath>,
};

class NestedTreeItem extends React.Component<NestedTreeItemProps> {
  _itemNode: ?HTMLDivElement;
  _handleClick = (e: SyntheticMouseEvent<>) => {
    const itemNode = this._itemNode;
    if (itemNode == null) {
      return;
    }

    invariant(e.target instanceof Element);
    if (e.target.closest('.list-item') === itemNode) {
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
    }
  };

  render() {
    const {
      className,
      hasFlatChildren,
      selectedPaths,
      path,
      label,
      children,
    } = this.props;
    const isSelected = selectedPaths.some(selectedPath =>
      shallowEqual(path, selectedPath),
    );

    return (
      <li
        aria-selected={isSelected}
        aria-expanded={true}
        className={classnames('list-nested-item', className, {
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

type TreeListProps = {
  className?: string,
  /* typically, instances of TreeItem or NestedTreeItem. */
  children?: React.Node,
  showArrows?: boolean,
  hasFlatChildren?: boolean,
};
const TreeList = (props: TreeListProps) => (
  <ul
    className={classnames(
      props.className,
      {
        'has-collapsable-children': props.showArrows,
        'has-flat-children': props.hasFlatChildren,
      },
      'list-tree',
    )}
    role="group">
    {props.children}
  </ul>
);
