'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _FileActionModal;

function _load_FileActionModal() {
  return _FileActionModal = require('../../nuclide-ui/FileActionModal');
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('./FileTreeHelpers'));
}

var _FileTreeHgHelpers;

function _load_FileTreeHgHelpers() {
  return _FileTreeHgHelpers = _interopRequireDefault(require('./FileTreeHgHelpers'));
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('./FileTreeStore');
}

var _react = _interopRequireWildcard(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _atom = require('atom');

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FileSystemActions {
  openAddFolderDialog(onDidConfirm) {
    const node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog('folder', node.localPath + '/', async (filePath, options) => {
      // Prevent submission of a blank field from creating a directory.
      if (filePath === '') {
        return;
      }

      // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
      const directory = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(node.uri);
      if (directory == null) {
        return;
      }

      const { path } = (_nuclideUri || _load_nuclideUri()).default.parse(filePath);
      const basename = (_nuclideUri || _load_nuclideUri()).default.basename(path);
      const newDirectory = directory.getSubdirectory(basename);
      let created;
      try {
        created = await newDirectory.create();
      } catch (e) {
        atom.notifications.addError(`Could not create directory '${basename}': ${e.toString()}`);
        onDidConfirm(null);
        return;
      }
      if (!created) {
        atom.notifications.addError(`'${basename}' already exists.`);
        onDidConfirm(null);
      } else {
        onDidConfirm(newDirectory.getPath());
      }
    });
  }

  openAddFileDialog(onDidConfirm) {
    const node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }

    return this._openAddFileDialogImpl(node, node.localPath, node.uri, onDidConfirm);
  }

  openAddFileDialogRelative(onDidConfirm) {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor != null ? editor.getPath() : null;
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return;
    }

    const dirPath = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getParentKey(filePath);
    const rootNode = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance().getRootForPath(dirPath);

    if (rootNode) {
      const localPath = (_nuclideUri || _load_nuclideUri()).default.isRemote(dirPath) ? (_nuclideUri || _load_nuclideUri()).default.parse(dirPath).path : dirPath;

      return this._openAddFileDialogImpl(rootNode, (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(localPath), dirPath, onDidConfirm);
    }
  }

  _openAddFileDialogImpl(rootNode, localPath, filePath, onDidConfirm) {
    const hgRepository = (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.getHgRepositoryForNode(rootNode);
    const additionalOptions = {};
    if (hgRepository != null) {
      additionalOptions.addToVCS = 'Add the new file to version control.';
    }
    this._openAddDialog('file', (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(localPath), async (pathToCreate, options) => {
      // Prevent submission of a blank field from creating a file.
      if (pathToCreate === '') {
        return;
      }

      // TODO: check if pathToCreate is in rootKey and if not, find the rootKey it belongs to.
      const directory = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(filePath);
      if (directory == null) {
        return;
      }

      const newFile = directory.getFile(pathToCreate);
      let created;
      try {
        created = await newFile.create();
      } catch (e) {
        atom.notifications.addError(`Could not create file '${newFile.getPath()}': ${e.toString()}`);
        onDidConfirm(null);
        return;
      }
      if (!created) {
        atom.notifications.addError(`'${pathToCreate}' already exists.`);
        onDidConfirm(null);
        return;
      }

      const newFilePath = newFile.getPath();
      // Open a new text editor while VCS actions complete in the background.
      onDidConfirm(newFilePath);
      if (hgRepository != null && options.addToVCS === true) {
        try {
          await hgRepository.addAll([newFilePath]);
        } catch (e) {
          atom.notifications.addError(`Failed to add '${newFilePath}' to version control. Error: ${e.toString()}`);
        }
      }
    }, additionalOptions);
  }

  _getHgRepositoryForPath(filePath) {
    const repository = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(filePath);
    if (repository != null && repository.getType() === 'hg') {
      return repository;
    }
    return null;
  }

  async _onConfirmRename(node, nodePath, newBasename) {
    /*
     * Use `resolve` to strip trailing slashes because renaming a file to a name with a
     * trailing slash is an error.
     */
    let newPath = (_nuclideUri || _load_nuclideUri()).default.resolve(
    // Trim leading and trailing whitespace to prevent bad filenames.
    (_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(nodePath), newBasename.trim()));

    // Create a remote nuclide uri when the node being moved is remote.
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(node.uri)) {
      newPath = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri((_nuclideUri || _load_nuclideUri()).default.getHostname(node.uri), newPath);
    }

    await (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.renameNode(node, newPath);
  }

  async _onConfirmDuplicate(file, newBasename, addToVCS, onDidConfirm) {
    const directory = file.getParent();
    const newFile = directory.getFile(newBasename);
    return this._doCopy([{ old: file.getPath(), new: newFile.getPath() }], addToVCS, onDidConfirm);
  }

  getDirectoryFromMetadata(cbMeta) {
    if (cbMeta == null || typeof cbMeta !== 'object' || cbMeta.directory == null || typeof cbMeta.directory !== 'string') {
      return null;
    }
    return (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(cbMeta.directory);
  }

  async _onConfirmPaste(newPath, addToVCS, onDidConfirm = () => {}) {
    const copyPaths = [];
    const cb = atom.clipboard.readWithMetadata();
    const oldDir = this.getDirectoryFromMetadata(cb.metadata);
    if (oldDir == null) {
      // bad source
      return;
    }

    const filenames = cb.text.split(',');
    const newFile = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getFileByKey(newPath);
    const newDir = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(newPath);

    if (newFile == null && newDir == null) {
      // newPath doesn't resolve to a file or path
      atom.notifications.addError('Invalid target');
      return;
    } else if (filenames.length === 1) {
      const origFilePath = oldDir.getFile(cb.text).getPath();
      if (newFile != null) {
        // single file on clibboard; Path resolves to a file.
        // => copy old file into new file
        const destFilePath = newFile.getPath();
        copyPaths.push({ old: origFilePath, new: destFilePath });
      } else if (newDir != null) {
        // single file on clibboard; Path resolves to a folder.
        // => copy old file into new newDir folder
        const destFilePath = newDir.getFile(cb.text).getPath();
        copyPaths.push({ old: origFilePath, new: destFilePath });
      }
    } else {
      // multiple files in cb
      if (newDir == null) {
        atom.notifications.addError('Cannot rename when pasting multiple files');
        return;
      }

      filenames.forEach(encodedFilename => {
        const filename = decodeURIComponent(encodedFilename);
        const origFilePath = oldDir.getFile(filename).getPath();
        const destFilePath = newDir.getFile(filename).getPath();
        copyPaths.push({ old: origFilePath, new: destFilePath });
      });
    }

    await this._doCopy(copyPaths, addToVCS, onDidConfirm);
  }

  async _doCopy(copyPaths, addToVCS, onDidConfirm) {
    const copiedPaths = await Promise.all(copyPaths.filter(({ old: oldPath, new: newPath }) => (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(oldPath) === (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(newPath)).map(async ({ old: oldPath, new: newPath }) => {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(newPath);
      const isFile = (await service.stat(oldPath)).isFile();
      const exists = isFile ? !(await service.copy(oldPath, newPath)) : !(await service.copyDir(oldPath, newPath));
      if (exists) {
        atom.notifications.addError(`'${newPath}' already exists.`);
        return [];
      } else {
        return [newPath];
      }
    }));

    const successfulPaths = [].concat(...copiedPaths);
    onDidConfirm(successfulPaths);

    if (successfulPaths.length !== 0) {
      const hgRepository = this._getHgRepositoryForPath(successfulPaths[0]);
      if (hgRepository != null && addToVCS) {
        try {
          // We are not recording the copy in mercurial on purpose, because most of the time
          // it's either templates or files that have greatly changed since duplicating.
          await hgRepository.addAll(successfulPaths);
        } catch (e) {
          const message = 'Paths were duplicated, but there was an error adding them to ' + 'version control.  Error: ' + e.toString();
          atom.notifications.addError(message);
          return;
        }
      }
    }
  }

  openRenameDialog() {
    const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    const targetNodes = store.getTargetNodes();
    if (targetNodes.size !== 1) {
      // Can only rename one entry at a time.
      return;
    }

    const node = targetNodes.first();

    if (!(node != null)) {
      throw new Error('Invariant violation: "node != null"');
    }

    const nodePath = node.localPath;
    (0, (_FileActionModal || _load_FileActionModal()).openDialog)({
      iconClassName: 'icon-arrow-right',
      initialValue: (_nuclideUri || _load_nuclideUri()).default.basename(nodePath),
      message: node.isContainer ? _react.createElement(
        'span',
        null,
        'Enter the new path for the directory.'
      ) : _react.createElement(
        'span',
        null,
        'Enter the new path for the file.'
      ),
      onConfirm: (newBasename, options) => {
        this._onConfirmRename(node, nodePath, newBasename).catch(error => {
          atom.notifications.addError(`Rename to ${newBasename} failed: ${error.message}`);
        });
      },
      onClose: (_FileActionModal || _load_FileActionModal()).closeDialog,
      selectBasename: true
    });
  }

  openDuplicateDialog(onDidConfirm) {
    const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    const targetNodes = store.getTargetNodes();
    this.openNextDuplicateDialog(targetNodes, onDidConfirm);
  }

  openNextDuplicateDialog(nodes, onDidConfirm) {
    const node = nodes.first();

    if (!(node != null)) {
      throw new Error('Invariant violation: "node != null"');
    }

    const nodePath = (0, (_nullthrows || _load_nullthrows()).default)(node).localPath;
    let initialValue = (_nuclideUri || _load_nuclideUri()).default.basename(nodePath);
    const ext = (_nuclideUri || _load_nuclideUri()).default.extname(nodePath);
    initialValue = initialValue.substr(0, initialValue.length - ext.length) + '-copy' + ext;
    const hgRepository = (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.getHgRepositoryForNode(node);
    const additionalOptions = {};
    // eslint-disable-next-line eqeqeq
    if (hgRepository !== null) {
      additionalOptions.addToVCS = 'Add the new file to version control.';
    }

    const dialogProps = {
      iconClassName: 'icon-arrow-right',
      initialValue,
      message: _react.createElement(
        'span',
        null,
        'Enter the new path for the duplicate.'
      ),
      onConfirm: (newBasename, options) => {
        const file = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getFileByKey(node.uri);
        if (file == null) {
          // TODO: Connection could have been lost for remote file.
          return;
        }
        this._onConfirmDuplicate(file, newBasename.trim(), Boolean(options.addToVCS), onDidConfirm).catch(error => {
          atom.notifications.addError(`Failed to duplicate '${file.getPath()}'`);
        });
      },
      onClose: () => {
        if (nodes.rest().count() > 0) {
          this.openNextDuplicateDialog(nodes.rest(), onDidConfirm);
        } else {
          (0, (_FileActionModal || _load_FileActionModal()).closeDialog)();
        }
      },
      selectBasename: true,
      additionalOptions
    };
    (0, (_FileActionModal || _load_FileActionModal()).openDialog)(dialogProps);
  }

  // provide appropriate UI feedback depending on whether user
  // has single or multiple files in the clipboard
  _getPasteDialogProps(path) {
    const cb = atom.clipboard.readWithMetadata();
    const filenames = cb.text.split(',');
    if (filenames.length === 1) {
      return {
        initialValue: path.getFile(cb.text).getPath(),
        message: _react.createElement(
          'span',
          null,
          'Paste file from clipboard into'
        )
      };
    } else {
      return {
        initialValue: (_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(path.getPath()),
        message: _react.createElement(
          'span',
          null,
          'Paste files from clipboard into the following folder'
        )
      };
    }
  }

  openPasteDialog() {
    const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    const node = store.getSingleSelectedNode();
    if (node == null) {
      // don't paste if unselected
      return;
    }

    let newPath = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(node.uri);
    if (newPath == null) {
      // maybe it's a file?
      const file = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getFileByKey(node.uri);
      if (file == null) {
        // nope! do nothing if we can't find an entry
        return;
      }
      newPath = file.getParent();
    }

    const additionalOptions = {};
    // eslint-disable-next-line eqeqeq
    if ((_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.getHgRepositoryForNode(node) !== null) {
      additionalOptions.addToVCS = 'Add the new file(s) to version control.';
    }
    (0, (_FileActionModal || _load_FileActionModal()).openDialog)(Object.assign({
      iconClassName: 'icon-arrow-right'
    }, this._getPasteDialogProps(newPath), {
      onConfirm: (pasteDirPath, options) => {
        this._onConfirmPaste(pasteDirPath.trim(), Boolean(options.addToVCS)).catch(error => {
          atom.notifications.addError(`Failed to paste into '${pasteDirPath}': ${error}`);
        });
      },
      onClose: (_FileActionModal || _load_FileActionModal()).closeDialog,
      additionalOptions
    }));
  }

  _getSelectedContainerNode() {
    const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    /*
     * TODO: Choosing the last selected key is inexact when there is more than 1 root. The Set of
     * selected keys should be maintained as a flat list across all roots to maintain insertion
     * order.
     */
    const node = store.getSelectedNodes().first();
    if (node) {
      return node.isContainer ? node : node.parent;
    }

    return null;
  }

  _openAddDialog(entryType, path, onConfirm, additionalOptions = {}) {
    (0, (_FileActionModal || _load_FileActionModal()).openDialog)({
      iconClassName: 'icon-file-add',
      message: _react.createElement(
        'span',
        null,
        'Enter the path for the new ',
        entryType,
        ' in the root:',
        _react.createElement('br', null),
        path
      ),
      onConfirm,
      onClose: (_FileActionModal || _load_FileActionModal()).closeDialog,
      additionalOptions
    });
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

exports.default = new FileSystemActions();