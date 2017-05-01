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
import {getAtomProjectRelativePath} from '../commons-atom/projects';
import {
 FileChangeStatusToIcon,
 FileChangeStatusToLabel,
 FileChangeStatusToTextColor,
} from '../nuclide-vcs-base';
import nuclideUri from '../commons-node/nuclideUri';
import React from 'react';
import {FileChangeStatus} from '../nuclide-vcs-base';
import {Icon} from './Icon';
import PathWithFileIcon from './PathWithFileIcon';

const ANALYTICS_SOURCE_KEY = 'inline';

type ChangedFileProps = {
  commandPrefix: string,
  // whether files can be expanded to reveal a diff of changes. Requires passing `fileChanges`.
  enableFileExpansion: boolean,
  enableInlineActions: boolean,
  // `null` values for FileDiffs for a given key are assumed to be in "loading" state.
  fileChanges: ?diffparser$FileDiff,
  filePath: NuclideUri,
  fileStatus: FileChangeStatusValue,
  isHgPath: boolean,
  isSelected: boolean,
  onAddFile: (filePath: NuclideUri) => void,
  onDeleteFile: (filePath: NuclideUri) => void,
  onFileChosen: (filePath: NuclideUri) => void,
  onForgetFile: (filePath: NuclideUri) => void,
  onOpenFileInDiffView: (filePath: NuclideUri) => void,
  onRevertFile: (filePath: NuclideUri) => void,
  rootPath: NuclideUri,
};

export default class ChangedFile extends React.Component {
  props: ChangedFileProps;

  _getFileClassname(): string {
    const {
      commandPrefix,
      fileStatus,
      isHgPath,
      isSelected,
    } = this.props;
    return classnames(
      'nuclide-changed-file',
      'list-item', {
        selected: isSelected,
        [`${commandPrefix}-file-entry`]: isHgPath,
      },
      FileChangeStatusToTextColor[fileStatus],
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
        className="nuclide-changed-file-action"
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
      'Forget (stop tracking file in version control)', /* title */
      this.props.onForgetFile.bind(this, filePath, ANALYTICS_SOURCE_KEY),
    );
  }

  _renderDeleteAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'delete', /* key */
      'trashcan', /* icon */
      'Delete file from file system', /* title */
      this.props.onDeleteFile.bind(this, filePath, ANALYTICS_SOURCE_KEY),
    );
  }

  _renderMarkDeletedAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'mark-deleted', /* key */
      'circle-slash', /* icon */
      'Mark file as deleted (remove from version control)', /* title */
      this.props.onForgetFile.bind(this, filePath, ANALYTICS_SOURCE_KEY),
    );
  }

  _renderRestoreAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'restore', /* key */
      'playback-rewind', /* icon */
      'Restore file (revert to last known version)', /* title */
      this.props.onRevertFile.bind(this, filePath, ANALYTICS_SOURCE_KEY),
    );
  }

  _renderAddAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'add', /* key */
      'plus', /* icon */
      'Add file to version control', /* title */
      this.props.onAddFile.bind(this, filePath, ANALYTICS_SOURCE_KEY),
    );
  }

  _renderOpenInDiffViewAction(filePath: string): React.Element<any> {
    return this._renderAction(
      'diff', /* key */
      'diff', /* icon */
      'Open file in Diff View', /* title */
      this.props.onOpenFileInDiffView.bind(this, filePath, ANALYTICS_SOURCE_KEY),
    );
  }

  render(): React.Element<any> {
    const {
      enableInlineActions,
      isHgPath,
      filePath,
      fileStatus,
    } = this.props;
    const baseName = nuclideUri.basename(filePath);
    let actions;
    if (enableInlineActions && isHgPath) {
      const eligibleActions = [
        this._renderOpenInDiffViewAction(filePath),
      ];
      switch (fileStatus) {
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
        <div className="nuclide-changed-file-actions">
          {eligibleActions}
        </div>
      );
    }
    const statusName = FileChangeStatusToLabel[fileStatus];
    const projectRelativePath = getAtomProjectRelativePath(filePath) || filePath;
    return (
      <li
        data-name={baseName}
        data-path={filePath}
        data-root={this.props.rootPath}
        className={this._getFileClassname()}
        key={filePath}>
        <span
          className="nuclide-changed-file-name"
          onClick={() => this.props.onFileChosen(filePath)}>
          <Icon
            className="nuclide-changed-file-name-icon"
            icon={FileChangeStatusToIcon[fileStatus]}
          />
          <PathWithFileIcon
            path={baseName}
            ref={addTooltip({
              title: `${statusName}: ${projectRelativePath} – Click to open`,
              // Extra long delay to limit spawning aggressive follow-through behavior.
              delay: 1000,
              placement: 'top',
            })}
          />
        </span>
        {actions}
      </li>
    );
  }
}
