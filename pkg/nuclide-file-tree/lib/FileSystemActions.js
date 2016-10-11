var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _componentsFileDialogComponent;

function _load_componentsFileDialogComponent() {
  return _componentsFileDialogComponent = _interopRequireDefault(require('../components/FileDialogComponent'));
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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

var atomPanel = undefined;
var dialogComponent = undefined;

var FileSystemActions = (function () {
  function FileSystemActions() {
    _classCallCheck(this, FileSystemActions);
  }

  _createClass(FileSystemActions, [{
    key: 'openAddFolderDialog',
    value: function openAddFolderDialog(onDidConfirm) {
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
        var directory = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(node.uri);
        if (directory == null) {
          return;
        }

        var _default$parse = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.parse(filePath);

        var pathname = _default$parse.pathname;

        var basename = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(pathname);
        var newDirectory = directory.getSubdirectory(basename);
        var created = yield newDirectory.create();
        if (!created) {
          atom.notifications.addError('\'' + basename + '\' already exists.');
          onDidConfirm(null);
        } else {
          onDidConfirm(newDirectory.getPath());
        }
      }));
    }
  }, {
    key: 'openAddFileDialog',
    value: function openAddFileDialog(onDidConfirm) {
      var node = this._getSelectedContainerNode();
      if (!node) {
        return;
      }
      var hgRepository = (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.getHgRepositoryForNode(node);
      var additionalOptions = {};
      if (hgRepository != null) {
        additionalOptions.addToVCS = 'Add the new file to version control.';
      }
      this._openAddDialog('file', (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.ensureTrailingSeparator(node.localPath), _asyncToGenerator(function* (filePath, options) {
        // Prevent submission of a blank field from creating a file.
        if (filePath === '') {
          return;
        }

        // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
        var directory = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(node.uri);
        if (directory == null) {
          return;
        }

        var newFile = directory.getFile(filePath);
        var created = yield newFile.create();
        if (created) {
          var newFilePath = newFile.getPath();
          // Open a new text editor while VCS actions complete in the background.
          onDidConfirm(newFilePath);
          if (hgRepository != null && options.addToVCS === true) {
            try {
              yield hgRepository.addAll([newFilePath]);
            } catch (e) {
              atom.notifications.addError('Failed to add \'' + newFilePath + '\' to version control. Error: ' + e.toString());
            }
          }
        } else {
          atom.notifications.addError('\'' + filePath + '\' already exists.');
          onDidConfirm(null);
        }
      }), additionalOptions);
    }
  }, {
    key: '_getHgRepositoryForPath',
    value: function _getHgRepositoryForPath(filePath) {
      var repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(filePath);
      if (repository != null && repository.getType() === 'hg') {
        return repository;
      }
      return null;
    }
  }, {
    key: '_onConfirmRename',
    value: _asyncToGenerator(function* (node, nodePath, newBasename) {
      /*
       * Use `resolve` to strip trailing slashes because renaming a file to a name with a
       * trailing slash is an error.
       */
      var newPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.resolve(
      // Trim leading and trailing whitespace to prevent bad filenames.
      (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(nodePath), newBasename.trim()));

      // Create a remote nuclide uri when the node being moved is remote.
      if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(node.uri)) {
        newPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.createRemoteUri((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getHostname(node.uri), newPath);
      }

      yield (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.renameNode(node, newPath);
    })
  }, {
    key: '_onConfirmDuplicate',
    value: _asyncToGenerator(function* (file, nodePath, newBasename, addToVCS, onDidConfirm) {
      var directory = file.getParent();
      var newFile = directory.getFile(newBasename);
      var newPath = newFile.getPath();
      var service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(newPath);
      var exists = !(yield service.copy(nodePath, (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(newPath)));
      if (exists) {
        atom.notifications.addError('\'' + newPath + '\' already exists.');
        onDidConfirm(null);
        return;
      }
      var hgRepository = this._getHgRepositoryForPath(newPath);
      if (hgRepository != null && addToVCS) {
        try {
          // We are not recording the copy in mercurial on purpose, because most of the time
          // it's either templates or files that have greatly changed since duplicating.
          yield hgRepository.addAll([newPath]);
        } catch (e) {
          var message = newPath + ' was duplicated, but there was an error adding it to ' + 'version control.  Error: ' + e.toString();
          atom.notifications.addError(message);
          onDidConfirm(null);
          return;
        }
      }

      onDidConfirm(newPath);
    })
  }, {
    key: 'openRenameDialog',
    value: function openRenameDialog() {
      var _this = this;

      var store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
      var selectedNodes = store.getSelectedNodes();
      if (selectedNodes.size !== 1) {
        // Can only rename one entry at a time.
        return;
      }

      var node = selectedNodes.first();
      var nodePath = node.localPath;
      this._openDialog({
        iconClassName: 'icon-arrow-right',
        initialValue: (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(nodePath),
        message: node.isContainer ? (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          null,
          'Enter the new path for the directory.'
        ) : (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          null,
          'Enter the new path for the file.'
        ),
        onConfirm: function onConfirm(newBasename, options) {
          _this._onConfirmRename(node, nodePath, newBasename).catch(function (error) {
            atom.notifications.addError('Rename to ' + newBasename + ' failed: ' + error.message);
          });
        },
        onClose: this._closeDialog,
        selectBasename: true
      });
    }
  }, {
    key: 'openDuplicateDialog',
    value: function openDuplicateDialog(onDidConfirm) {
      var _this2 = this;

      var store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
      var selectedNodes = store.getSelectedNodes();
      if (selectedNodes.size !== 1) {
        // Can only copy one entry at a time.
        return;
      }

      var node = selectedNodes.first();
      var nodePath = node.localPath;
      var initialValue = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(nodePath);
      var ext = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.extname(nodePath);
      initialValue = initialValue.substr(0, initialValue.length - ext.length) + '-copy' + ext;
      var hgRepository = (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.getHgRepositoryForNode(node);
      var additionalOptions = {};
      if (hgRepository !== null) {
        additionalOptions.addToVCS = 'Add the new file to version control.';
      }
      this._openDialog({
        iconClassName: 'icon-arrow-right',
        initialValue: initialValue,
        message: (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          null,
          'Enter the new path for the duplicate.'
        ),
        onConfirm: function onConfirm(newBasename, options) {
          var file = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getFileByKey(node.uri);
          if (file == null) {
            // TODO: Connection could have been lost for remote file.
            return;
          }
          _this2._onConfirmDuplicate(file, nodePath, newBasename.trim(), Boolean(options.addToVCS), onDidConfirm).catch(function (error) {
            atom.notifications.addError('Failed to duplicate \'' + file.getPath() + '\'');
          });
        },
        onClose: this._closeDialog,
        selectBasename: true,
        additionalOptions: additionalOptions
      });
    }
  }, {
    key: '_getSelectedContainerNode',
    value: function _getSelectedContainerNode() {
      var store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
      /*
       * TODO: Choosing the last selected key is inexact when there is more than 1 root. The Set of
       * selected keys should be maintained as a flat list across all roots to maintain insertion
       * order.
       */
      var node = store.getSelectedNodes().first();
      return node.isContainer ? node : node.parent;
    }
  }, {
    key: '_openAddDialog',
    value: function _openAddDialog(entryType, path, onConfirm) {
      var additionalOptions = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      this._openDialog({
        iconClassName: 'icon-file-add',
        message: (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          null,
          'Enter the path for the new ',
          entryType,
          ' in the root:',
          (_reactForAtom || _load_reactForAtom()).React.createElement('br', null),
          path
        ),
        onConfirm: onConfirm,
        onClose: this._closeDialog,
        additionalOptions: additionalOptions
      });
    }
  }, {
    key: '_openDialog',
    value: function _openDialog(props) {
      this._closeDialog();
      var dialogHostElement = document.createElement('div');
      atomPanel = atom.workspace.addModalPanel({ item: dialogHostElement });
      dialogComponent = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_componentsFileDialogComponent || _load_componentsFileDialogComponent()).default, props), dialogHostElement);
    }
  }, {
    key: '_closeDialog',
    value: function _closeDialog() {
      if (atomPanel != null) {
        if (dialogComponent != null) {
          (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode(atomPanel.getItem());
          dialogComponent = null;
        }

        atomPanel.destroy();
        atomPanel = null;
      }
    }
  }]);

  return FileSystemActions;
})();

module.exports = new FileSystemActions();