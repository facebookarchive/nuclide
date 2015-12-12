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
import type {
  RemoteDirectory,
  RemoteFile,
} from '../../remote-connection';

import FileTreeHelpers from './FileTreeHelpers';
import FileTreeStore from './FileTreeStore';
import FileDialogComponent from '../components/FileDialogComponent';
import React from 'react-for-atom';
import RemoteUri from '../../remote-uri';

import fs from 'fs-plus';
import pathModule from 'path';

import invariant from 'assert';

let dialogComponent: ?ReactComponent;
let dialogHostElement: ?HTMLElement;

const FileSystemActions = {
  openAddFolderDialog(onDidConfirm: (filePath: ?string) => mixed): void {
    const node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog('folder', node.getLocalPath() + '/', async (filePath: string) => {
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
    });
  },

  openAddFileDialog(onDidConfirm: (filePath: ?string) => mixed): void {
    const node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog('file', node.getLocalPath() + '/', async (filePath: string) => {
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
        onDidConfirm(newFile.getPath());
      } else {
        atom.notifications.addError(`'${filePath}' already exists.`);
        onDidConfirm(null);
      }
    });
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
      onConfirm: (newBasename: string) => {
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
        if (FileTreeHelpers.isLocalFile(file)) {
          fs.rename(nodePath, newPath);
        } else {
          ((file: any): (RemoteDirectory | RemoteFile)).rename(newPath);
        }
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
    this._openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: initialValue,
      message: <span>Enter the new path for the duplicate.</span>,
      onConfirm: async (newBasename: string) => {
        const file = FileTreeHelpers.getFileByKey(node.nodeKey);
        if (file == null) {
          // TODO: Connection could have been lost for remote file.
          return;
        }
        if (FileTreeHelpers.isLocalFile(file)) {
          const directory = file.getParent();
          const newFile = directory.getFile(newBasename.trim());
          const newPath = newFile.getPath();
          fs.exists(newPath, function(exists) {
            if (!exists) {
              fs.copy(nodePath, newPath);
            } else {
              atom.notifications.addError(`'${newPath}' already exists.`);
            }
          });
        } else {
          invariant(file.isFile());
          const remoteFile = ((file: any): RemoteFile);
          const remoteDirectory = remoteFile.getParent();
          const newRemoteFile = remoteDirectory.getFile(newBasename.trim());
          const newRemotePath = newRemoteFile.getPath();

          const wasCopied =
            await remoteFile.copy(newRemoteFile.getLocalPath());
          if (!wasCopied) {
            atom.notifications.addError(`'${newRemotePath}' already exists.`);
            onDidConfirm(null);
          } else {
            onDidConfirm(newRemotePath);
          }
        }
      },
      onClose: this._closeDialog,
      selectBasename: true,
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

  _openAddDialog(entryType: string, path: string, onConfirm: (filePath: string) => mixed) {
    this._openDialog({
      iconClassName: 'icon-file-add',
      message: <span>Enter the path for the new {entryType} in the root:<br />{path}</span>,
      onConfirm,
      onClose: this._closeDialog,
    });
  },

  _openDialog(props: Object): void {
    this._closeDialog();
    dialogHostElement = document.createElement('div');
    atom.views.getView(atom.workspace).appendChild(dialogHostElement);
    dialogComponent = React.render(
      <FileDialogComponent {...props} />,
      dialogHostElement
    );
  },

  _closeDialog(): void {
    if (dialogComponent != null) {
      React.unmountComponentAtNode(dialogHostElement);
      dialogComponent = null;
    }
    if (dialogHostElement != null) {
      dialogHostElement.parentNode.removeChild(dialogHostElement);
      dialogHostElement = null;
    }
  },
};

module.exports = FileSystemActions;
