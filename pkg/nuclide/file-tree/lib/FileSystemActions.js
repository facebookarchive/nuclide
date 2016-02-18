'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type FileTreeNode from './FileTreeNode';
import type {HgRepositoryClient} from '../../hg-repository-client';
import type {
  RemoteDirectory,
  RemoteFile,
} from '../../remote-connection';

import FileDialogComponent from '../components/FileDialogComponent';
import FileTreeHelpers from './FileTreeHelpers';
import FileTreeStore from './FileTreeStore';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import RemoteUri from '../../remote-uri';
import {File} from 'atom';
import {fsPromise} from '../../../nuclide/commons';
import {repositoryForPath} from '../../hg-git-bridge';

import invariant from 'assert';
import pathModule from 'path';

let dialogComponent: ?ReactComponent;
let dialogHostElement: ?HTMLElement;

const FileSystemActions = {
  openAddFolderDialog(onDidConfirm: (filePath: ?string) => mixed): void {
    const node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog(
      'folder',
      node.getLocalPath() + '/',
      async (filePath: string, options: Object) => {
        // Prevent submission of a blank field from creating a directory.
        if (filePath === '') {
          return;
        }

        // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
        const directory = FileTreeHelpers.getDirectoryByKey(node.nodeKey);
        if (directory == null) {
          return;
        }

        const {pathname} = RemoteUri.parse(filePath);
        const basename = pathModule.basename(pathname);
        const newDirectory = directory.getSubdirectory(basename);
        const created = await newDirectory.create();
        if (!created) {
          atom.notifications.addError(`'${basename}' already exists.`);
          onDidConfirm(null);
        } else {
          onDidConfirm(newDirectory.getPath());
        }
      },
    );
  },

  openAddFileDialog(onDidConfirm: (filePath: ?string) => mixed): void {
    const node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    const hgRepository = this._getHgRepositoryForNode(node);
    const additionalOptions = {};
    if (hgRepository !== null) {
      additionalOptions['addToVCS'] = 'Add the new file to version control.';
    }
    this._openAddDialog(
      'file',
      node.getLocalPath() + pathModule.sep,
      async (filePath: string, options: {addToVCS?: boolean}) => {
        // Prevent submission of a blank field from creating a file.
        if (filePath === '') {
          return;
        }

        // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
        const directory = FileTreeHelpers.getDirectoryByKey(node.nodeKey);
        if (directory == null) {
          return;
        }

        const newFile = directory.getFile(filePath);
        const created = await newFile.create();
        if (created) {
          if (hgRepository !== null && options.addToVCS === true) {
            try {
              await hgRepository.add(newFile.getPath());
            } catch (e) {
              atom.notifications.addError(
                `Failed to add '${newFile.getPath}' to version control.  Error: ${e.toString()}`,
              );
            }
          }
          onDidConfirm(newFile.getPath());
        } else {
          atom.notifications.addError(`'${filePath}' already exists.`);
          onDidConfirm(null);
        }
      },
      additionalOptions,
    );
  },

  _getHgRepositoryForNode(node: FileTreeNode): ?HgRepositoryClient {
    const file = FileTreeHelpers.getFileByKey(node.nodeKey);
    if (file == null) {
      return null;
    }
    return this._getHgRepositoryForPath(file.getPath());
  },

  _getHgRepositoryForPath(filePath: string): ?HgRepositoryClient {
    const repository = repositoryForPath(filePath);
    if (repository != null && repository.getType() === 'hg') {
      return ((repository: any): HgRepositoryClient);
    }
    return null;
  },

  async _onConfirmRename(
    node: FileTreeNode,
    nodePath: string,
    newBasename: string,
  ): Promise<void> {
    const file = FileTreeHelpers.getFileByKey(node.nodeKey);
    if (file == null) {
      // TODO: Connection could have been lost for remote file.
      return;
    }

    /*
     * Use `resolve` to strip trailing slashes because renaming a file to a name with a
     * trailing slash is an error.
     */
    const newPath = pathModule.resolve(
      // Trim leading and trailing whitespace to prevent bad filenames.
      pathModule.join(pathModule.dirname(nodePath), newBasename.trim())
    );
    const hgRepository = this._getHgRepositoryForNode(node);
    let shouldFSRename = true;
    if (hgRepository !== null) {
      try {
        shouldFSRename = false;
        await hgRepository.rename(file.getPath(), newPath);
      } catch (e) {
        atom.notifications.addError(
          '`hg rename` failed, will try to move the file ignoring version control instead.  ' +
          'Error: ' + e.toString(),
        );
        shouldFSRename = true;
      }
    }
    if (shouldFSRename) {
      if (FileTreeHelpers.isLocalFile(file)) {
        await fsPromise.rename(nodePath, newPath);
      } else {
        await ((file: any): (RemoteDirectory | RemoteFile)).rename(newPath);
      }
    }
  },

  async _onConfirmDuplicate(
    file: File | RemoteFile,
    nodePath: string,
    newBasename: string,
    addToVCS: boolean,
    onDidConfirm: (filePath: ?string) => mixed,
  ): Promise<void> {
    const directory = file.getParent();
    const newFile = directory.getFile(newBasename);
    const newPath = newFile.getPath();
    let exists = false;
    if (FileTreeHelpers.isLocalFile(file)) {
      exists = await fsPromise.exists(newPath);
      if (!exists) {
        await fsPromise.copy(nodePath, newPath);
      }
    } else {
      invariant(file.isFile());
      const remoteFile = ((file: any): RemoteFile);
      const newRemoteFile = ((newFile: any): RemoteFile);

      const wasCopied = await remoteFile.copy(newRemoteFile.getLocalPath());
      exists = !wasCopied;
    }
    if (exists) {
      atom.notifications.addError(`'${newPath}' already exists.`);
      onDidConfirm(null);
      return;
    }
    const hgRepository = this._getHgRepositoryForPath(newPath);
    if (hgRepository !== null && addToVCS) {
      try {
        await hgRepository.add(newPath);
      } catch (e) {
        const message = newPath + ' was duplicated, but there was an error adding it to ' +
          'version control.  Error: ' + e.toString();
        atom.notifications.addError(message);
        onDidConfirm(null);
        return;
      }
      onDidConfirm(newPath);
    }
  },

  openRenameDialog(): void {
    const store = FileTreeStore.getInstance();
    const selectedNodes = store.getSelectedNodes();
    if (selectedNodes.size !== 1) {
      // Can only rename one entry at a time.
      return;
    }

    const node = selectedNodes.first();
    const nodePath = node.getLocalPath();
    this._openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: pathModule.basename(nodePath),
      message: node.isContainer
        ? <span>Enter the new path for the directory.</span>
        : <span>Enter the new path for the file.</span>,
      onConfirm: (newBasename: string, options: Object) => {
        this._onConfirmRename(node, nodePath, newBasename).catch(error => {
          atom.notifications.addError(`Rename to ${newBasename} failed`);
        });
      },
      onClose: this._closeDialog,
      selectBasename: true,
    });
  },

  openDuplicateDialog(onDidConfirm: (filePath: ?string) => mixed): void {
    const store = FileTreeStore.getInstance();
    const selectedNodes = store.getSelectedNodes();
    if (selectedNodes.size !== 1) {
      // Can only copy one entry at a time.
      return;
    }

    const node = selectedNodes.first();
    const nodePath = node.getLocalPath();
    let initialValue = pathModule.basename(nodePath);
    const ext = pathModule.extname(nodePath);
    initialValue = initialValue.substr(0, initialValue.length - ext.length) + '-copy' + ext;
    const hgRepository = this._getHgRepositoryForNode(node);
    const additionalOptions = {};
    if (hgRepository !== null) {
      additionalOptions['addToVCS'] = 'Add the new file to version control.';
    }
    this._openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: initialValue,
      message: <span>Enter the new path for the duplicate.</span>,
      onConfirm: (newBasename: string, options: {addToVCS?: boolean}) => {
        const file = FileTreeHelpers.getFileByKey(node.nodeKey);
        if (file == null) {
          // TODO: Connection could have been lost for remote file.
          return;
        }
        this._onConfirmDuplicate(
          file,
          nodePath,
          newBasename.trim(),
          !!options.addToVCS,
          onDidConfirm,
        ).catch(error => {
          atom.notifications.addError(`Failed to duplicate '{file.getPath()}'`);
        });
      },
      onClose: this._closeDialog,
      selectBasename: true,
      additionalOptions,
    });
  },

  _getSelectedContainerNode(): ?FileTreeNode {
    const store = FileTreeStore.getInstance();
    /*
     * TODO: Choosing the last selected key is inexact when there is more than 1 root. The Set of
     * selected keys should be maintained as a flat list across all roots to maintain insertion
     * order.
     */
    const nodeKey = store.getSelectedKeys().last();
    if (nodeKey == null) {
      return null;
    }
    const rootKey = store.getRootForKey(nodeKey);
    if (rootKey == null) {
      return null;
    }
    const node = store.getNode(rootKey, nodeKey);
    return node.isContainer ? node : node.getParentNode();
  },

  _openAddDialog(
    entryType: string,
    path: string,
    onConfirm: (filePath: string, options: Object) => mixed,
    additionalOptions?: Object = {},
  ) {
    this._openDialog({
      iconClassName: 'icon-file-add',
      message: <span>Enter the path for the new {entryType} in the root:<br />{path}</span>,
      onConfirm,
      onClose: this._closeDialog,
      additionalOptions,
    });
  },

  _openDialog(props: Object): void {
    this._closeDialog();
    dialogHostElement = document.createElement('div');
    atom.views.getView(atom.workspace).appendChild(dialogHostElement);
    dialogComponent = ReactDOM.render(
      <FileDialogComponent {...props} />,
      dialogHostElement
    );
  },

  _closeDialog(): void {
    if (dialogComponent != null) {
      ReactDOM.unmountComponentAtNode(dialogHostElement);
      dialogComponent = null;
    }
    if (dialogHostElement != null) {
      dialogHostElement.parentNode.removeChild(dialogHostElement);
      dialogHostElement = null;
    }
  },
};

module.exports = FileSystemActions;
