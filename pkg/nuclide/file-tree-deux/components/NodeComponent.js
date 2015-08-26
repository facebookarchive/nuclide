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
var FileTreeNode = require('../lib/FileTreeNode');
var React = require('react-for-atom');

var {PropTypes} = React;

var getActions = FileTreeActions.getInstance;

// Leading indent for each tree node
var INDENT_IN_PX = 10;
// Additional indent for nested tree nodes
var INDENT_PER_LEVEL = 15;
var DOWN_ARROW = '\uF0A3';
var RIGHT_ARROW = '\uF078';
var SPINNER = '\uF087';

class NodeComponent extends React.Component {
  constructor(props: Object) {
    super(props);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
  }

  render(): ReactElement {
    var node = this.props.node;
    var indentLevel = this.props.indentLevel;
    var outerStyle = {
      paddingLeft: INDENT_IN_PX + indentLevel * INDENT_PER_LEVEL,
    };
    var outerClassName = cx({
      'entry file list-item nuclide-tree-component-item': true,
      'nuclide-tree-component-selected': node.isSelected(),
    });
    var innerClassName = cx({
      'icon name': true,
      'icon-file-directory': node.isContainer,
      'icon-file-text': !node.isContainer,
    });
    var icon: ?ReactElement;
    if (node.isLoading()) {
      icon = <span className="nuclide-tree-component-item-arrow-spinner">{SPINNER}</span>;
    } else if (node.isContainer) {
      icon = node.isExpanded() ? <span>{DOWN_ARROW}</span> : <span>{RIGHT_ARROW}</span>;
    }
    return (
      <div
        key={node.nodeKey}
        className={outerClassName}
        style={outerStyle}
        onClick={this._onClick}
        onDoubleClick={this._onDoubleClick}>
        <span ref="arrow" className="nuclide-tree-component-item-arrow">{icon}</span>
        <span className={innerClassName}>{node.nodeName}</span>
      </div>
    );
  }

  _onClick(event: SyntheticMouseEvent) {
    var node = this.props.node;
    if (React.findDOMNode(this.refs.arrow).contains(event.target)) {
      return this._onArrowClick();
    }
    var modifySelection = event.ctrlKey || event.metaKey;
    if (modifySelection) {
      getActions().toggleSelectNode(node.rootKey, node.nodeKey);
    } else {
      getActions().selectSingleNode(node.rootKey, node.nodeKey);
    }
  }

  _onDoubleClick(): void {
    var node = this.props.node;
    if (!node.isContainer) {
      getActions().confirmNode(node.rootKey, node.nodeKey);
    }
  }

  _onArrowClick(): void {
    var node = this.props.node;
    if (node.isExpanded()) {
      getActions().collapseNode(node.rootKey, node.nodeKey);
    } else {
      getActions().expandNode(node.rootKey, node.nodeKey);
    }
  }
}

NodeComponent.propTypes = {
  node: PropTypes.instanceOf(FileTreeNode).isRequired,
  indentLevel: PropTypes.number.isRequired,
};


module.exports = NodeComponent;
