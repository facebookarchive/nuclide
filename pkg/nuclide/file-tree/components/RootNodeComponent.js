'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const DirectoryEntryComponent = require('./DirectoryEntryComponent');
const FileEntryComponent = require('./FileEntryComponent');
const {React} = require('react-for-atom');

import type FileTreeNode from '../lib/FileTreeNode';

const {PropTypes} = React;

class RootNodeComponent extends React.Component {
  static propTypes = {
    rootNode: PropTypes.object.isRequired,
    rootKey: PropTypes.string.isRequired,
  };

  render(): ReactElement {
    return (
      <ol className="list-tree has-collapsable-children">
        {this._renderNode(this.props.rootNode, 0)}
      </ol>
    );
  }

  _renderNode(node: FileTreeNode, indentLevel: number): Array<ReactElement> {
    let elements = [node.isContainer ?
      <DirectoryEntryComponent
        indentLevel={indentLevel}
        isExpanded={node.isExpanded()}
        isLoading={node.isLoading()}
        isRoot={indentLevel === 0}
        isSelected={node.isSelected()}
        usePreviewTabs={node.usePreviewTabs()}
        vcsStatusCode={node.getVcsStatusCode()}
        key={node.nodeKey}
        nodeKey={node.nodeKey}
        nodeName={node.nodeName}
        nodePath={node.nodePath}
        ref={node.nodeKey}
        rootKey={node.rootKey}
      /> :
      <FileEntryComponent
        indentLevel={indentLevel}
        isSelected={node.isSelected()}
        usePreviewTabs={node.usePreviewTabs()}
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
    const node = this.refs[nodeKey];
    if (node) {
      React.findDOMNode(node).scrollIntoViewIfNeeded();
    }
  }
}

module.exports = RootNodeComponent;
