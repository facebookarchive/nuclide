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
//# sourceMappingURL=data:application/json;base64,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QWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDbEUsbUJBQWUsR0FBRyx1QkFBUyxNQUFNLENBQy9CLDhFQUF5QixLQUFLLENBQUksRUFDbEMsaUJBQWlCLENBQ2xCLENBQUM7R0FDSDs7QUFFRCxjQUFZLEVBQUEsd0JBQVM7QUFDbkIsUUFBSSxlQUFlLElBQUksSUFBSSxFQUFFO0FBQzNCLDZCQUFTLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDbkQscUJBQWUsR0FBRyxJQUFJLENBQUM7S0FDeEI7QUFDRCxRQUFJLGlCQUFpQixJQUFJLElBQUksRUFBRTtBQUM3Qix1QkFBaUIsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDNUQsdUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzFCO0dBQ0Y7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiRmlsZVN5c3RlbUFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RmlsZVRyZWVOb2RlfSBmcm9tICcuL0ZpbGVUcmVlTm9kZSc7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtSZW1vdGVGaWxlfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuaW1wb3J0IEZpbGVEaWFsb2dDb21wb25lbnQgZnJvbSAnLi4vY29tcG9uZW50cy9GaWxlRGlhbG9nQ29tcG9uZW50JztcbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IHtGaWxlVHJlZVN0b3JlfSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVtb3RlVXJpLCB7Z2V0UGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7RmlsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHtTdGF0dXNDb2RlTnVtYmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHBhdGhNb2R1bGUgZnJvbSAncGF0aCc7XG5cbmxldCBkaWFsb2dDb21wb25lbnQ6ID9SZWFjdC5Db21wb25lbnQ7XG5sZXQgZGlhbG9nSG9zdEVsZW1lbnQ6ID9IVE1MRWxlbWVudDtcblxuY29uc3QgbGVnYWxTdGF0dXNDb2RlRm9yUmVuYW1lID0gbmV3IFNldChbXG4gIFN0YXR1c0NvZGVOdW1iZXIuQURERUQsXG4gIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU4sXG4gIFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQsXG5dKTtcblxuY29uc3QgRmlsZVN5c3RlbUFjdGlvbnMgPSB7XG4gIG9wZW5BZGRGb2xkZXJEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX2dldFNlbGVjdGVkQ29udGFpbmVyTm9kZSgpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuQWRkRGlhbG9nKFxuICAgICAgJ2ZvbGRlcicsXG4gICAgICBub2RlLmxvY2FsUGF0aCArICcvJyxcbiAgICAgIGFzeW5jIChmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBzdWJtaXNzaW9uIG9mIGEgYmxhbmsgZmllbGQgZnJvbSBjcmVhdGluZyBhIGRpcmVjdG9yeS5cbiAgICAgICAgaWYgKGZpbGVQYXRoID09PSAnJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGZpbGVQYXRoIGlzIGluIHJvb3RLZXkgYW5kIGlmIG5vdCwgZmluZCB0aGUgcm9vdEtleSBpdCBiZWxvbmdzIHRvLlxuICAgICAgICBjb25zdCBkaXJlY3RvcnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RGlyZWN0b3J5QnlLZXkobm9kZS51cmkpO1xuICAgICAgICBpZiAoZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7cGF0aG5hbWV9ID0gUmVtb3RlVXJpLnBhcnNlKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgYmFzZW5hbWUgPSBwYXRoTW9kdWxlLmJhc2VuYW1lKHBhdGhuYW1lKTtcbiAgICAgICAgY29uc3QgbmV3RGlyZWN0b3J5ID0gZGlyZWN0b3J5LmdldFN1YmRpcmVjdG9yeShiYXNlbmFtZSk7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBuZXdEaXJlY3RvcnkuY3JlYXRlKCk7XG4gICAgICAgIGlmICghY3JlYXRlZCkge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJyR7YmFzZW5hbWV9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb25EaWRDb25maXJtKG5ld0RpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICk7XG4gIH0sXG5cbiAgb3BlbkFkZEZpbGVEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX2dldFNlbGVjdGVkQ29udGFpbmVyTm9kZSgpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JOb2RlKG5vZGUpO1xuICAgIGNvbnN0IGFkZGl0aW9uYWxPcHRpb25zID0ge307XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCkge1xuICAgICAgYWRkaXRpb25hbE9wdGlvbnNbJ2FkZFRvVkNTJ10gPSAnQWRkIHRoZSBuZXcgZmlsZSB0byB2ZXJzaW9uIGNvbnRyb2wuJztcbiAgICB9XG4gICAgdGhpcy5fb3BlbkFkZERpYWxvZyhcbiAgICAgICdmaWxlJyxcbiAgICAgIG5vZGUubG9jYWxQYXRoICsgcGF0aE1vZHVsZS5zZXAsXG4gICAgICBhc3luYyAoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczoge2FkZFRvVkNTPzogYm9vbGVhbn0pID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBzdWJtaXNzaW9uIG9mIGEgYmxhbmsgZmllbGQgZnJvbSBjcmVhdGluZyBhIGZpbGUuXG4gICAgICAgIGlmIChmaWxlUGF0aCA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBmaWxlUGF0aCBpcyBpbiByb290S2V5IGFuZCBpZiBub3QsIGZpbmQgdGhlIHJvb3RLZXkgaXQgYmVsb25ncyB0by5cbiAgICAgICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGUudXJpKTtcbiAgICAgICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IGRpcmVjdG9yeS5nZXRGaWxlKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IG5ld0ZpbGUuY3JlYXRlKCk7XG4gICAgICAgIGlmIChjcmVhdGVkKSB7XG4gICAgICAgICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCAmJiBvcHRpb25zLmFkZFRvVkNTID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBhd2FpdCBoZ1JlcG9zaXRvcnkuYWRkKFtuZXdGaWxlLmdldFBhdGgoKV0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBhZGQgJyR7bmV3RmlsZS5nZXRQYXRofScgdG8gdmVyc2lvbiBjb250cm9sLiAgRXJyb3I6ICR7ZS50b1N0cmluZygpfWAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG9uRGlkQ29uZmlybShuZXdGaWxlLmdldFBhdGgoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtmaWxlUGF0aH0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICAgIG9uRGlkQ29uZmlybShudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zLFxuICAgICk7XG4gIH0sXG5cbiAgX2dldEhnUmVwb3NpdG9yeUZvck5vZGUobm9kZTogRmlsZVRyZWVOb2RlKTogP0hnUmVwb3NpdG9yeUNsaWVudCB7XG4gICAgY29uc3QgcmVwb3NpdG9yeSA9IG5vZGUucmVwbztcbiAgICBpZiAocmVwb3NpdG9yeSAhPSBudWxsICYmIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnKSB7XG4gICAgICByZXR1cm4gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICBfZ2V0SGdSZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aDogc3RyaW5nKTogP0hnUmVwb3NpdG9yeUNsaWVudCB7XG4gICAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoKTtcbiAgICBpZiAocmVwb3NpdG9yeSAhPSBudWxsICYmIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnKSB7XG4gICAgICByZXR1cm4gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICBhc3luYyBfb25Db25maXJtUmVuYW1lKFxuICAgIG5vZGU6IEZpbGVUcmVlTm9kZSxcbiAgICBub2RlUGF0aDogc3RyaW5nLFxuICAgIG5ld0Jhc2VuYW1lOiBzdHJpbmcsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGVudHJ5ID0gRmlsZVRyZWVIZWxwZXJzLmdldEVudHJ5QnlLZXkobm9kZS51cmkpO1xuICAgIGlmIChlbnRyeSA9PSBudWxsKSB7XG4gICAgICAvLyBUT0RPOiBDb25uZWN0aW9uIGNvdWxkIGhhdmUgYmVlbiBsb3N0IGZvciByZW1vdGUgZmlsZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFVzZSBgcmVzb2x2ZWAgdG8gc3RyaXAgdHJhaWxpbmcgc2xhc2hlcyBiZWNhdXNlIHJlbmFtaW5nIGEgZmlsZSB0byBhIG5hbWUgd2l0aCBhXG4gICAgICogdHJhaWxpbmcgc2xhc2ggaXMgYW4gZXJyb3IuXG4gICAgICovXG4gICAgY29uc3QgbmV3UGF0aCA9IHBhdGhNb2R1bGUucmVzb2x2ZShcbiAgICAgIC8vIFRyaW0gbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSB0byBwcmV2ZW50IGJhZCBmaWxlbmFtZXMuXG4gICAgICBwYXRoTW9kdWxlLmpvaW4ocGF0aE1vZHVsZS5kaXJuYW1lKG5vZGVQYXRoKSwgbmV3QmFzZW5hbWUudHJpbSgpKVxuICAgICk7XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gdGhpcy5fZ2V0SGdSZXBvc2l0b3J5Rm9yTm9kZShub2RlKTtcbiAgICBsZXQgc2hvdWxkRlNSZW5hbWUgPSB0cnVlO1xuICAgIGlmIChoZ1JlcG9zaXRvcnkgIT09IG51bGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNob3VsZEZTUmVuYW1lID0gZmFsc2U7XG4gICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5yZW5hbWUoZW50cnkuZ2V0UGF0aCgpLCBuZXdQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBlbnRyeS5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IHN0YXR1c2VzID0gYXdhaXQgaGdSZXBvc2l0b3J5LmdldFN0YXR1c2VzKFtmaWxlUGF0aF0pO1xuICAgICAgICBjb25zdCBwYXRoU3RhdHVzID0gc3RhdHVzZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKGxlZ2FsU3RhdHVzQ29kZUZvclJlbmFtZS5oYXMocGF0aFN0YXR1cykpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAnYGhnIHJlbmFtZWAgZmFpbGVkLCB3aWxsIHRyeSB0byBtb3ZlIHRoZSBmaWxlIGlnbm9yaW5nIHZlcnNpb24gY29udHJvbCBpbnN0ZWFkLiAgJyArXG4gICAgICAgICAgICAnRXJyb3I6ICcgKyBlLnRvU3RyaW5nKCksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBzaG91bGRGU1JlbmFtZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzaG91bGRGU1JlbmFtZSkge1xuICAgICAgY29uc3Qgc2VydmljZSA9IGdldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpKGVudHJ5LmdldFBhdGgoKSk7XG4gICAgICBhd2FpdCBzZXJ2aWNlLnJlbmFtZShnZXRQYXRoKGVudHJ5LmdldFBhdGgoKSksIG5ld1BhdGgpO1xuICAgIH1cbiAgfSxcblxuICBhc3luYyBfb25Db25maXJtRHVwbGljYXRlKFxuICAgIGZpbGU6IEZpbGUgfCBSZW1vdGVGaWxlLFxuICAgIG5vZGVQYXRoOiBzdHJpbmcsXG4gICAgbmV3QmFzZW5hbWU6IHN0cmluZyxcbiAgICBhZGRUb1ZDUzogYm9vbGVhbixcbiAgICBvbkRpZENvbmZpcm06IChmaWxlUGF0aDogP3N0cmluZykgPT4gbWl4ZWQsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGZpbGUuZ2V0UGFyZW50KCk7XG4gICAgY29uc3QgbmV3RmlsZSA9IGRpcmVjdG9yeS5nZXRGaWxlKG5ld0Jhc2VuYW1lKTtcbiAgICBjb25zdCBuZXdQYXRoID0gbmV3RmlsZS5nZXRQYXRoKCk7XG4gICAgY29uc3Qgc2VydmljZSA9IGdldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpKG5ld1BhdGgpO1xuICAgIGNvbnN0IGV4aXN0cyA9ICEoYXdhaXQgc2VydmljZS5jb3B5KG5vZGVQYXRoLCBnZXRQYXRoKG5ld1BhdGgpKSk7XG4gICAgaWYgKGV4aXN0cykge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtuZXdQYXRofScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9IHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvclBhdGgobmV3UGF0aCk7XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCAmJiBhZGRUb1ZDUykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgaGdSZXBvc2l0b3J5LmFkZChbbmV3UGF0aF0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gbmV3UGF0aCArICcgd2FzIGR1cGxpY2F0ZWQsIGJ1dCB0aGVyZSB3YXMgYW4gZXJyb3IgYWRkaW5nIGl0IHRvICcgK1xuICAgICAgICAgICd2ZXJzaW9uIGNvbnRyb2wuICBFcnJvcjogJyArIGUudG9TdHJpbmcoKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG9uRGlkQ29uZmlybShuZXdQYXRoKTtcbiAgICB9XG4gIH0sXG5cbiAgb3BlblJlbmFtZURpYWxvZygpOiB2b2lkIHtcbiAgICBjb25zdCBzdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGlmIChzZWxlY3RlZE5vZGVzLnNpemUgIT09IDEpIHtcbiAgICAgIC8vIENhbiBvbmx5IHJlbmFtZSBvbmUgZW50cnkgYXQgYSB0aW1lLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSBzZWxlY3RlZE5vZGVzLmZpcnN0KCk7XG4gICAgY29uc3Qgbm9kZVBhdGggPSBub2RlLmxvY2FsUGF0aDtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogcGF0aE1vZHVsZS5iYXNlbmFtZShub2RlUGF0aCksXG4gICAgICBtZXNzYWdlOiBub2RlLmlzQ29udGFpbmVyXG4gICAgICAgID8gPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZGlyZWN0b3J5Ljwvc3Bhbj5cbiAgICAgICAgOiA8c3Bhbj5FbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBmaWxlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpID0+IHtcbiAgICAgICAgdGhpcy5fb25Db25maXJtUmVuYW1lKG5vZGUsIG5vZGVQYXRoLCBuZXdCYXNlbmFtZSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgUmVuYW1lIHRvICR7bmV3QmFzZW5hbWV9IGZhaWxlZGApO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIHNlbGVjdEJhc2VuYW1lOiB0cnVlLFxuICAgIH0pO1xuICB9LFxuXG4gIG9wZW5EdXBsaWNhdGVEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSBjb3B5IG9uZSBlbnRyeSBhdCBhIHRpbWUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBjb25zdCBub2RlUGF0aCA9IG5vZGUubG9jYWxQYXRoO1xuICAgIGxldCBpbml0aWFsVmFsdWUgPSBwYXRoTW9kdWxlLmJhc2VuYW1lKG5vZGVQYXRoKTtcbiAgICBjb25zdCBleHQgPSBwYXRoTW9kdWxlLmV4dG5hbWUobm9kZVBhdGgpO1xuICAgIGluaXRpYWxWYWx1ZSA9IGluaXRpYWxWYWx1ZS5zdWJzdHIoMCwgaW5pdGlhbFZhbHVlLmxlbmd0aCAtIGV4dC5sZW5ndGgpICsgJy1jb3B5JyArIGV4dDtcbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JOb2RlKG5vZGUpO1xuICAgIGNvbnN0IGFkZGl0aW9uYWxPcHRpb25zID0ge307XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCkge1xuICAgICAgYWRkaXRpb25hbE9wdGlvbnNbJ2FkZFRvVkNTJ10gPSAnQWRkIHRoZSBuZXcgZmlsZSB0byB2ZXJzaW9uIGNvbnRyb2wuJztcbiAgICB9XG4gICAgdGhpcy5fb3BlbkRpYWxvZyh7XG4gICAgICBpY29uQ2xhc3NOYW1lOiAnaWNvbi1hcnJvdy1yaWdodCcsXG4gICAgICBpbml0aWFsVmFsdWU6IGluaXRpYWxWYWx1ZSxcbiAgICAgIG1lc3NhZ2U6IDxzcGFuPkVudGVyIHRoZSBuZXcgcGF0aCBmb3IgdGhlIGR1cGxpY2F0ZS48L3NwYW4+LFxuICAgICAgb25Db25maXJtOiAobmV3QmFzZW5hbWU6IHN0cmluZywgb3B0aW9uczoge2FkZFRvVkNTPzogYm9vbGVhbn0pID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IEZpbGVUcmVlSGVscGVycy5nZXRGaWxlQnlLZXkobm9kZS51cmkpO1xuICAgICAgICBpZiAoZmlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgLy8gVE9ETzogQ29ubmVjdGlvbiBjb3VsZCBoYXZlIGJlZW4gbG9zdCBmb3IgcmVtb3RlIGZpbGUuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29uQ29uZmlybUR1cGxpY2F0ZShcbiAgICAgICAgICBmaWxlLFxuICAgICAgICAgIG5vZGVQYXRoLFxuICAgICAgICAgIG5ld0Jhc2VuYW1lLnRyaW0oKSxcbiAgICAgICAgICAhIW9wdGlvbnMuYWRkVG9WQ1MsXG4gICAgICAgICAgb25EaWRDb25maXJtLFxuICAgICAgICApLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYEZhaWxlZCB0byBkdXBsaWNhdGUgJ3tmaWxlLmdldFBhdGgoKX0nYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMuX2Nsb3NlRGlhbG9nLFxuICAgICAgc2VsZWN0QmFzZW5hbWU6IHRydWUsXG4gICAgICBhZGRpdGlvbmFsT3B0aW9ucyxcbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHN0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIC8qXG4gICAgICogVE9ETzogQ2hvb3NpbmcgdGhlIGxhc3Qgc2VsZWN0ZWQga2V5IGlzIGluZXhhY3Qgd2hlbiB0aGVyZSBpcyBtb3JlIHRoYW4gMSByb290LiBUaGUgU2V0IG9mXG4gICAgICogc2VsZWN0ZWQga2V5cyBzaG91bGQgYmUgbWFpbnRhaW5lZCBhcyBhIGZsYXQgbGlzdCBhY3Jvc3MgYWxsIHJvb3RzIHRvIG1haW50YWluIGluc2VydGlvblxuICAgICAqIG9yZGVyLlxuICAgICAqL1xuICAgIGNvbnN0IG5vZGUgPSBzdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCkuZmlyc3QoKTtcbiAgICByZXR1cm4gbm9kZS5pc0NvbnRhaW5lciA/IG5vZGUgOiBub2RlLnBhcmVudDtcbiAgfSxcblxuICBfb3BlbkFkZERpYWxvZyhcbiAgICBlbnRyeVR5cGU6IHN0cmluZyxcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgb25Db25maXJtOiAoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KSA9PiBtaXhlZCxcbiAgICBhZGRpdGlvbmFsT3B0aW9ucz86IE9iamVjdCA9IHt9LFxuICApIHtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWZpbGUtYWRkJyxcbiAgICAgIG1lc3NhZ2U6IDxzcGFuPkVudGVyIHRoZSBwYXRoIGZvciB0aGUgbmV3IHtlbnRyeVR5cGV9IGluIHRoZSByb290OjxiciAvPntwYXRofTwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zLFxuICAgIH0pO1xuICB9LFxuXG4gIF9vcGVuRGlhbG9nKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9jbG9zZURpYWxvZygpO1xuICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZChkaWFsb2dIb3N0RWxlbWVudCk7XG4gICAgZGlhbG9nQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPEZpbGVEaWFsb2dDb21wb25lbnQgey4uLnByb3BzfSAvPixcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50XG4gICAgKTtcbiAgfSxcblxuICBfY2xvc2VEaWFsb2coKTogdm9pZCB7XG4gICAgaWYgKGRpYWxvZ0NvbXBvbmVudCAhPSBudWxsKSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0NvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmIChkaWFsb2dIb3N0RWxlbWVudCAhPSBudWxsKSB7XG4gICAgICBkaWFsb2dIb3N0RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW1BY3Rpb25zO1xuIl19