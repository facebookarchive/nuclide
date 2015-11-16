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
const {isContextClick} = require('../lib/FileTreeHelpers');

const {
  addons,
  PropTypes,
} = React;

const getActions = FileTreeActions.getInstance;

// Additional indent for nested tree nodes
const INDENT_PER_LEVEL = 17;

class DirectoryEntryComponent extends React.Component {
  constructor(props: Object) {
    super(props);
    this._onClick = this._onClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object) {
    return addons.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
  }

  render(): ReactElement {
    const outerClassName = classnames({
      'collapsed': !this.props.isExpanded,
      'directory entry list-nested-item': true,
      'project-root': this.props.isRoot,
      'selected': this.props.isSelected,
    });
    const listItemClassName = classnames({
      'header': this.props.isRoot,
      'list-item': true,
      'loading': this.props.isLoading,
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
        style={{paddingLeft: this.props.indentLevel * INDENT_PER_LEVEL}}
        onClick={this._onClick}
        onMouseDown={this._onMouseDown}>
        <div className={listItemClassName} ref="arrowContainer">
          <span
            className="icon name icon-file-directory"
            ref="pathContainer"
            data-name={this.props.nodeName}
            data-path={this.props.nodePath}>
            {this.props.nodeName}
          </span>
        </div>
      </li>
    );
  }

  _onClick(event: SyntheticMouseEvent) {
    const deep = event.altKey;
    if (
      React.findDOMNode(this.refs['arrowContainer']).contains(event.target)
      && event.clientX < React.findDOMNode(this.refs['pathContainer']).getBoundingClientRect().left
    ) {
      this._toggleNodeExpanded(deep);
      return;
    }

    const modifySelection = event.ctrlKey || event.metaKey;
    if (modifySelection) {
      getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
    } else if (this.props.isSelected) {
      this._toggleNodeExpanded(deep);
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

DirectoryEntryComponent.propTypes = {
  indentLevel: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isRoot: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  nodeKey: PropTypes.string.isRequired,
  nodeName: PropTypes.string.isRequired,
  nodePath: PropTypes.string.isRequired,
  rootKey: PropTypes.string.isRequired,
  vcsStatusCode: PropTypes.number,
};

module.exports = DirectoryEntryComponent;

