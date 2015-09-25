'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NodeComponent = require('./NodeComponent');
var React = require('react-for-atom');

import type FileTreeNode from '../lib/FileTreeNode';

var {PropTypes} = React;

class RootNodeComponent extends React.Component {
  render(): ReactElement {
    return (
      <div className="nuclide-tree-root">
        {this._renderNode(this.props.rootNode, 0)}
      </div>
    );
  }

  _renderNode(node: FileTreeNode, indentLevel: number): Array<ReactElement> {
    var elements = [
      <NodeComponent
        indentLevel={indentLevel}
        isContainer={node.isContainer}
        isExpanded={node.isExpanded()}
        isLoading={node.isLoading()}
        isSelected={node.isSelected()}
        vcsStatusCode={node.getVcsStatusCode()}
        key={node.nodeKey}
        nodeKey={node.nodeKey}
        nodeName={node.nodeName}
        nodePath={node.nodePath}
        ref={node.nodeKey}
        rootKey={node.rootKey}
      />,
    ];
    if (node.isExpanded()) {
      node.getChildNodes().forEach(childNode => {
        elements = elements.concat(this._renderNode(childNode, indentLevel + 1));
      });
    }
    return elements;
  }

  scrollNodeIntoViewIfNeeded(nodeKey: string): void {
    var node = this.refs[nodeKey];
    if (node) {
      React.findDOMNode(node).scrollIntoViewIfNeeded();
    }
  }
}

RootNodeComponent.propTypes = {
  rootNode: PropTypes.object.isRequired,
  rootKey: PropTypes.string.isRequired,
};

module.exports = RootNodeComponent;
