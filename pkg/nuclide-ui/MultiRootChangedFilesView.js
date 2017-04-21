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

import {
 addPath,
 confirmAndRevertPath,
 confirmAndDeletePath,
 forgetPath,
 FileChangeStatus,
 RevertibleStatusCodes,
} from '../nuclide-vcs-base';
import {goToLocation} from '../commons-atom/go-to-location';
import {openFileInDiffView} from '../commons-atom/open-in-diff-view';
import invariant from 'assert';
import nuclideUri from '../commons-node/nuclideUri';
import React from 'react';
import UniversalDisposable from '../commons-node/UniversalDisposable';
import ChangedFilesList from './ChangedFilesList';

type Props = {
  enableInlineActions?: true,
  fileChanges: Map<NuclideUri, Map<NuclideUri, FileChangeStatusValue>>,
  commandPrefix: string,
  selectedFile: ?NuclideUri,
  hideEmptyFolders?: boolean,
  onFileChosen: (filePath: NuclideUri) => void,
  getRevertTargetRevision?: () => ?string,
  openInDiffViewOption?: boolean,
};

export class MultiRootChangedFilesView extends React.Component {
  props: Props;
  _subscriptions: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    (this: any)._handleAddFile = this._handleAddFile.bind(this);
    (this: any)._handleDeleteFile = this._handleDeleteFile.bind(this);
    (this: any)._handleForgetFile = this._handleForgetFile.bind(this);
    (this: any)._handleOpenFileInDiffView = this._handleOpenFileInDiffView.bind(this);
    (this: any)._handleRevertFile = this._handleRevertFile.bind(this);
  }

  componentDidMount(): void {
    this._subscriptions = new UniversalDisposable();
    const {
      commandPrefix,
      openInDiffViewOption,
    } = this.props;
    this._subscriptions.add(atom.contextMenu.add({
      [`.${commandPrefix}-file-entry`]: [
        {type: 'separator'},
        {
          label: 'Add to Mercurial',
          command: `${commandPrefix}:add`,
          shouldDisplay: event => {
            return this._getStatusCodeForFile(event) === FileChangeStatus.UNTRACKED;
          },
        },
        {
          label: 'Open in Diff View',
          command: `${commandPrefix}:open-in-diff-view`,
          shouldDisplay: event => {
            return atom.packages.isPackageLoaded('fb-diff-view') && openInDiffViewOption;
          },
        },
        {
          label: 'Revert',
          command: `${commandPrefix}:revert`,
          shouldDisplay: event => {
            const statusCode = this._getStatusCodeForFile(event);
            if (statusCode == null) {
              return false;
            }
            return RevertibleStatusCodes.includes(statusCode);
          },
        },
        {
          label: 'Delete',
          command: `${commandPrefix}:delete-file`,
          shouldDisplay: event => {
            const statusCode = this._getStatusCodeForFile(event);
            return statusCode !== FileChangeStatus.REMOVED;
          },
        },
        {
          label: 'Goto File',
          command: `${commandPrefix}:goto-file`,
        },
        {
          label: 'Copy File Name',
          command: `${commandPrefix}:copy-file-name`,
        },
        {
          label: 'Copy Full Path',
          command: `${commandPrefix}:copy-full-path`,
        },
        {type: 'separator'},
      ],
    }));

    this._subscriptions.add(atom.commands.add(
      `.${commandPrefix}-file-entry`,
      `${commandPrefix}:goto-file`,
      event => {
        const filePath = this._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          goToLocation(filePath);
        }
      },
    ));

    this._subscriptions.add(atom.commands.add(
      `.${commandPrefix}-file-entry`,
      `${commandPrefix}:copy-full-path`,
      event => {
        atom.clipboard.write(nuclideUri.getPath(this._getFilePathFromEvent(event) || ''));
      },
    ));
    this._subscriptions.add(atom.commands.add(
      `.${commandPrefix}-file-entry`,
      `${commandPrefix}:delete-file`,
      event => {
        const nuclideFilePath = this._getFilePathFromEvent(event);
        this._handleDeleteFile(nuclideFilePath);
      }),
    );
    this._subscriptions.add(atom.commands.add(
      `.${commandPrefix}-file-entry`,
      `${commandPrefix}:copy-file-name`,
      event => {
        atom.clipboard.write(nuclideUri.basename(this._getFilePathFromEvent(event) || ''));
      },
    ));
    this._subscriptions.add(atom.commands.add(
      `.${commandPrefix}-file-entry`,
      `${commandPrefix}:add`,
      event => {
        const filePath = this._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          this._handleAddFile(filePath);
        }
      },
    ));
    this._subscriptions.add(atom.commands.add(
      `.${commandPrefix}-file-entry`,
      `${commandPrefix}:revert`,
      event => {
        const filePath = this._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          this._handleRevertFile(filePath);
        }
      },
    ));

    this._subscriptions.add(atom.commands.add(
      `.${commandPrefix}-file-entry`,
      `${commandPrefix}:open-in-diff-view`,
      event => {
        const filePath = this._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          this._handleOpenFileInDiffView(filePath);
        }
      },
    ));
  }

  _getStatusCodeForFile(event: MouseEvent): ?number {
    // Walk up the DOM tree to the element containing the relevant data- attributes.
    const target = ((event.target: any): HTMLElement).closest('.nuclide-file-changes-list-item');
    invariant(target);
    const filePath = target.getAttribute('data-path');
    const rootPath = target.getAttribute('data-root');
    // $FlowFixMe
    const fileChangesForRoot = this.props.fileChanges.get(rootPath);
    invariant(fileChangesForRoot, 'Invalid rootpath');
    // $FlowFixMe
    const statusCode = fileChangesForRoot.get(filePath);
    return statusCode;
  }

  _getFilePathFromEvent(event: Event): NuclideUri {
    const eventTarget: HTMLElement = (event.currentTarget: any);
    // $FlowFixMe
    return eventTarget.getAttribute('data-path');
  }

  _handleAddFile(filePath: string): void {
    addPath(filePath);
  }

  _handleDeleteFile(filePath: string): void {
    confirmAndDeletePath(filePath);
  }

  _handleForgetFile(filePath: string): void {
    forgetPath(filePath);
  }

  _handleOpenFileInDiffView(filePath: string): void {
    openFileInDiffView(filePath);
  }

  _handleRevertFile(filePath: string): void {
    const {getRevertTargetRevision} = this.props;
    let targetRevision = null;
    if (getRevertTargetRevision != null) {
      targetRevision = getRevertTargetRevision();
    }
    confirmAndRevertPath(filePath, targetRevision);
  }

  render(): React.Element<any> {
    const {
      commandPrefix,
      enableInlineActions,
      fileChanges: fileChangesByRoot,
      hideEmptyFolders,
      onFileChosen,
      selectedFile,
    } = this.props;
    if (fileChangesByRoot.size === 0) {
      return <div>No changes</div>;
    }
    const shouldShowFolderName = fileChangesByRoot.size > 1;
    return (
      <div className="nuclide-ui-multi-root-file-tree-container">
        {Array.from(fileChangesByRoot.entries()).map(([root, fileChanges]) =>
          <ChangedFilesList
            commandPrefix={commandPrefix}
            enableInlineActions={enableInlineActions === true}
            fileChanges={fileChanges}
            hideEmptyFolders={hideEmptyFolders}
            key={root}
            onAddFile={this._handleAddFile}
            onDeleteFile={this._handleDeleteFile}
            onFileChosen={onFileChosen}
            onForgetFile={this._handleForgetFile}
            onOpenFileInDiffView={this._handleOpenFileInDiffView}
            onRevertFile={this._handleRevertFile}
            rootPath={root}
            selectedFile={selectedFile}
            shouldShowFolderName={shouldShowFolderName}
          />,
        )}
      </div>
    );
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }
}
