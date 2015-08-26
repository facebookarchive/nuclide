'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeStore = require('../lib/FileTreeStore');
var NodeComponent = require('./NodeComponent');
var React = require('react-for-atom');

import type FileTreeNode from '../lib/FileTreeNode';

var {PropTypes} = React;

var getStore = FileTreeStore.getInstance;

class RootNodeComponent extends React.Component {
  render(): ReactElement {
    return (
      <div className="nuclide-tree-root">
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
}

RootNodeComponent.propTypes = {
  rootKey: PropTypes.string.isRequired,
};


module.exports = RootNodeComponent;
