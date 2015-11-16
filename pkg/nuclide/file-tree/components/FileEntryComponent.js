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

const classnames = require('classnames');
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

class FileEntryComponent extends React.Component {
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
    const outerClassName = classnames({
      'entry file list-item nuclide-tree-component-item': true,
      'selected': this.props.isSelected,
    });

    let statusClass;
    const {vcsStatusCode} = this.props;
    if (vcsStatusCode === StatusCodeNumber.MODIFIED) {
      statusClass = 'status-modified';
    } else if (vcsStatusCode === StatusCodeNumber.ADDED) {
      statusClass = 'status-added';
    } else {
      statusClass = '';
    }

    return (
      <li
        key={this.props.nodeKey}
        className={`${outerClassName} ${statusClass}`}
        style={outerStyle}
        onClick={this._onClick}
        onMouseDown={this._onMouseDown}
        onDoubleClick={this._onDoubleClick}>
        <span
          className={`icon name ${fileTypeClass(this.props.nodeName)}`}
          data-name={this.props.nodeName}
          data-path={this.props.nodePath}>
          {this.props.nodeName}
        </span>
      </li>
    );
  }

  _onClick(event: SyntheticMouseEvent) {
    const modifySelection = event.ctrlKey || event.metaKey;
    if (modifySelection) {
      getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
    } else if (!this.props.isSelected) {
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
    getActions().confirmNode(this.props.rootKey, this.props.nodeKey);
  }
}

FileEntryComponent.propTypes = {
  indentLevel: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  nodeKey: PropTypes.string.isRequired,
  nodeName: PropTypes.string.isRequired,
  nodePath: PropTypes.string.isRequired,
  rootKey: PropTypes.string.isRequired,
  vcsStatusCode: PropTypes.number,
};

module.exports = FileEntryComponent;
