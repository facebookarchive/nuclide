'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const FileTreeActions = require('../lib/FileTreeActions');
const React = require('react-for-atom');
const {StatusCodeNumber} = require('nuclide-hg-repository-base').hgConstants;

const cx = require('react-classset');
const {fileTypeClass} = require('nuclide-atom-helpers');
const {isContextClick} = require('../lib/FileTreeHelpers');

const {
  addons,
  PropTypes,
} = React;

const getActions = FileTreeActions.getInstance;

// Leading indent for each tree node
const INDENT_IN_PX = 10;
// Additional indent for nested tree nodes
const INDENT_PER_LEVEL = 15;
const DOWN_ARROW = '\uF0A3';
const RIGHT_ARROW = '\uF078';
const SPINNER = '\uF087';

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
    const indentLevel = this.props.indentLevel;
    const outerStyle = {
      paddingLeft: INDENT_IN_PX + indentLevel * INDENT_PER_LEVEL,
    };
    const outerClassName = cx({
      'directory': this.props.isContainer,
      'file': !this.props.isContainer,
      'entry list-item nuclide-tree-component-item': true,
      'selected': this.props.isSelected,
    });

    // TODO: Consider symlinks when it's possible to determine whether this is a symlink.
    let innerClassName;
    if (this.props.isContainer) {
      innerClassName = 'icon-file-directory';
    } else {
      innerClassName = fileTypeClass(this.props.nodeName);
    }

    let statusClass;
    const {vcsStatusCode} = this.props;
    if (vcsStatusCode === StatusCodeNumber.MODIFIED) {
      statusClass = 'status-modified';
    } else if (vcsStatusCode === StatusCodeNumber.ADDED) {
      statusClass = 'status-added';
    } else {
      statusClass = '';
    }

    let icon: ?ReactElement;
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
        className={`${outerClassName} ${statusClass}`}
        style={outerStyle}
        onClick={this._onClick}
        onMouseDown={this._onMouseDown}
        onDoubleClick={this._onDoubleClick}>
        {arrow}
        <span
          className={`icon name ${innerClassName}`}
          data-name={this.props.nodeName}
          data-path={this.props.nodePath}>
          {this.props.nodeName}
        </span>
      </li>
    );
  }

  _onClick(event: SyntheticMouseEvent) {
    const deep = event.altKey;
    const arrow = this.refs['arrow'];
    if (arrow != null && React.findDOMNode(arrow).contains(event.target)) {
      this._toggleNodeExpanded(deep);
      return;
    }

    const modifySelection = event.ctrlKey || event.metaKey;
    if (modifySelection) {
      getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
    } else if (this.props.isSelected) {
      if (this.props.isContainer) {
        this._toggleNodeExpanded(deep);
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

  _toggleNodeExpanded(deep): void {
    if (this.props.isExpanded) {
      if (deep) {
        getActions().collapseNodeDeep(this.props.rootKey, this.props.nodeKey);
      } else {
        getActions().collapseNode(this.props.rootKey, this.props.nodeKey);
      }
    } else {
      if (deep) {
        getActions().expandNodeDeep(this.props.rootKey, this.props.nodeKey);
      } else {
        getActions().expandNode(this.props.rootKey, this.props.nodeKey);
      }
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
