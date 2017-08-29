'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _FileDialogComponent;

function _load_FileDialogComponent() {
  return _FileDialogComponent = _interopRequireDefault(require('../components/FileDialogComponent'));
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

var _reactDom = _interopRequireDefault(require('react-dom'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _atom = require('atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let atomPanel; /**
                * Copyright (c) 2015-present, Facebook, Inc.
                * All rights reserved.
                *
                * This source code is licensed under the license found in the LICENSE file in
                * the root directory of this source tree.
                *
                * 
                * @format
                */

let dialogComponent;

class FileSystemActions {
  openAddFolderDialog(onDidConfirm) {
    const node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog('folder', node.localPath + '/', (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (filePath, options) {
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
        const created = yield newDirectory.create();
        if (!created) {
          atom.notifications.addError(`'${basename}' already exists.`);
          onDidConfirm(null);
        } else {
          onDidConfirm(newDirectory.getPath());
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })());
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
    this._openAddDialog('file', (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(localPath), (() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (pathToCreate, options) {
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
        const created = yield newFile.create();
        if (created) {
          const newFilePath = newFile.getPath();
          // Open a new text editor while VCS actions complete in the background.
          onDidConfirm(newFilePath);
          if (hgRepository != null && options.addToVCS === true) {
            try {
              yield hgRepository.addAll([newFilePath]);
            } catch (e) {
              atom.notifications.addError(`Failed to add '${newFilePath}' to version control. Error: ${e.toString()}`);
            }
          }
        } else {
          atom.notifications.addError(`'${pathToCreate}' already exists.`);
          onDidConfirm(null);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    })(), additionalOptions);
  }

  _getHgRepositoryForPath(filePath) {
    const repository = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(filePath);
    if (repository != null && repository.getType() === 'hg') {
      return repository;
    }
    return null;
  }

  _onConfirmRename(node, nodePath, newBasename) {
    return (0, _asyncToGenerator.default)(function* () {
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

      yield (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.renameNode(node, newPath);
    })();
  }

  _onConfirmDuplicate(file, newBasename, addToVCS, onDidConfirm) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const directory = file.getParent();
      const newFile = directory.getFile(newBasename);
      return _this._doCopy([{ old: file.getPath(), new: newFile.getPath() }], addToVCS, onDidConfirm);
    })();
  }

  getDirectoryFromMetadata(cbMeta) {
    if (cbMeta == null || typeof cbMeta !== 'object' || cbMeta.directory == null || typeof cbMeta.directory !== 'string') {
      return null;
    }
    return (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(cbMeta.directory);
  }

  _onConfirmPaste(newDirPath, addToVCS, onDidConfirm = function () {}) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const newDir = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(newDirPath);
      if (newDir == null) {
        // bad target
        return;
      }

      const cb = atom.clipboard.readWithMetadata();
      const oldDir = _this2.getDirectoryFromMetadata(cb.metadata);
      if (oldDir == null) {
        // bad source
        return;
      }

      const copyPaths = [];
      cb.text.split(',').forEach(function (encodedFilename) {
        const filename = decodeURIComponent(encodedFilename);
        const oldPath = oldDir.getFile(filename).getPath();
        const newPath = newDir.getFile(filename).getPath();
        copyPaths.push({ old: oldPath, new: newPath });
      });

      yield _this2._doCopy(copyPaths, addToVCS, onDidConfirm);
    })();
  }

  _doCopy(copyPaths, addToVCS, onDidConfirm) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const copiedPaths = yield Promise.all(copyPaths.filter(function ({ old: oldPath, new: newPath }) {
        return (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(oldPath) === (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(newPath);
      }).map((() => {
        var _ref3 = (0, _asyncToGenerator.default)(function* ({ old: oldPath, new: newPath }) {
          const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(newPath);
          const isFile = (yield service.stat(oldPath)).isFile();
          const exists = isFile ? !(yield service.copy(oldPath, newPath)) : !(yield service.copyDir(oldPath, newPath));
          if (exists) {
            atom.notifications.addError(`'${newPath}' already exists.`);
            return [];
          } else {
            return [newPath];
          }
        });

        return function (_x5) {
          return _ref3.apply(this, arguments);
        };
      })()));

      const successfulPaths = [].concat(...copiedPaths);
      if (successfulPaths.length !== 0) {
        const hgRepository = _this3._getHgRepositoryForPath(successfulPaths[0]);
        if (hgRepository != null && addToVCS) {
          try {
            // We are not recording the copy in mercurial on purpose, because most of the time
            // it's either templates or files that have greatly changed since duplicating.
            yield hgRepository.addAll(successfulPaths);
          } catch (e) {
            const message = 'Paths were duplicated, but there was an error adding them to ' + 'version control.  Error: ' + e.toString();
            atom.notifications.addError(message);
            onDidConfirm([]);
            return;
          }
        }
      }

      onDidConfirm(successfulPaths);
    })();
  }

  openRenameDialog() {
    const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    const targetNodes = store.getTargetNodes();
    if (targetNodes.size !== 1) {
      // Can only rename one entry at a time.
      return;
    }

    const node = targetNodes.first();
    const nodePath = node.localPath;
    this._openDialog({
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
      onClose: this._closeDialog,
      selectBasename: true
    });
  }

  openDuplicateDialog(onDidConfirm) {
    const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    const targetNodes = store.getTargetNodes();
    if (targetNodes.size !== 1) {
      // Can only copy one entry at a time.
      return;
    }

    const node = targetNodes.first();
    const nodePath = node.localPath;
    let initialValue = (_nuclideUri || _load_nuclideUri()).default.basename(nodePath);
    const ext = (_nuclideUri || _load_nuclideUri()).default.extname(nodePath);
    initialValue = initialValue.substr(0, initialValue.length - ext.length) + '-copy' + ext;
    const hgRepository = (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.getHgRepositoryForNode(node);
    const additionalOptions = {};
    if (hgRepository !== null) {
      additionalOptions.addToVCS = 'Add the new file to version control.';
    }
    this._openDialog({
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
      onClose: this._closeDialog,
      selectBasename: true,
      additionalOptions
    });
  }

  openPasteDialog() {
    const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    const node = store.getSingleSelectedNode();
    if (node == null) {
      // don't paste if unselected
      return;
    }
    let newDir = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(node.uri);
    if (newDir == null) {
      // maybe it's a file?
      const file = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getFileByKey(node.uri);
      if (file == null) {
        // nope! do nothing if we can't find an entry
        return;
      }
      newDir = file.getParent();
    }

    const additionalOptions = {};
    if ((_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.getHgRepositoryForNode(node) !== null) {
      additionalOptions.addToVCS = 'Add the new file(s) to version control.';
    }
    this._openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: (_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(newDir.getPath()),
      message: _react.createElement(
        'span',
        null,
        'Paste file(s) from clipboard into'
      ),
      onConfirm: (pasteDirPath, options) => {
        this._onConfirmPaste(pasteDirPath.trim(), Boolean(options.addToVCS)).catch(error => {
          atom.notifications.addError(`Failed to paste into '${pasteDirPath}': ${error}`);
        });
      },
      onClose: this._closeDialog,
      additionalOptions
    });
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
    this._openDialog({
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
      onClose: this._closeDialog,
      additionalOptions
    });
  }

  _openDialog(props) {
    this._closeDialog();
    const dialogHostElement = document.createElement('div');
    atomPanel = atom.workspace.addModalPanel({ item: dialogHostElement });
    dialogComponent = _reactDom.default.render(_react.createElement((_FileDialogComponent || _load_FileDialogComponent()).default, props), dialogHostElement);
  }

  _closeDialog() {
    if (atomPanel != null) {
      if (dialogComponent != null) {
        _reactDom.default.unmountComponentAtNode(atomPanel.getItem());
        dialogComponent = null;
      }

      atomPanel.destroy();
      atomPanel = null;
    }
  }
}

exports.default = new FileSystemActions();