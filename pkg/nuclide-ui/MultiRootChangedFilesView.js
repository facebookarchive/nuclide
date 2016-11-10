'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../commons-node/nuclideUri';
import type {FileChangeStatusValue} from '../nuclide-hg-git-bridge/lib/constants';

import {
 FileChangeStatus,
 RevertibleStatusCodes,
} from '../nuclide-hg-git-bridge/lib/constants';
import {getFileSystemServiceByNuclideUri} from '../nuclide-remote-connection';
import {HgRepositoryClient} from '../nuclide-hg-repository-client/lib/HgRepositoryClient';
import invariant from 'assert';
import nuclideUri from '../commons-node/nuclideUri';
import {React} from 'react-for-atom';
import {repositoryForPath} from '../nuclide-hg-git-bridge';
import UniversalDisposable from '../commons-node/UniversalDisposable';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {addPath, revertPath} from '../nuclide-hg-repository/lib/actions';
import ChangedFilesList from './ChangedFilesList';


type Props = {
  fileChanges: Map<NuclideUri, Map<NuclideUri, FileChangeStatusValue>>,
  commandPrefix: string,
  selectedFile: ?NuclideUri,
  hideEmptyFolders?: boolean,
  onFileChosen: (filePath: NuclideUri) => void,
};

export class MultiRootChangedFilesView extends React.Component {
  props: Props;
  _subscriptions: UniversalDisposable;

  componentDidMount(): void {
    this._subscriptions = new UniversalDisposable();
    const {commandPrefix} = this.props;
    this._subscriptions.add(atom.contextMenu.add({
      [`.${commandPrefix}-file-entry`]: [
        {type: 'separator'},
        {
          label: 'Add to Mercurial',
          command: `${commandPrefix}:add`,
          shouldDisplay: event => {
            // The context menu has the `currentTarget` set to `document`.
            // Hence, use `target` instead.
            const filePath = event.target.getAttribute('data-path');
            const rootPath = event.target.getAttribute('data-root');
            const fileChangesForRoot = this.props.fileChanges.get(rootPath);
            invariant(fileChangesForRoot, 'Invalid rootpath');
            const statusCode = fileChangesForRoot.get(filePath);
            return statusCode === FileChangeStatus.UNTRACKED;
          },
        },
        {
          label: 'Revert',
          command: `${commandPrefix}:revert`,
          shouldDisplay: event => {
            // The context menu has the `currentTarget` set to `document`.
            // Hence, use `target` instead.
            const filePath = event.target.getAttribute('data-path');
            const rootPath = event.target.getAttribute('data-root');
            const fileChangesForRoot = this.props.fileChanges.get(rootPath);
            invariant(fileChangesForRoot, 'Invalid rootpath');
            const statusCode = fileChangesForRoot.get(filePath);
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
            const filePath = event.target.getAttribute('data-path');
            const fsService = getFileSystemServiceByNuclideUri(filePath);
            return fsService.exists(filePath);
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
          atom.workspace.open(filePath);
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
        const filePath = nuclideUri.getPath(nuclideFilePath);
        const fsService = getFileSystemServiceByNuclideUri(nuclideFilePath);
        fsService.unlink(filePath);

        const repository = repositoryForPath(nuclideFilePath);
        if (repository == null || repository.getType() !== 'hg') {
          return;
        }

        ((repository: any): HgRepositoryClient).remove([filePath], true);
      },
    ));
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
          addPath(filePath);
        }
      },
    ));
    this._subscriptions.add(atom.commands.add(
      `.${commandPrefix}-file-entry`,
      `${commandPrefix}:revert`,
      event => {
        const filePath = this._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          revertPath(filePath);
        }
      },
    ));
  }

  _getFilePathFromEvent(event: Event): NuclideUri {
    const eventTarget: HTMLElement = (event.currentTarget: any);
    return eventTarget.getAttribute('data-path');
  }

  render(): React.Element<any> {
    if (this.props.fileChanges.size === 0) {
      return <div>No changes</div>;
    }

    return (
      <div className="nuclide-ui-multi-root-file-tree-container">
        {Array.from(this.props.fileChanges.entries()).map(([root, fileChanges]) =>
          <ChangedFilesList
            key={root}
            fileChanges={fileChanges}
            rootPath={root}
            commandPrefix={this.props.commandPrefix}
            selectedFile={this.props.selectedFile}
            hideEmptyFolders={this.props.hideEmptyFolders}
            shouldShowFolderName={this.props.fileChanges.size > 1}
            onFileChosen={this.props.onFileChosen}
          />,
        )}
      </div>
    );
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }
}
