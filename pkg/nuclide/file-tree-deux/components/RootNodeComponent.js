'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeActions = require('../lib/FileTreeActions');
var FileTreeStore = require('../lib/FileTreeStore');
var NodeComponent = require('./NodeComponent');
var React = require('react-for-atom');

var {isContextClick} = require('../lib/FileTreeHelpers');

import type FileTreeNode from '../lib/FileTreeNode';

var {PropTypes} = React;
var actions = FileTreeActions.getInstance();

var getStore = FileTreeStore.getInstance;

class RootNodeComponent extends React.Component {
  constructor() {
    super(...arguments);
    this._onFocus = this._onFocus.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  render(): ReactElement {
    return (
      <div
        className="nuclide-tree-root"
        tabIndex={0}
        onFocus={this._onFocus}
        onMouseDown={this._onMouseDown}>
        {this._renderNode(getStore().getRootNode(this.props.rootKey), 0)}
      </div>
    );
  }

  _renderNode(node: FileTreeNode, indentLevel: number): Array<ReactElement> {
    var elements = [
      <NodeComponent key={node.nodeKey} node={node} indentLevel={indentLevel} />,
    ];
    if (node.isExpanded()) {
      node.getChildNodes().forEach(childNode => {
        elements = elements.concat(this._renderNode(childNode, indentLevel + 1));
      });
    }
    return elements;
  }

  _onFocus() {
    actions.setFocusedRoot(this.props.rootKey);
  }

  _onMouseDown(event: SyntheticMouseEvent) {
    // Focus root on right-click (in order for context menu to behave correctly).
    if (isContextClick(event)) {
      actions.setFocusedRoot(this.props.rootKey);
    }
  }
}

RootNodeComponent.propTypes = {
  rootKey: PropTypes.string.isRequired,
};

module.exports = RootNodeComponent;

