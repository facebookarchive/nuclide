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

var _FileTreeStore2 = _interopRequireDefault(_FileTreeStore);

var _reactForAtom = require('react-for-atom');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _atom = require('atom');

var _nuclideClient = require('../../nuclide-client');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var dialogComponent = undefined;
var dialogHostElement = undefined;

var FileSystemActions = {
  openAddFolderDialog: function openAddFolderDialog(onDidConfirm) {
    var node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog('folder', node.getLocalPath() + '/', _asyncToGenerator(function* (filePath, options) {
      // Prevent submission of a blank field from creating a directory.
      if (filePath === '') {
        return;
      }

      // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
      var directory = _FileTreeHelpers2['default'].getDirectoryByKey(node.nodeKey);
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
    this._openAddDialog('file', node.getLocalPath() + _path2['default'].sep, _asyncToGenerator(function* (filePath, options) {
      // Prevent submission of a blank field from creating a file.
      if (filePath === '') {
        return;
      }

      // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
      var directory = _FileTreeHelpers2['default'].getDirectoryByKey(node.nodeKey);
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
    var entry = _FileTreeHelpers2['default'].getEntryByKey(node.nodeKey);
    if (entry == null) {
      return null;
    }
    return this._getHgRepositoryForPath(entry.getPath());
  },

  _getHgRepositoryForPath: function _getHgRepositoryForPath(filePath) {
    var repository = (0, _nuclideHgGitBridge.repositoryForPath)(filePath);
    if (repository != null && repository.getType() === 'hg') {
      return repository;
    }
    return null;
  },

  _onConfirmRename: _asyncToGenerator(function* (node, nodePath, newBasename) {
    var entry = _FileTreeHelpers2['default'].getEntryByKey(node.nodeKey);
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
        atom.notifications.addError('`hg rename` failed, will try to move the file ignoring version control instead.  ' + 'Error: ' + e.toString());
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

    var store = _FileTreeStore2['default'].getInstance();
    var selectedNodes = store.getSelectedNodes();
    if (selectedNodes.size !== 1) {
      // Can only rename one entry at a time.
      return;
    }

    var node = selectedNodes.first();
    var nodePath = node.getLocalPath();
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

    var store = _FileTreeStore2['default'].getInstance();
    var selectedNodes = store.getSelectedNodes();
    if (selectedNodes.size !== 1) {
      // Can only copy one entry at a time.
      return;
    }

    var node = selectedNodes.first();
    var nodePath = node.getLocalPath();
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
        var file = _FileTreeHelpers2['default'].getFileByKey(node.nodeKey);
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
    var store = _FileTreeStore2['default'].getInstance();
    /*
     * TODO: Choosing the last selected key is inexact when there is more than 1 root. The Set of
     * selected keys should be maintained as a flat list across all roots to maintain insertion
     * order.
     */
    var nodeKey = store.getSelectedKeys().last();
    if (nodeKey == null) {
      return null;
    }
    var rootKey = store.getRootForKey(nodeKey);
    if (rootKey == null) {
      return null;
    }
    var node = store.getNode(rootKey, nodeKey);
    return node.isContainer ? node : node.getParentNode();
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
//# sourceMappingURL=data:application/json;base64,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SSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2xFLG1CQUFlLEdBQUcsdUJBQVMsTUFBTSxDQUMvQiw4RUFBeUIsS0FBSyxDQUFJLEVBQ2xDLGlCQUFpQixDQUNsQixDQUFDO0dBQ0g7O0FBRUQsY0FBWSxFQUFBLHdCQUFTO0FBQ25CLFFBQUksZUFBZSxJQUFJLElBQUksRUFBRTtBQUMzQiw2QkFBUyxzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ25ELHFCQUFlLEdBQUcsSUFBSSxDQUFDO0tBQ3hCO0FBQ0QsUUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7QUFDN0IsdUJBQWlCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVELHVCQUFpQixHQUFHLElBQUksQ0FBQztLQUMxQjtHQUNGO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkZpbGVTeXN0ZW1BY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRmlsZVRyZWVOb2RlIGZyb20gJy4vRmlsZVRyZWVOb2RlJztcbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge1JlbW90ZUZpbGV9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nO1xuXG5pbXBvcnQgRmlsZURpYWxvZ0NvbXBvbmVudCBmcm9tICcuLi9jb21wb25lbnRzL0ZpbGVEaWFsb2dDb21wb25lbnQnO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVtb3RlVXJpLCB7Z2V0UGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7RmlsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuXG5pbXBvcnQgcGF0aE1vZHVsZSBmcm9tICdwYXRoJztcblxubGV0IGRpYWxvZ0NvbXBvbmVudDogP1JlYWN0Q29tcG9uZW50O1xubGV0IGRpYWxvZ0hvc3RFbGVtZW50OiA/SFRNTEVsZW1lbnQ7XG5cbmNvbnN0IEZpbGVTeXN0ZW1BY3Rpb25zID0ge1xuICBvcGVuQWRkRm9sZGVyRGlhbG9nKG9uRGlkQ29uZmlybTogKGZpbGVQYXRoOiA/c3RyaW5nKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9nZXRTZWxlY3RlZENvbnRhaW5lck5vZGUoKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fb3BlbkFkZERpYWxvZyhcbiAgICAgICdmb2xkZXInLFxuICAgICAgbm9kZS5nZXRMb2NhbFBhdGgoKSArICcvJyxcbiAgICAgIGFzeW5jIChmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBzdWJtaXNzaW9uIG9mIGEgYmxhbmsgZmllbGQgZnJvbSBjcmVhdGluZyBhIGRpcmVjdG9yeS5cbiAgICAgICAgaWYgKGZpbGVQYXRoID09PSAnJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGZpbGVQYXRoIGlzIGluIHJvb3RLZXkgYW5kIGlmIG5vdCwgZmluZCB0aGUgcm9vdEtleSBpdCBiZWxvbmdzIHRvLlxuICAgICAgICBjb25zdCBkaXJlY3RvcnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RGlyZWN0b3J5QnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICAgICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge3BhdGhuYW1lfSA9IFJlbW90ZVVyaS5wYXJzZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGJhc2VuYW1lID0gcGF0aE1vZHVsZS5iYXNlbmFtZShwYXRobmFtZSk7XG4gICAgICAgIGNvbnN0IG5ld0RpcmVjdG9yeSA9IGRpcmVjdG9yeS5nZXRTdWJkaXJlY3RvcnkoYmFzZW5hbWUpO1xuICAgICAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgbmV3RGlyZWN0b3J5LmNyZWF0ZSgpO1xuICAgICAgICBpZiAoIWNyZWF0ZWQpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCcke2Jhc2VuYW1lfScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9uRGlkQ29uZmlybShuZXdEaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9LFxuXG4gIG9wZW5BZGRGaWxlRGlhbG9nKG9uRGlkQ29uZmlybTogKGZpbGVQYXRoOiA/c3RyaW5nKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9nZXRTZWxlY3RlZENvbnRhaW5lck5vZGUoKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gdGhpcy5fZ2V0SGdSZXBvc2l0b3J5Rm9yTm9kZShub2RlKTtcbiAgICBjb25zdCBhZGRpdGlvbmFsT3B0aW9ucyA9IHt9O1xuICAgIGlmIChoZ1JlcG9zaXRvcnkgIT09IG51bGwpIHtcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zWydhZGRUb1ZDUyddID0gJ0FkZCB0aGUgbmV3IGZpbGUgdG8gdmVyc2lvbiBjb250cm9sLic7XG4gICAgfVxuICAgIHRoaXMuX29wZW5BZGREaWFsb2coXG4gICAgICAnZmlsZScsXG4gICAgICBub2RlLmdldExvY2FsUGF0aCgpICsgcGF0aE1vZHVsZS5zZXAsXG4gICAgICBhc3luYyAoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczoge2FkZFRvVkNTPzogYm9vbGVhbn0pID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBzdWJtaXNzaW9uIG9mIGEgYmxhbmsgZmllbGQgZnJvbSBjcmVhdGluZyBhIGZpbGUuXG4gICAgICAgIGlmIChmaWxlUGF0aCA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBmaWxlUGF0aCBpcyBpbiByb290S2V5IGFuZCBpZiBub3QsIGZpbmQgdGhlIHJvb3RLZXkgaXQgYmVsb25ncyB0by5cbiAgICAgICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICAgIGlmIChkaXJlY3RvcnkgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBkaXJlY3RvcnkuZ2V0RmlsZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBuZXdGaWxlLmNyZWF0ZSgpO1xuICAgICAgICBpZiAoY3JlYXRlZCkge1xuICAgICAgICAgIGlmIChoZ1JlcG9zaXRvcnkgIT09IG51bGwgJiYgb3B0aW9ucy5hZGRUb1ZDUyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgYXdhaXQgaGdSZXBvc2l0b3J5LmFkZChbbmV3RmlsZS5nZXRQYXRoKCldKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gYWRkICcke25ld0ZpbGUuZ2V0UGF0aH0nIHRvIHZlcnNpb24gY29udHJvbC4gIEVycm9yOiAke2UudG9TdHJpbmcoKX1gLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBvbkRpZENvbmZpcm0obmV3RmlsZS5nZXRQYXRoKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJyR7ZmlsZVBhdGh9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsT3B0aW9ucyxcbiAgICApO1xuICB9LFxuXG4gIF9nZXRIZ1JlcG9zaXRvcnlGb3JOb2RlKG5vZGU6IEZpbGVUcmVlTm9kZSk6ID9IZ1JlcG9zaXRvcnlDbGllbnQge1xuICAgIGNvbnN0IGVudHJ5ID0gRmlsZVRyZWVIZWxwZXJzLmdldEVudHJ5QnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICBpZiAoZW50cnkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JQYXRoKGVudHJ5LmdldFBhdGgoKSk7XG4gIH0sXG5cbiAgX2dldEhnUmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGg6IHN0cmluZyk6ID9IZ1JlcG9zaXRvcnlDbGllbnQge1xuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJykge1xuICAgICAgcmV0dXJuICgocmVwb3NpdG9yeTogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgYXN5bmMgX29uQ29uZmlybVJlbmFtZShcbiAgICBub2RlOiBGaWxlVHJlZU5vZGUsXG4gICAgbm9kZVBhdGg6IHN0cmluZyxcbiAgICBuZXdCYXNlbmFtZTogc3RyaW5nLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBlbnRyeSA9IEZpbGVUcmVlSGVscGVycy5nZXRFbnRyeUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgaWYgKGVudHJ5ID09IG51bGwpIHtcbiAgICAgIC8vIFRPRE86IENvbm5lY3Rpb24gY291bGQgaGF2ZSBiZWVuIGxvc3QgZm9yIHJlbW90ZSBmaWxlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVXNlIGByZXNvbHZlYCB0byBzdHJpcCB0cmFpbGluZyBzbGFzaGVzIGJlY2F1c2UgcmVuYW1pbmcgYSBmaWxlIHRvIGEgbmFtZSB3aXRoIGFcbiAgICAgKiB0cmFpbGluZyBzbGFzaCBpcyBhbiBlcnJvci5cbiAgICAgKi9cbiAgICBjb25zdCBuZXdQYXRoID0gcGF0aE1vZHVsZS5yZXNvbHZlKFxuICAgICAgLy8gVHJpbSBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlIHRvIHByZXZlbnQgYmFkIGZpbGVuYW1lcy5cbiAgICAgIHBhdGhNb2R1bGUuam9pbihwYXRoTW9kdWxlLmRpcm5hbWUobm9kZVBhdGgpLCBuZXdCYXNlbmFtZS50cmltKCkpXG4gICAgKTtcbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JOb2RlKG5vZGUpO1xuICAgIGxldCBzaG91bGRGU1JlbmFtZSA9IHRydWU7XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2hvdWxkRlNSZW5hbWUgPSBmYWxzZTtcbiAgICAgICAgYXdhaXQgaGdSZXBvc2l0b3J5LnJlbmFtZShlbnRyeS5nZXRQYXRoKCksIG5ld1BhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgJ2BoZyByZW5hbWVgIGZhaWxlZCwgd2lsbCB0cnkgdG8gbW92ZSB0aGUgZmlsZSBpZ25vcmluZyB2ZXJzaW9uIGNvbnRyb2wgaW5zdGVhZC4gICcgK1xuICAgICAgICAgICdFcnJvcjogJyArIGUudG9TdHJpbmcoKSxcbiAgICAgICAgKTtcbiAgICAgICAgc2hvdWxkRlNSZW5hbWUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2hvdWxkRlNSZW5hbWUpIHtcbiAgICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaShlbnRyeS5nZXRQYXRoKCkpO1xuICAgICAgYXdhaXQgc2VydmljZS5yZW5hbWUoZ2V0UGF0aChlbnRyeS5nZXRQYXRoKCkpLCBuZXdQYXRoKTtcbiAgICB9XG4gIH0sXG5cbiAgYXN5bmMgX29uQ29uZmlybUR1cGxpY2F0ZShcbiAgICBmaWxlOiBGaWxlIHwgUmVtb3RlRmlsZSxcbiAgICBub2RlUGF0aDogc3RyaW5nLFxuICAgIG5ld0Jhc2VuYW1lOiBzdHJpbmcsXG4gICAgYWRkVG9WQ1M6IGJvb2xlYW4sXG4gICAgb25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBkaXJlY3RvcnkgPSBmaWxlLmdldFBhcmVudCgpO1xuICAgIGNvbnN0IG5ld0ZpbGUgPSBkaXJlY3RvcnkuZ2V0RmlsZShuZXdCYXNlbmFtZSk7XG4gICAgY29uc3QgbmV3UGF0aCA9IG5ld0ZpbGUuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaShuZXdQYXRoKTtcbiAgICBjb25zdCBleGlzdHMgPSAhKGF3YWl0IHNlcnZpY2UuY29weShub2RlUGF0aCwgZ2V0UGF0aChuZXdQYXRoKSkpO1xuICAgIGlmIChleGlzdHMpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJyR7bmV3UGF0aH0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JQYXRoKG5ld1BhdGgpO1xuICAgIGlmIChoZ1JlcG9zaXRvcnkgIT09IG51bGwgJiYgYWRkVG9WQ1MpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5hZGQoW25ld1BhdGhdKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IG5ld1BhdGggKyAnIHdhcyBkdXBsaWNhdGVkLCBidXQgdGhlcmUgd2FzIGFuIGVycm9yIGFkZGluZyBpdCB0byAnICtcbiAgICAgICAgICAndmVyc2lvbiBjb250cm9sLiAgRXJyb3I6ICcgKyBlLnRvU3RyaW5nKCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvbkRpZENvbmZpcm0obmV3UGF0aCk7XG4gICAgfVxuICB9LFxuXG4gIG9wZW5SZW5hbWVEaWFsb2coKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSByZW5hbWUgb25lIGVudHJ5IGF0IGEgdGltZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGNvbnN0IG5vZGVQYXRoID0gbm9kZS5nZXRMb2NhbFBhdGgoKTtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogcGF0aE1vZHVsZS5iYXNlbmFtZShub2RlUGF0aCksXG4gICAgICBtZXNzYWdlOiBub2RlLmlzQ29udGFpbmVyXG4gICAgICAgID8gPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZGlyZWN0b3J5Ljwvc3Bhbj5cbiAgICAgICAgOiA8c3Bhbj5FbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBmaWxlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpID0+IHtcbiAgICAgICAgdGhpcy5fb25Db25maXJtUmVuYW1lKG5vZGUsIG5vZGVQYXRoLCBuZXdCYXNlbmFtZSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgUmVuYW1lIHRvICR7bmV3QmFzZW5hbWV9IGZhaWxlZGApO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIHNlbGVjdEJhc2VuYW1lOiB0cnVlLFxuICAgIH0pO1xuICB9LFxuXG4gIG9wZW5EdXBsaWNhdGVEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSBjb3B5IG9uZSBlbnRyeSBhdCBhIHRpbWUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBjb25zdCBub2RlUGF0aCA9IG5vZGUuZ2V0TG9jYWxQYXRoKCk7XG4gICAgbGV0IGluaXRpYWxWYWx1ZSA9IHBhdGhNb2R1bGUuYmFzZW5hbWUobm9kZVBhdGgpO1xuICAgIGNvbnN0IGV4dCA9IHBhdGhNb2R1bGUuZXh0bmFtZShub2RlUGF0aCk7XG4gICAgaW5pdGlhbFZhbHVlID0gaW5pdGlhbFZhbHVlLnN1YnN0cigwLCBpbml0aWFsVmFsdWUubGVuZ3RoIC0gZXh0Lmxlbmd0aCkgKyAnLWNvcHknICsgZXh0O1xuICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9IHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvck5vZGUobm9kZSk7XG4gICAgY29uc3QgYWRkaXRpb25hbE9wdGlvbnMgPSB7fTtcbiAgICBpZiAoaGdSZXBvc2l0b3J5ICE9PSBudWxsKSB7XG4gICAgICBhZGRpdGlvbmFsT3B0aW9uc1snYWRkVG9WQ1MnXSA9ICdBZGQgdGhlIG5ldyBmaWxlIHRvIHZlcnNpb24gY29udHJvbC4nO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogaW5pdGlhbFZhbHVlLFxuICAgICAgbWVzc2FnZTogPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZHVwbGljYXRlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nLCBvcHRpb25zOiB7YWRkVG9WQ1M/OiBib29sZWFufSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gRmlsZVRyZWVIZWxwZXJzLmdldEZpbGVCeUtleShub2RlLm5vZGVLZXkpO1xuICAgICAgICBpZiAoZmlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgLy8gVE9ETzogQ29ubmVjdGlvbiBjb3VsZCBoYXZlIGJlZW4gbG9zdCBmb3IgcmVtb3RlIGZpbGUuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29uQ29uZmlybUR1cGxpY2F0ZShcbiAgICAgICAgICBmaWxlLFxuICAgICAgICAgIG5vZGVQYXRoLFxuICAgICAgICAgIG5ld0Jhc2VuYW1lLnRyaW0oKSxcbiAgICAgICAgICAhIW9wdGlvbnMuYWRkVG9WQ1MsXG4gICAgICAgICAgb25EaWRDb25maXJtLFxuICAgICAgICApLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYEZhaWxlZCB0byBkdXBsaWNhdGUgJ3tmaWxlLmdldFBhdGgoKX0nYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMuX2Nsb3NlRGlhbG9nLFxuICAgICAgc2VsZWN0QmFzZW5hbWU6IHRydWUsXG4gICAgICBhZGRpdGlvbmFsT3B0aW9ucyxcbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHN0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIC8qXG4gICAgICogVE9ETzogQ2hvb3NpbmcgdGhlIGxhc3Qgc2VsZWN0ZWQga2V5IGlzIGluZXhhY3Qgd2hlbiB0aGVyZSBpcyBtb3JlIHRoYW4gMSByb290LiBUaGUgU2V0IG9mXG4gICAgICogc2VsZWN0ZWQga2V5cyBzaG91bGQgYmUgbWFpbnRhaW5lZCBhcyBhIGZsYXQgbGlzdCBhY3Jvc3MgYWxsIHJvb3RzIHRvIG1haW50YWluIGluc2VydGlvblxuICAgICAqIG9yZGVyLlxuICAgICAqL1xuICAgIGNvbnN0IG5vZGVLZXkgPSBzdG9yZS5nZXRTZWxlY3RlZEtleXMoKS5sYXN0KCk7XG4gICAgaWYgKG5vZGVLZXkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJvb3RLZXkgPSBzdG9yZS5nZXRSb290Rm9yS2V5KG5vZGVLZXkpO1xuICAgIGlmIChyb290S2V5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gc3RvcmUuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICByZXR1cm4gbm9kZS5pc0NvbnRhaW5lciA/IG5vZGUgOiBub2RlLmdldFBhcmVudE5vZGUoKTtcbiAgfSxcblxuICBfb3BlbkFkZERpYWxvZyhcbiAgICBlbnRyeVR5cGU6IHN0cmluZyxcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgb25Db25maXJtOiAoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KSA9PiBtaXhlZCxcbiAgICBhZGRpdGlvbmFsT3B0aW9ucz86IE9iamVjdCA9IHt9LFxuICApIHtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWZpbGUtYWRkJyxcbiAgICAgIG1lc3NhZ2U6IDxzcGFuPkVudGVyIHRoZSBwYXRoIGZvciB0aGUgbmV3IHtlbnRyeVR5cGV9IGluIHRoZSByb290OjxiciAvPntwYXRofTwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zLFxuICAgIH0pO1xuICB9LFxuXG4gIF9vcGVuRGlhbG9nKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9jbG9zZURpYWxvZygpO1xuICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZChkaWFsb2dIb3N0RWxlbWVudCk7XG4gICAgZGlhbG9nQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPEZpbGVEaWFsb2dDb21wb25lbnQgey4uLnByb3BzfSAvPixcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50XG4gICAgKTtcbiAgfSxcblxuICBfY2xvc2VEaWFsb2coKTogdm9pZCB7XG4gICAgaWYgKGRpYWxvZ0NvbXBvbmVudCAhPSBudWxsKSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0NvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmIChkaWFsb2dIb3N0RWxlbWVudCAhPSBudWxsKSB7XG4gICAgICBkaWFsb2dIb3N0RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW1BY3Rpb25zO1xuIl19