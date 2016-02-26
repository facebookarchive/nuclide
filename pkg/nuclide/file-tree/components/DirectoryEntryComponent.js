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
const {
  PureRenderMixin,
  React,
  ReactDOM,
} = require('react-for-atom');
const {StatusCodeNumber} = require('../../hg-repository-base').hgConstants;

const classnames = require('classnames');
const {isContextClick} = require('../lib/FileTreeHelpers');
const {TriStateCheckboxComponent} = require('./TriStateCheckboxComponent');

const {PropTypes} = React;

const getActions = FileTreeActions.getInstance;

// Additional indent for nested tree nodes
const INDENT_PER_LEVEL = 17;

class DirectoryEntryComponent extends React.Component {
  static propTypes = {
    indentLevel: PropTypes.number.isRequired,
    isCwd: PropTypes.bool.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isRoot: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    usePreviewTabs: PropTypes.bool.isRequired,
    nodeKey: PropTypes.string.isRequired,
    nodeName: PropTypes.string.isRequired,
    nodePath: PropTypes.string.isRequired,
    rootKey: PropTypes.string.isRequired,
    vcsStatusCode: PropTypes.number,
    checkedStatus: PropTypes.oneOf(['partial', 'checked', 'clear', '']).isRequired,
    soften: PropTypes.bool.isRequired,
  };

  constructor(props: Object) {
    super(props);
    (this: any)._onClick = this._onClick.bind(this);
    (this: any)._onMouseDown = this._onMouseDown.bind(this);
    (this: any)._checkboxOnClick = this._checkboxOnClick.bind(this);
  }

  shouldComponentUpdate(nextProps: Object, nextState: void) {
    return PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
  }

  render(): ReactElement {
    const outerClassName = classnames({
      'current-working-directory': this.props.isCwd,
      'collapsed': !this.props.isExpanded,
      'directory entry list-nested-item': true,
      'expanded': this.props.isExpanded,
      'project-root': this.props.isRoot,
      'selected': this.props.isSelected,
      'nuclide-file-tree-partial': this.props.checkedStatus === 'partial',
      'nuclide-file-tree-checked': this.props.checkedStatus === 'checked',
      'nuclide-file-tree-reset-coloring': this.props.checkedStatus === 'clear',
      'nuclide-file-tree-softened': this.props.soften,
    });
    const listItemClassName = classnames({
      'header list-item': true,
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

    const iconName = this.props.isCwd ? 'briefcase' : 'file-directory';

    return (
      <li
        key={this.props.nodeKey}
        className={`${outerClassName} ${statusClass}`}
        style={{paddingLeft: this.props.indentLevel * INDENT_PER_LEVEL}}
        onClick={this._onClick}
        onMouseDown={this._onMouseDown}>
        <div className={listItemClassName} ref="arrowContainer">
          <span
            className={`icon name icon-${iconName}`}
            ref="pathContainer"
            data-name={this.props.nodeName}
            data-path={this.props.nodePath}>
            {this._renderCheckbox()}
            {this.props.nodeName}
          </span>
        </div>
      </li>
    );
  }

  _renderCheckbox(): ?React.Element {
    if (this.props.checkedStatus === '') {
      return;
    }

    return (
      <TriStateCheckboxComponent
        checkedStatus={this.props.checkedStatus}
        onClick={this._checkboxOnClick}
      />
    );
  }


  _onClick(event: SyntheticMouseEvent) {
    const deep = event.altKey;
    if (
      ReactDOM.findDOMNode(this.refs['arrowContainer']).contains(event.target)
      && event.clientX < ReactDOM.findDOMNode(
        this.refs['pathContainer']).getBoundingClientRect().left
    ) {
      this._toggleNodeExpanded(deep);
      return;
    }

    const modifySelection = event.ctrlKey || event.metaKey;
    if (modifySelection) {
      getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
    } else {
      if (!this.props.isSelected) {
        getActions().selectSingleNode(this.props.rootKey, this.props.nodeKey);
      }
      if (this.props.isSelected || this.props.usePreviewTabs) {
        this._toggleNodeExpanded(deep);
      }
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

  _toggleNodeExpanded(deep: boolean): void {
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

  _checkboxOnClick(event: Event): void {
    event.stopPropagation();
    if (this.props.checkedStatus === 'clear') {
      getActions().checkNode(this.props.rootKey, this.props.nodeKey);
    } else {
      getActions().uncheckNode(this.props.rootKey, this.props.nodeKey);
    }
  }
}

module.exports = DirectoryEntryComponent;
