'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var cx = require('react-classset');
var FileTreeActions = require('../lib/FileTreeActions');
var FileTreeStore = require('../lib/FileTreeStore');
var React = require('react-for-atom');

import type FileTreeNode from '../lib/FileTreeNode';

var {PropTypes} = React;
var actions = FileTreeActions.getInstance();

// Leading indent for each tree node
var INDENT_IN_PX = 10;
// Additional indent for nested tree nodes
var INDENT_PER_LEVEL = 15;
var DOWN_ARROW = '\uF0A3';
var RIGHT_ARROW = '\uF078';
var SPINNER = '\uF087';

var store = FileTreeStore.getInstance();

class RootDirectory extends React.Component {
  render(): ReactElement {
    return (
      <div className="nuclide-tree-root">
        {this._renderNode(store.getRootNode(this.props.rootKey), 0)}
      </div>
    );
  }

  _renderNode(node: FileTreeNode, indentLevel: number): Array<ReactElement> {
    var outerStyle = {
      paddingLeft: INDENT_IN_PX + indentLevel * INDENT_PER_LEVEL,
    };
    var outerClassName = 'entry file list-item nuclide-tree-component-item';
    var innerClassName = cx({
      'icon name': true,
      'icon-file-directory': node.isContainer,
      'icon-file-text': !node.isContainer,
    });
    var isExpanded = node.isExpanded();
    var icon: ?ReactElement;
    if (node.isLoading()) {
      icon = <span className="nuclide-tree-component-item-arrow-spinner">{SPINNER}</span>;
    } else if (node.isContainer) {
      icon = isExpanded ? <span>{DOWN_ARROW}</span> : <span>{RIGHT_ARROW}</span>;
    }
    var onArrowClick = event => this._onArrowClick(event, node);
    var onDoubleClick = event => this._onDoubleClick(event, node);
    var elements = [
      <div
        key={node.nodeKey}
        className={outerClassName}
        style={outerStyle}
        onDoubleClick={onDoubleClick}>
        <span onClick={onArrowClick} className="nuclide-tree-component-item-arrow">{icon}</span>
        <span className={innerClassName}>{node.nodeName}</span>
      </div>,
    ];
    if (isExpanded) {
      node.getChildNodes().forEach(childNode => {
        elements = elements.concat(this._renderNode(childNode, indentLevel + 1));
      });
    }
    return elements;
  }

  _onArrowClick(event: SyntheticMouseEvent, node: FileTreeNode): void {
    if (node.isExpanded()) {
      actions.collapseNode(node.rootKey, node.nodeKey);
    } else {
      actions.expandNode(node.rootKey, node.nodeKey);
    }
  }

  _onDoubleClick(event: SyntheticMouseEvent, node: FileTreeNode): void {
    if (!node.isContainer) {
      actions.confirmNode(node.rootKey, node.nodeKey);
    }
  }

}

RootDirectory.propTypes = {
  rootKey: PropTypes.string.isRequired,
};


module.exports = RootDirectory;
