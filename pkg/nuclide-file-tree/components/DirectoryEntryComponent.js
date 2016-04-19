'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import type {FileTreeNode} from '../lib/FileTreeNode';

import FileTreeActions from '../lib/FileTreeActions';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import classnames from  'classnames';
import {filterName} from '../lib/FileTreeFilterHelper';
import {isContextClick} from '../lib/FileTreeHelpers';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {StatusCodeNumber} from '../../nuclide-hg-repository-base/lib/hg-constants';

import {FileEntryComponent} from './FileEntryComponent';

const getActions = FileTreeActions.getInstance;

type Props = {
  node: FileTreeNode;
};

export class DirectoryEntryComponent extends React.Component {
  props: Props;
  _animationFrameRequestId: ?number;

  constructor(props: Props) {
    super(props);
    (this: any)._onClick = this._onClick.bind(this);
    (this: any)._onMouseDown = this._onMouseDown.bind(this);
    (this: any)._checkboxOnChange = this._checkboxOnChange.bind(this);
    (this: any)._checkboxOnClick = this._checkboxOnClick.bind(this);
  }

  shouldComponentUpdate(nextProps: Object, nextState: void): boolean {
    return nextProps.node !== this.props.node;
  }

  scrollTrackedIntoView(): void {
    if (!this.props.node.containsTrackedNode) {
      return;
    }

    if (this.props.node.isTracked) {
      if (this._animationFrameRequestId != null) {
        return;
      }

      this._animationFrameRequestId = window.requestAnimationFrame(() => {
        ReactDOM.findDOMNode(this.refs['arrowContainer']).scrollIntoViewIfNeeded();
        this._animationFrameRequestId = null;
      });
      return;
    }

    const trackedChild = this.refs['tracked'];
    if (trackedChild != null) {
      trackedChild.scrollTrackedIntoView();
    }
  }

  componentWillUnmount(): void {
    if (this._animationFrameRequestId != null) {
      window.cancelAnimationFrame(this._animationFrameRequestId);
    }
  }

  render(): React.Element {
    const node = this.props.node;

    const outerClassName = classnames('directory entry list-nested-item', {
      'current-working-directory': node.isCwd,
      'collapsed': !node.isExpanded,
      'expanded': node.isExpanded,
      'project-root': node.isRoot,
      'selected': node.isSelected,
    });
    const listItemClassName = classnames('header list-item', {
      'loading': node.isLoading,
      'nuclide-file-tree-softened': node.shouldBeSoftened,
    });

    let statusClass;
    if (!node.conf.isEditingWorkingSet) {
      const vcsStatusCode = node.vcsStatusCode;
      if (vcsStatusCode === StatusCodeNumber.MODIFIED) {
        statusClass = 'status-modified';
      } else if (vcsStatusCode === StatusCodeNumber.ADDED) {
        statusClass = 'status-added';
      } else if (this.props.node.isIgnored) {
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

    const iconName = node.isCwd ? 'briefcase' : 'file-directory';
    let name = node.name;
    if (!node.isRoot) {
      name = filterName(name, node.highlightedText, node.isSelected);
    }

    return (
      <li
        className={`${outerClassName} ${statusClass}`}>
        <div
          className={listItemClassName}
          ref="arrowContainer"
          onClick={this._onClick}
          onMouseDown={this._onMouseDown}>
          <span
            className={`icon name icon-${iconName}`}
            ref="pathContainer"
            data-name={node.name}
            data-path={node.uri}>
            {this._renderCheckbox()}
            <span
              data-name={node.name}
              data-path={node.uri}>
              {name}
            </span>
          </span>
          {this._renderConnectionTitle()}
        </div>
        {this._renderChildren()}
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

  _renderChildren(): ?React.Element {
    if (!this.props.node.isExpanded) {
      return;
    }

    const children = this.props.node.children.toArray()
    .filter(childNode => childNode.shouldBeShown)
    .map(childNode => {
      if (childNode.isContainer) {
        if (childNode.containsTrackedNode) {
          return <DirectoryEntryComponent node={childNode} key={childNode.name} ref="tracked" />;
        } else {
          return <DirectoryEntryComponent node={childNode} key={childNode.name} />;
        }
      }

      if (childNode.containsTrackedNode) {
        return <FileEntryComponent node={childNode} key={childNode.name} ref="tracked" />;
      } else {
        return <FileEntryComponent node={childNode} key={childNode.name} />;
      }
    });

    return (
      <ul className="list-tree">
        {children}
      </ul>
    );
  }

  _onClick(event: SyntheticMouseEvent) {
    event.stopPropagation();

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
      if (this.props.node.isSelected) {
        getActions().unselectNode(this.props.node.rootUri, this.props.node.uri);
      } else {
        getActions().addSelectedNode(this.props.node.rootUri, this.props.node.uri);
      }
    } else {
      if (!this.props.node.isSelected) {
        getActions().setSelectedNode(this.props.node.rootUri, this.props.node.uri);
      }
      if (this.props.node.isSelected || this.props.node.conf.usePreviewTabs) {
        this._toggleNodeExpanded(deep);
      }
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
