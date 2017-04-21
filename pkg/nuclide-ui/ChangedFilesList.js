/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../commons-node/nuclideUri';
import type {FileChangeStatusValue} from '../nuclide-vcs-base';
import type {IconName} from '../nuclide-ui/types';

import addTooltip from './add-tooltip';
import classnames from 'classnames';
import {
 FileChangeStatusToIcon,
 FileChangeStatusToTextColor,
 repositoryForPath,
} from '../nuclide-vcs-base';
import nuclideUri from '../commons-node/nuclideUri';
import React from 'react';
import {FileChangeStatus} from '../nuclide-vcs-base';
import {Icon} from './Icon';
import PathWithFileIcon from './PathWithFileIcon';

const FILE_CHANGES_INITIAL_PAGE_SIZE = 100;

type ChangedFilesProps = {
  commandPrefix: string,
  enableInlineActions: boolean,
  fileChanges: Map<NuclideUri, FileChangeStatusValue>,
  hideEmptyFolders: boolean,
  onAddFile: (filePath: NuclideUri) => void,
  onDeleteFile: (filePath: NuclideUri) => void,
  onFileChosen: (filePath: NuclideUri) => void,
  onForgetFile: (filePath: NuclideUri) => void,
  onOpenFileInDiffView: (filePath: NuclideUri) => void,
  onRevertFile: (filePath: NuclideUri) => void,
  rootPath: NuclideUri,
  selectedFile: ?NuclideUri,
  shouldShowFolderName: boolean,
};

type ChangedFilesState = {
  isCollapsed: boolean,
  visiblePagesCount: number,
};

export default class ChangedFilesList extends React.Component {
  props: ChangedFilesProps;
  state: ChangedFilesState;

  constructor(props: ChangedFilesProps) {
    super(props);
    this.state = {
      isCollapsed: false,
      visiblePagesCount: 1,
    };
  }

  _getFileClassname(file: NuclideUri, fileChangeValue: FileChangeStatusValue): string {
    const {commandPrefix, rootPath, selectedFile} = this.props;
    const repository = repositoryForPath(rootPath);
    return classnames(
      'nuclide-file-changes-list-item',
      'list-item', {
        selected: file === selectedFile,
        [`${commandPrefix}-file-entry`]: repository != null && repository.getType() === 'hg',
      },
      FileChangeStatusToTextColor[fileChangeValue],
    );
  }

  _renderAction(
    key: string,
    icon: IconName,
    tooltipTitle: string,
    onClick: () => void,
  ): React.Element<any> {
    return (
      <div
        className="nuclide-file-changes-file-action"
        key={key}
        onClick={onClick}
        ref={addTooltip({
          delay: 300,
          placement: 'top',
          title: tooltipTitle,
        })}>
        <Icon icon={icon} />
      </div>
    );
  }

  _renderForgetAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'forget', /* key */
      'circle-slash', /* icon */
      'Forget (stop tracking in version control)', /* title */
      this.props.onForgetFile.bind(this, filePath),
    );
  }

  _renderDeleteAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'delete', /* key */
      'trashcan', /* icon */
      'Delete from file system', /* title */
      this.props.onDeleteFile.bind(this, filePath),
    );
  }

  _renderMarkDeletedAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'mark-deleted', /* key */
      'circle-slash', /* icon */
      'Mark as deleted (remove from version control)', /* title */
      this.props.onForgetFile.bind(this, filePath),
    );
  }

  _renderRestoreAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'restore', /* key */
      'playback-rewind', /* icon */
      'Restore (revert to last known version)', /* title */
      this.props.onRevertFile.bind(this, filePath),
    );
  }

  _renderAddAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'add', /* key */
      'plus', /* icon */
      'Add to version control', /* title */
      this.props.onAddFile.bind(this, filePath),
    );
  }

  _renderOpenInDiffViewAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'diff', /* key */
      'diff', /* icon */
      'Open in Diff View', /* title */
      this.props.onOpenFileInDiffView.bind(this, filePath),
    );
  }

  render(): ?React.Element<any> {
    const {
      fileChanges,
      enableInlineActions,
    } = this.props;
    if (fileChanges.size === 0 && this.props.hideEmptyFolders) {
      return null;
    }

    const filesToShow = FILE_CHANGES_INITIAL_PAGE_SIZE * this.state.visiblePagesCount;
    const sizeLimitedFileChanges = Array.from(fileChanges.entries()).slice(0, filesToShow);

    const rootClassName = classnames('list-nested-item', {
      collapsed: this.state.isCollapsed,
    });

    const showMoreFilesElement = fileChanges.size > filesToShow
      ? <div
          className="icon icon-ellipsis"
          ref={addTooltip({
            title: 'Show more files with uncommitted changes',
            delay: 300,
            placement: 'bottom',
          })}
          onClick={() => this.setState({visiblePagesCount: this.state.visiblePagesCount + 1})}
        />
      : null;

    return (
      <ul className="list-tree has-collapsable-children">
        <li className={rootClassName}>
          {this.props.shouldShowFolderName ?
            <div
              className="list-item"
              key={this.props.rootPath}
              onClick={() => this.setState({isCollapsed: !this.state.isCollapsed})}>
              <span
                className="icon icon-file-directory nuclide-file-changes-root-entry"
                data-path={this.props.rootPath}>
                {nuclideUri.basename(this.props.rootPath)}
              </span>
            </div> :
            null
          }
          <ul className="list-tree has-flat-children">
            {sizeLimitedFileChanges.map(
              ([filePath, fileChangeValue]) => {
                const baseName = nuclideUri.basename(filePath);
                let actions;
                if (enableInlineActions) {
                  const eligibleActions = [
                    this._renderOpenInDiffViewAction(filePath),
                  ];
                  switch (fileChangeValue) {
                    case FileChangeStatus.ADDED:
                      eligibleActions.push(
                        this._renderForgetAction(filePath),
                        this._renderDeleteAction(filePath),
                      );
                      break;
                    case FileChangeStatus.UNTRACKED:
                      eligibleActions.push(
                        this._renderAddAction(filePath),
                        this._renderDeleteAction(filePath),
                      );
                      break;
                    case FileChangeStatus.MISSING: // removed from FS but not VCS
                      eligibleActions.push(
                        this._renderRestoreAction(filePath),
                        this._renderMarkDeletedAction(filePath),
                      );
                      break;
                    case FileChangeStatus.MODIFIED:
                    case FileChangeStatus.REMOVED: // removed from both FS and VCS
                      eligibleActions.push(
                        this._renderRestoreAction(filePath),
                      );
                      break;
                  }
                  actions = (
                    <div className="nuclide-file-changes-file-actions">
                      {eligibleActions}
                    </div>
                  );
                }
                return (
                  <li
                    data-name={baseName}
                    data-path={filePath}
                    data-root={this.props.rootPath}
                    className={this._getFileClassname(filePath, fileChangeValue)}
                    key={filePath}>
                    <span
                      className="nuclide-file-changes-file-entry"
                      onClick={() => this.props.onFileChosen(filePath)}>
                      <Icon
                        className="nuclide-file-changes-file-entry-icon"
                        icon={FileChangeStatusToIcon[fileChangeValue]}
                      />
                      <PathWithFileIcon
                        path={baseName}
                        ref={addTooltip({
                          title: `${filePath} – Click to open`,
                          // Extra long delay to limit spawning aggressive follow-through behavior.
                          delay: 1000,
                          placement: 'top',
                        })}
                      />
                    </span>
                    {actions}
                  </li>
                );
              },
            )}
            <li>{showMoreFilesElement}</li>
          </ul>
        </li>
      </ul>
    );
  }
}
