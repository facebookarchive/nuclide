'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeHelpers = require('./FileTreeHelpers');
var FileTreeStore = require('./FileTreeStore');
var FileDialogComponent = require('../components/FileDialogComponent');
var React = require('react-for-atom');

var pathModule = require('path');
var {url} = require('nuclide-commons');

var dialogComponent: ?ReactComponent;
var dialogHostElement: ?HTMLElement;

var FileSystemActions = {
  openAddFolderDialog(): void {
    var node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog('folder', node.getLocalPath() + '/', async (filePath: string) => {
      // Prevent submission of a blank field from creating a directory.
      if (filePath === '') {
        return;
      }

      // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
      var directory = FileTreeHelpers.getDirectoryByKey(node.nodeKey);
      if (directory == null) {
        return;
      }

      var {pathname} = url.parse(filePath);
      var basename = pathModule.basename(pathname);
      var created = await directory.getSubdirectory(basename).create();
      if (!created) {
        atom.notifications.addError(`'${basename}' already exists.`);
      }
    });
  },

  _getSelectedContainerNode() {
    var store = FileTreeStore.getInstance();
    var rootKey = store.getFocusedRootKey();
    var nodeKey = rootKey ? store.getSelectedKeys(rootKey).first() : null;
    if (rootKey == null || nodeKey == null) {
      return null;
    }
    var node = store.getNode(rootKey, nodeKey);
    return node.isContainer ? node : node.getParentNode();
  },

  _openAddDialog(entryType: string, path: string, onConfirm: (filePath: string) => mixed) {
    this._openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: path,
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
