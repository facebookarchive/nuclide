function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _componentsFileDialogComponent = require('../components/FileDialogComponent');

var _componentsFileDialogComponent2 = _interopRequireDefault(_componentsFileDialogComponent);

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _FileTreeStore = require('./FileTreeStore');

var _reactForAtom = require('react-for-atom');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _atom = require('atom');

var _nuclideClient = require('../../nuclide-client');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var dialogComponent = undefined;
var dialogHostElement = undefined;

var legalStatusCodeForRename = new Set([_nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED, _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN, _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED]);

var FileSystemActions = {
  openAddFolderDialog: function openAddFolderDialog(onDidConfirm) {
    var node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog('folder', node.localPath + '/', _asyncToGenerator(function* (filePath, options) {
      // Prevent submission of a blank field from creating a directory.
      if (filePath === '') {
        return;
      }

      // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
      var directory = _FileTreeHelpers2['default'].getDirectoryByKey(node.uri);
      if (directory == null) {
        return;
      }

      var _RemoteUri$parse = _nuclideRemoteUri2['default'].parse(filePath);

      var pathname = _RemoteUri$parse.pathname;

      var basename = _path2['default'].basename(pathname);
      var newDirectory = directory.getSubdirectory(basename);
      var created = yield newDirectory.create();
      if (!created) {
        atom.notifications.addError('\'' + basename + '\' already exists.');
        onDidConfirm(null);
      } else {
        onDidConfirm(newDirectory.getPath());
      }
    }));
  },

  openAddFileDialog: function openAddFileDialog(onDidConfirm) {
    var node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    var hgRepository = this._getHgRepositoryForNode(node);
    var additionalOptions = {};
    if (hgRepository !== null) {
      additionalOptions['addToVCS'] = 'Add the new file to version control.';
    }
    this._openAddDialog('file', node.localPath + _path2['default'].sep, _asyncToGenerator(function* (filePath, options) {
      // Prevent submission of a blank field from creating a file.
      if (filePath === '') {
        return;
      }

      // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
      var directory = _FileTreeHelpers2['default'].getDirectoryByKey(node.uri);
      if (directory == null) {
        return;
      }

      var newFile = directory.getFile(filePath);
      var created = yield newFile.create();
      if (created) {
        if (hgRepository !== null && options.addToVCS === true) {
          try {
            yield hgRepository.add([newFile.getPath()]);
          } catch (e) {
            atom.notifications.addError('Failed to add \'' + newFile.getPath + '\' to version control.  Error: ' + e.toString());
          }
        }
        onDidConfirm(newFile.getPath());
      } else {
        atom.notifications.addError('\'' + filePath + '\' already exists.');
        onDidConfirm(null);
      }
    }), additionalOptions);
  },

  _getHgRepositoryForNode: function _getHgRepositoryForNode(node) {
    var repository = node.repo;
    if (repository != null && repository.getType() === 'hg') {
      return repository;
    }
    return null;
  },

  _getHgRepositoryForPath: function _getHgRepositoryForPath(filePath) {
    var repository = (0, _nuclideHgGitBridge.repositoryForPath)(filePath);
    if (repository != null && repository.getType() === 'hg') {
      return repository;
    }
    return null;
  },

  _onConfirmRename: _asyncToGenerator(function* (node, nodePath, newBasename) {
    var entry = _FileTreeHelpers2['default'].getEntryByKey(node.uri);
    if (entry == null) {
      // TODO: Connection could have been lost for remote file.
      return;
    }

    /*
     * Use `resolve` to strip trailing slashes because renaming a file to a name with a
     * trailing slash is an error.
     */
    var newPath = _path2['default'].resolve(
    // Trim leading and trailing whitespace to prevent bad filenames.
    _path2['default'].join(_path2['default'].dirname(nodePath), newBasename.trim()));
    var hgRepository = this._getHgRepositoryForNode(node);
    var shouldFSRename = true;
    if (hgRepository !== null) {
      try {
        shouldFSRename = false;
        yield hgRepository.rename(entry.getPath(), newPath);
      } catch (e) {
        var _filePath = entry.getPath();
        var statuses = yield hgRepository.getStatuses([_filePath]);
        var pathStatus = statuses.get(_filePath);
        if (legalStatusCodeForRename.has(pathStatus)) {
          atom.notifications.addError('`hg rename` failed, will try to move the file ignoring version control instead.  ' + 'Error: ' + e.toString());
        }
        shouldFSRename = true;
      }
    }
    if (shouldFSRename) {
      var service = (0, _nuclideClient.getFileSystemServiceByNuclideUri)(entry.getPath());
      yield service.rename((0, _nuclideRemoteUri.getPath)(entry.getPath()), newPath);
    }
  }),

  _onConfirmDuplicate: _asyncToGenerator(function* (file, nodePath, newBasename, addToVCS, onDidConfirm) {
    var directory = file.getParent();
    var newFile = directory.getFile(newBasename);
    var newPath = newFile.getPath();
    var service = (0, _nuclideClient.getFileSystemServiceByNuclideUri)(newPath);
    var exists = !(yield service.copy(nodePath, (0, _nuclideRemoteUri.getPath)(newPath)));
    if (exists) {
      atom.notifications.addError('\'' + newPath + '\' already exists.');
      onDidConfirm(null);
      return;
    }
    var hgRepository = this._getHgRepositoryForPath(newPath);
    if (hgRepository !== null && addToVCS) {
      try {
        yield hgRepository.add([newPath]);
      } catch (e) {
        var message = newPath + ' was duplicated, but there was an error adding it to ' + 'version control.  Error: ' + e.toString();
        atom.notifications.addError(message);
        onDidConfirm(null);
        return;
      }
      onDidConfirm(newPath);
    }
  }),

  openRenameDialog: function openRenameDialog() {
    var _this = this;

    var store = _FileTreeStore.FileTreeStore.getInstance();
    var selectedNodes = store.getSelectedNodes();
    if (selectedNodes.size !== 1) {
      // Can only rename one entry at a time.
      return;
    }

    var node = selectedNodes.first();
    var nodePath = node.localPath;
    this._openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: _path2['default'].basename(nodePath),
      message: node.isContainer ? _reactForAtom.React.createElement(
        'span',
        null,
        'Enter the new path for the directory.'
      ) : _reactForAtom.React.createElement(
        'span',
        null,
        'Enter the new path for the file.'
      ),
      onConfirm: function onConfirm(newBasename, options) {
        _this._onConfirmRename(node, nodePath, newBasename)['catch'](function (error) {
          atom.notifications.addError('Rename to ' + newBasename + ' failed');
        });
      },
      onClose: this._closeDialog,
      selectBasename: true
    });
  },

  openDuplicateDialog: function openDuplicateDialog(onDidConfirm) {
    var _this2 = this;

    var store = _FileTreeStore.FileTreeStore.getInstance();
    var selectedNodes = store.getSelectedNodes();
    if (selectedNodes.size !== 1) {
      // Can only copy one entry at a time.
      return;
    }

    var node = selectedNodes.first();
    var nodePath = node.localPath;
    var initialValue = _path2['default'].basename(nodePath);
    var ext = _path2['default'].extname(nodePath);
    initialValue = initialValue.substr(0, initialValue.length - ext.length) + '-copy' + ext;
    var hgRepository = this._getHgRepositoryForNode(node);
    var additionalOptions = {};
    if (hgRepository !== null) {
      additionalOptions['addToVCS'] = 'Add the new file to version control.';
    }
    this._openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: initialValue,
      message: _reactForAtom.React.createElement(
        'span',
        null,
        'Enter the new path for the duplicate.'
      ),
      onConfirm: function onConfirm(newBasename, options) {
        var file = _FileTreeHelpers2['default'].getFileByKey(node.uri);
        if (file == null) {
          // TODO: Connection could have been lost for remote file.
          return;
        }
        _this2._onConfirmDuplicate(file, nodePath, newBasename.trim(), !!options.addToVCS, onDidConfirm)['catch'](function (error) {
          atom.notifications.addError('Failed to duplicate \'{file.getPath()}\'');
        });
      },
      onClose: this._closeDialog,
      selectBasename: true,
      additionalOptions: additionalOptions
    });
  },

  _getSelectedContainerNode: function _getSelectedContainerNode() {
    var store = _FileTreeStore.FileTreeStore.getInstance();
    /*
     * TODO: Choosing the last selected key is inexact when there is more than 1 root. The Set of
     * selected keys should be maintained as a flat list across all roots to maintain insertion
     * order.
     */
    var node = store.getSelectedNodes().first();
    return node.isContainer ? node : node.parent;
  },

  _openAddDialog: function _openAddDialog(entryType, path, onConfirm) {
    var additionalOptions = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    this._openDialog({
      iconClassName: 'icon-file-add',
      message: _reactForAtom.React.createElement(
        'span',
        null,
        'Enter the path for the new ',
        entryType,
        ' in the root:',
        _reactForAtom.React.createElement('br', null),
        path
      ),
      onConfirm: onConfirm,
      onClose: this._closeDialog,
      additionalOptions: additionalOptions
    });
  },

  _openDialog: function _openDialog(props) {
    this._closeDialog();
    dialogHostElement = document.createElement('div');
    atom.views.getView(atom.workspace).appendChild(dialogHostElement);
    dialogComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_componentsFileDialogComponent2['default'], props), dialogHostElement);
  },

  _closeDialog: function _closeDialog() {
    if (dialogComponent != null) {
      _reactForAtom.ReactDOM.unmountComponentAtNode(dialogHostElement);
      dialogComponent = null;
    }
    if (dialogHostElement != null) {
      dialogHostElement.parentNode.removeChild(dialogHostElement);
      dialogHostElement = null;
    }
  }
};

module.exports = FileSystemActions;