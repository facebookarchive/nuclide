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
import {fileTypeClass} from '../../nuclide-atom-helpers';
import {isContextClick} from '../lib/FileTreeHelpers';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {StatusCodeNumber} from '../../nuclide-hg-repository-base/lib/hg-constants';
import type {FileTreeNode} from '../lib/FileTreeNode';

const getActions = FileTreeActions.getInstance;

type Props = {
  node: FileTreeNode;
};

export class FileEntryComponent extends React.Component {
  props: Props;
  _animationFrameRequestId: ?number;

  constructor(props: Props) {
    super(props);
    (this: any)._onClick = this._onClick.bind(this);
    (this: any)._checkboxOnChange = this._checkboxOnChange.bind(this);
    (this: any)._checkboxOnClick = this._checkboxOnClick.bind(this);
    (this: any)._onMouseDown = this._onMouseDown.bind(this);
    (this: any)._onDoubleClick = this._onDoubleClick.bind(this);
  }

  shouldComponentUpdate(nextProps: Props, nextState: void): boolean {
    return this.props.node !== nextProps.node;
  }

  scrollTrackedIntoView(): void {
    if (this.props.node.isTracked) {
      if (this._animationFrameRequestId != null) {
        return;
      }

      this._animationFrameRequestId = window.requestAnimationFrame(() => {
        ReactDOM.findDOMNode(this).scrollIntoViewIfNeeded();
        this._animationFrameRequestId = null;
      });
    }
  }

  componentWillUnmount(): void {
    if (this._animationFrameRequestId != null) {
      window.cancelAnimationFrame(this._animationFrameRequestId);
    }
  }

  render(): ReactElement {
    const outerClassName = classnames('entry file list-item', {
      'selected': this.props.node.isSelected,
      'nuclide-file-tree-softened': this.props.node.shouldBeSoftened,
    });

    let statusClass;
    if (!this.props.node.conf.isEditingWorkingSet) {
      const vcsStatusCode = this.props.node.vcsStatusCode;
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
      switch (this.props.node.checkedStatus) {
        case 'checked':
          statusClass = 'status-added';
          break;
        default:
          statusClass = '';
          break;
      }
    }

    return (
      <li
        className={`${outerClassName} ${statusClass}`}
        onClick={this._onClick}
        onMouseDown={this._onMouseDown}
        onDoubleClick={this._onDoubleClick}>
        <span
          className={`icon name ${fileTypeClass(this.props.node.name)}`}
          data-name={this.props.node.name}
          data-path={this.props.node.uri}>
          {this._renderCheckbox()}
          <span
            data-name={this.props.node.name}
            data-path={this.props.node.uri}>
            {this.props.node.name}
          </span>
        </span>
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
        onChange={this._checkboxOnChange}
        onClick={this._checkboxOnClick}
      />
    );
  }

  _onClick(event: SyntheticMouseEvent) {
    event.stopPropagation();

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
      if (this.props.node.conf.usePreviewTabs) {
        getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
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

  _onDoubleClick(event: SyntheticMouseEvent) {
    event.stopPropagation();

    if (this.props.node.conf.usePreviewTabs) {
      getActions().keepPreviewTab();
    } else {
      getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
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
