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
var React = require('react-for-atom');
var {StatusCodeNumber} = require('nuclide-hg-repository-base').hgConstants;

var cx = require('react-classset');
var {fileTypeClass} = require('nuclide-atom-helpers');
var {isContextClick} = require('../lib/FileTreeHelpers');

var {
  addons,
  PropTypes,
} = React;

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
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object) {
    return addons.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
  }

  render(): ReactElement {
    var indentLevel = this.props.indentLevel;
    var outerStyle = {
      paddingLeft: INDENT_IN_PX + indentLevel * INDENT_PER_LEVEL,
    };
    var outerClassName = cx({
      'directory': this.props.isContainer,
      'file': !this.props.isContainer,
      'entry list-item nuclide-tree-component-item': true,
      'selected': this.props.isSelected,
    });

    // TODO: Consider symlinks when it's possible to determine whether this is a symlink.
    var innerClassName;
    if (this.props.isContainer) {
      innerClassName = 'icon-file-directory';
    } else {
      innerClassName = fileTypeClass(this.props.nodeName);
    }

    var statusClass;
    var {vcsStatusCode} = this.props;
    if (vcsStatusCode === StatusCodeNumber.MODIFIED) {
      statusClass = 'status-modified';
    } else if (vcsStatusCode === StatusCodeNumber.ADDED) {
      statusClass = 'status-added';
    } else {
      statusClass = '';
    }

    var icon: ?ReactElement;
    if (this.props.isLoading) {
      icon = <span className="nuclide-tree-component-item-arrow-spinner">{SPINNER}</span>;
    } else if (this.props.isContainer) {
      icon = this.props.isExpanded ? <span>{DOWN_ARROW}</span> : <span>{RIGHT_ARROW}</span>;
    }

    let arrow;
    if (this.props.isContainer) {
      arrow = <span ref="arrow" className="nuclide-tree-component-item-arrow">{icon}</span>;
    }

    return (
      <li
        key={this.props.nodeKey}
        className={outerClassName}
        style={outerStyle}
        onClick={this._onClick}
        onMouseDown={this._onMouseDown}
        onDoubleClick={this._onDoubleClick}>
        {arrow}
        <span
          className={`icon name ${innerClassName} ${statusClass}`}
          data-name={this.props.nodeName}
          data-path={this.props.nodePath}>
          {this.props.nodeName}
        </span>
      </li>
    );
  }

  _onClick(event: SyntheticMouseEvent) {
    const arrow = this.refs['arrow'];
    if (arrow != null && React.findDOMNode(arrow).contains(event.target)) {
      this._toggleNodeExpanded();
      return;
    }

    var modifySelection = event.ctrlKey || event.metaKey;
    if (modifySelection) {
      getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
    } else if (this.props.isSelected) {
      if (this.props.isContainer) {
        this._toggleNodeExpanded();
      }
    } else {
      getActions().selectSingleNode(this.props.rootKey, this.props.nodeKey);
    }
  }

  _onMouseDown(event: SyntheticMouseEvent) {
    // Select node on right-click (in order for context menu to behave correctly).
    if (isContextClick(event)) {
      if (!this.props.isSelected) {
        getActions().selectSingleNode(this.props.rootKey, this.props.nodeKey);
      }
    }
  }

  _onDoubleClick(): void {
    if (!this.props.isContainer) {
      getActions().confirmNode(this.props.rootKey, this.props.nodeKey);
    }
  }

  _toggleNodeExpanded(): void {
    if (this.props.isExpanded) {
      getActions().collapseNode(this.props.rootKey, this.props.nodeKey);
    } else {
      getActions().expandNode(this.props.rootKey, this.props.nodeKey);
    }
  }
}

NodeComponent.propTypes = {
  indentLevel: PropTypes.number.isRequired,
  isContainer: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  nodeKey: PropTypes.string.isRequired,
  nodeName: PropTypes.string.isRequired,
  nodePath: PropTypes.string.isRequired,
  rootKey: PropTypes.string.isRequired,
  vcsStatusCode: PropTypes.number,
};

module.exports = NodeComponent;
