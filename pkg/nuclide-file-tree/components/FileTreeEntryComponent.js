'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import FileTreeActions from '../lib/FileTreeActions';
import {React, ReactDOM} from 'react-for-atom';
import classnames from 'classnames';
import fileTypeClass from '../../commons-atom/file-type-class';
import {filterName} from '../lib/FileTreeFilterHelper';
import {isContextClick} from '../lib/FileTreeHelpers';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {StatusCodeNumber} from '../../nuclide-hg-repository-base/lib/hg-constants';
import type {FileTreeNode} from '../lib/FileTreeNode';

const getActions = FileTreeActions.getInstance;

type Props = {
  node: FileTreeNode;
};

const INDENT_LEVEL = 17;


export class FileTreeEntryComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._onClick = this._onClick.bind(this);
    (this: any)._onDoubleClick = this._onDoubleClick.bind(this);
    (this: any)._onMouseDown = this._onMouseDown.bind(this);
    (this: any)._checkboxOnChange = this._checkboxOnChange.bind(this);
    (this: any)._checkboxOnClick = this._checkboxOnClick.bind(this);
  }

  shouldComponentUpdate(nextProps: Object, nextState: void): boolean {
    return nextProps.node !== this.props.node;
  }

  render(): React.Element {
    const node = this.props.node;

    const outerClassName = classnames('entry', {
      'file list-item': !node.isContainer,
      'directory list-nested-item': node.isContainer,
      'current-working-directory': node.isCwd,
      'collapsed': !node.isLoading && !node.isExpanded,
      'expanded': !node.isLoading && node.isExpanded,
      'project-root': node.isRoot,
      'selected': node.isSelected,
      'nuclide-file-tree-softened': node.shouldBeSoftened,
    });
    const listItemClassName = classnames({
      'header list-item': node.isContainer,
      'loading': node.isLoading,
    });

    let statusClass;
    if (!node.conf.isEditingWorkingSet) {
      const vcsStatusCode = node.vcsStatusCode;
      if (vcsStatusCode === StatusCodeNumber.MODIFIED) {
        statusClass = 'status-modified';
      } else if (vcsStatusCode === StatusCodeNumber.ADDED) {
        statusClass = 'status-added';
      } else if (node.isIgnored) {
        statusClass = 'status-ignored';
      } else {
        statusClass = '';
      }
    } else {
      switch (node.checkedStatus) {
        case 'checked':
          statusClass = 'status-added';
          break;
        case 'partial':
          statusClass = 'status-modified';
          break;
        default:
          statusClass = '';
          break;
      }
    }

    let iconName;
    if (node.isContainer) {
      iconName = node.isCwd ? 'icon-briefcase' : 'icon-file-directory';
    } else {
      iconName = fileTypeClass(node.name);
    }

    return (
      <li
        className={`${outerClassName} ${statusClass}`}
        style={{paddingLeft: this.props.node.getDepth() * INDENT_LEVEL}}
        onClick={this._onClick}
        onDoubleClick={this._onDoubleClick}
        onMouseDown={this._onMouseDown}>
        <div
          className={listItemClassName}
          ref="arrowContainer">
          <span
            className={`icon name ${iconName}`}
            ref="pathContainer"
            data-name={node.name}
            data-path={node.uri}>
            {this._renderCheckbox()}
            <span
              data-name={node.name}
              data-path={node.uri}>
              {filterName(node.name, node.highlightedText, node.isSelected)}
            </span>
          </span>
          {this._renderConnectionTitle()}
        </div>
      </li>
    );
  }

  _renderCheckbox(): ?React.Element {
    if (!this.props.node.conf.isEditingWorkingSet) {
      return;
    }

    return (
      <Checkbox
        checked={this.props.node.checkedStatus === 'checked'}
        indeterminate={this.props.node.checkedStatus === 'partial'}
        onChange={this._checkboxOnChange}
        onClick={this._checkboxOnClick}
      />
    );
  }

  _renderConnectionTitle(): ?React.Element {
    if (!this.props.node.isRoot) {
      return null;
    }
    const title = this.props.node.connectionTitle;
    if (title === '') {
      return null;
    }

    return (
      <span className="nuclide-file-tree-connection-title highlight">
        {title}
      </span>
    );
  }

  _onClick(event: SyntheticMouseEvent) {
    event.stopPropagation();
    const node = this.props.node;

    const deep = event.altKey;
    if (
      node.isContainer &&
      ReactDOM.findDOMNode(this.refs['arrowContainer']).contains(event.target) &&
      event.clientX < ReactDOM.findDOMNode(
        this.refs['pathContainer']
      ).getBoundingClientRect().left
    ) {
      this._toggleNodeExpanded(deep);
      return;
    }

    const modifySelection = event.ctrlKey || event.metaKey;
    if (modifySelection) {
      if (node.isSelected) {
        getActions().unselectNode(node.rootUri, node.uri);
      } else {
        getActions().addSelectedNode(node.rootUri, node.uri);
      }
    } else {
      if (!node.isSelected) {
        getActions().setSelectedNode(node.rootUri, node.uri);
      }
      if (node.isContainer) {
        if (node.isSelected || node.conf.usePreviewTabs) {
          this._toggleNodeExpanded(deep);
        }
      } else {
        if (this.props.node.conf.usePreviewTabs) {
          getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
        }
      }
    }
  }

  _onDoubleClick(event: SyntheticMouseEvent) {
    event.stopPropagation();

    if (this.props.node.isContainer) {
      return;
    }

    if (this.props.node.conf.usePreviewTabs) {
      getActions().keepPreviewTab();
    } else {
      getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
    }
  }

  _onMouseDown(event: SyntheticMouseEvent) {
    event.stopPropagation();

    // Select node on right-click (in order for context menu to behave correctly).
    if (isContextClick(event)) {
      if (!this.props.node.isSelected) {
        getActions().setSelectedNode(this.props.node.rootUri, this.props.node.uri);
      }
    }
  }

  _toggleNodeExpanded(deep: boolean): void {
    if (this.props.node.isExpanded) {
      if (deep) {
        getActions().collapseNodeDeep(this.props.node.rootUri, this.props.node.uri);
      } else {
        getActions().collapseNode(this.props.node.rootUri, this.props.node.uri);
      }
    } else {
      if (deep) {
        getActions().expandNodeDeep(this.props.node.rootUri, this.props.node.uri);
      } else {
        getActions().expandNode(this.props.node.rootUri, this.props.node.uri);
      }
    }
  }

  _checkboxOnChange(isChecked: boolean): void {
    if (isChecked) {
      getActions().checkNode(this.props.node.rootUri, this.props.node.uri);
    } else {
      getActions().uncheckNode(this.props.node.rootUri, this.props.node.uri);
    }
  }

  _checkboxOnClick(event: Event): void {
    event.stopPropagation();
  }
}
