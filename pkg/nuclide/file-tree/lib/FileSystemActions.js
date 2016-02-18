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

var _remoteUri = require('../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

var _atom = require('atom');

var _nuclideCommons = require('../../../nuclide/commons');

var _hgGitBridge = require('../../hg-git-bridge');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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

      var _RemoteUri$parse = _remoteUri2['default'].parse(filePath);

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
    this._openAddDialog('file', node.getLocalPath() + '/', _asyncToGenerator(function* (filePath) {
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
        onDidConfirm(newFile.getPath());
      } else {
        atom.notifications.addError('\'' + filePath + '\' already exists.');
        onDidConfirm(null);
      }
    }));
  },

  _getHgRepositoryForNode: function _getHgRepositoryForNode(node) {
    var file = _FileTreeHelpers2['default'].getFileByKey(node.nodeKey);
    if (file == null) {
      return null;
    }
    return this._getHgRepositoryForPath(file.getPath());
  },

  _getHgRepositoryForPath: function _getHgRepositoryForPath(filePath) {
    var repository = (0, _hgGitBridge.repositoryForPath)(filePath);
    if (repository != null && repository.getType() === 'hg') {
      return repository;
    }
    return null;
  },

  _onConfirmRename: _asyncToGenerator(function* (node, nodePath, newBasename) {
    var file = _FileTreeHelpers2['default'].getFileByKey(node.nodeKey);
    if (file == null) {
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
      var oldPath = file.getPath();
      if (!_FileTreeHelpers2['default'].isLocalFile(file)) {
        var remoteFile = file;
        oldPath = remoteFile.getLocalPath();
      }
      var success = yield hgRepository.rename(oldPath, newPath);
      shouldFSRename = !success;
    }
    if (shouldFSRename) {
      if (_FileTreeHelpers2['default'].isLocalFile(file)) {
        yield _nuclideCommons.fsPromise.rename(nodePath, newPath);
      } else {
        yield file.rename(newPath);
      }
    }
  }),

  _onConfirmDuplicate: _asyncToGenerator(function* (file, nodePath, newBasename, addToVCS, onDidConfirm) {
    var directory = file.getParent();
    var newFile = directory.getFile(newBasename);
    var newPath = newFile.getPath();
    if (_FileTreeHelpers2['default'].isLocalFile(file)) {
      var exists = yield _nuclideCommons.fsPromise.exists(newPath);
      if (!exists) {
        yield _nuclideCommons.fsPromise.copy(nodePath, newPath);
        var hgRepository = this._getHgRepositoryForPath(newPath);
        if (hgRepository !== null && addToVCS) {
          var errorHandler = function errorHandler(error) {
            var message = newPath + ' was duplicated, but there was an error adding it to ' + 'version control.';
            if (error != null) {
              message += '  Error: ' + error.toString();
            }
            atom.notifications.addError(message);
            onDidConfirm(null);
          };

          var ret = hgRepository.add(newPath)['catch'](errorHandler);
          if (!ret) {
            errorHandler(null);
          } else {
            onDidConfirm(newPath);
          }
        }
      } else {
        atom.notifications.addError('\'' + newPath + '\' already exists.');
      }
    } else {
      (0, _assert2['default'])(file.isFile());
      var remoteFile = file;
      var newRemoteFile = newFile;

      var wasCopied = yield remoteFile.copy(newRemoteFile.getLocalPath());
      if (!wasCopied) {
        atom.notifications.addError('\'' + newPath + '\' already exists.');
        onDidConfirm(null);
      } else {
        var hgRepository = this._getHgRepositoryForPath(newRemoteFile.getPath());
        if (hgRepository !== null && addToVCS) {
          yield hgRepository.add(newRemoteFile.getLocalPath());
        }
        onDidConfirm(newPath);
      }
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
      onClose: this._closeDialog
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
//# sourceMappingURL=data:application/json;base64,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Q3JGLGVBQVMsRUFBVCxTQUFTO0FBQ1QsYUFBTyxFQUFFLElBQUksQ0FBQyxZQUFZO0tBQzNCLENBQUMsQ0FBQztHQUNKOztBQUVELGFBQVcsRUFBQSxxQkFBQyxLQUFhLEVBQVE7QUFDL0IsUUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLHFCQUFpQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEQsUUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2xFLG1CQUFlLEdBQUcsdUJBQVMsTUFBTSxDQUMvQiw4RUFBeUIsS0FBSyxDQUFJLEVBQ2xDLGlCQUFpQixDQUNsQixDQUFDO0dBQ0g7O0FBRUQsY0FBWSxFQUFBLHdCQUFTO0FBQ25CLFFBQUksZUFBZSxJQUFJLElBQUksRUFBRTtBQUMzQiw2QkFBUyxzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ25ELHFCQUFlLEdBQUcsSUFBSSxDQUFDO0tBQ3hCO0FBQ0QsUUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7QUFDN0IsdUJBQWlCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVELHVCQUFpQixHQUFHLElBQUksQ0FBQztLQUMxQjtHQUNGO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkZpbGVTeXN0ZW1BY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRmlsZVRyZWVOb2RlIGZyb20gJy4vRmlsZVRyZWVOb2RlJztcbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmltcG9ydCBGaWxlRGlhbG9nQ29tcG9uZW50IGZyb20gJy4uL2NvbXBvbmVudHMvRmlsZURpYWxvZ0NvbXBvbmVudCc7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge0ZpbGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtmc1Byb21pc2V9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUvY29tbW9ucyc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9oZy1naXQtYnJpZGdlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGhNb2R1bGUgZnJvbSAncGF0aCc7XG5cbmxldCBkaWFsb2dDb21wb25lbnQ6ID9SZWFjdENvbXBvbmVudDtcbmxldCBkaWFsb2dIb3N0RWxlbWVudDogP0hUTUxFbGVtZW50O1xuXG5jb25zdCBGaWxlU3lzdGVtQWN0aW9ucyA9IHtcbiAgb3BlbkFkZEZvbGRlckRpYWxvZyhvbkRpZENvbmZpcm06IChmaWxlUGF0aDogP3N0cmluZykgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX29wZW5BZGREaWFsb2coXG4gICAgICAnZm9sZGVyJyxcbiAgICAgIG5vZGUuZ2V0TG9jYWxQYXRoKCkgKyAnLycsXG4gICAgICBhc3luYyAoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KSA9PiB7XG4gICAgICAgIC8vIFByZXZlbnQgc3VibWlzc2lvbiBvZiBhIGJsYW5rIGZpZWxkIGZyb20gY3JlYXRpbmcgYSBkaXJlY3RvcnkuXG4gICAgICAgIGlmIChmaWxlUGF0aCA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBmaWxlUGF0aCBpcyBpbiByb290S2V5IGFuZCBpZiBub3QsIGZpbmQgdGhlIHJvb3RLZXkgaXQgYmVsb25ncyB0by5cbiAgICAgICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICAgIGlmIChkaXJlY3RvcnkgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHtwYXRobmFtZX0gPSBSZW1vdGVVcmkucGFyc2UoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGhNb2R1bGUuYmFzZW5hbWUocGF0aG5hbWUpO1xuICAgICAgICBjb25zdCBuZXdEaXJlY3RvcnkgPSBkaXJlY3RvcnkuZ2V0U3ViZGlyZWN0b3J5KGJhc2VuYW1lKTtcbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IG5ld0RpcmVjdG9yeS5jcmVhdGUoKTtcbiAgICAgICAgaWYgKCFjcmVhdGVkKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtiYXNlbmFtZX0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICAgIG9uRGlkQ29uZmlybShudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvbkRpZENvbmZpcm0obmV3RGlyZWN0b3J5LmdldFBhdGgoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfSxcblxuICBvcGVuQWRkRmlsZURpYWxvZyhvbkRpZENvbmZpcm06IChmaWxlUGF0aDogP3N0cmluZykgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX29wZW5BZGREaWFsb2coJ2ZpbGUnLCBub2RlLmdldExvY2FsUGF0aCgpICsgJy8nLCBhc3luYyAoZmlsZVBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgLy8gUHJldmVudCBzdWJtaXNzaW9uIG9mIGEgYmxhbmsgZmllbGQgZnJvbSBjcmVhdGluZyBhIGZpbGUuXG4gICAgICBpZiAoZmlsZVBhdGggPT09ICcnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogY2hlY2sgaWYgZmlsZVBhdGggaXMgaW4gcm9vdEtleSBhbmQgaWYgbm90LCBmaW5kIHRoZSByb290S2V5IGl0IGJlbG9uZ3MgdG8uXG4gICAgICBjb25zdCBkaXJlY3RvcnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RGlyZWN0b3J5QnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICAgIGlmIChkaXJlY3RvcnkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ld0ZpbGUgPSBkaXJlY3RvcnkuZ2V0RmlsZShmaWxlUGF0aCk7XG4gICAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgbmV3RmlsZS5jcmVhdGUoKTtcbiAgICAgIGlmIChjcmVhdGVkKSB7XG4gICAgICAgIG9uRGlkQ29uZmlybShuZXdGaWxlLmdldFBhdGgoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCcke2ZpbGVQYXRofScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICAgIG9uRGlkQ29uZmlybShudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0SGdSZXBvc2l0b3J5Rm9yTm9kZShub2RlOiBGaWxlVHJlZU5vZGUpOiA/SGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgICBjb25zdCBmaWxlID0gRmlsZVRyZWVIZWxwZXJzLmdldEZpbGVCeUtleShub2RlLm5vZGVLZXkpO1xuICAgIGlmIChmaWxlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZ2V0SGdSZXBvc2l0b3J5Rm9yUGF0aChmaWxlLmdldFBhdGgoKSk7XG4gIH0sXG5cbiAgX2dldEhnUmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGg6IHN0cmluZyk6ID9IZ1JlcG9zaXRvcnlDbGllbnQge1xuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJykge1xuICAgICAgcmV0dXJuICgocmVwb3NpdG9yeTogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgYXN5bmMgX29uQ29uZmlybVJlbmFtZShcbiAgICBub2RlOiBGaWxlVHJlZU5vZGUsXG4gICAgbm9kZVBhdGg6IHN0cmluZyxcbiAgICBuZXdCYXNlbmFtZTogc3RyaW5nLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlID0gRmlsZVRyZWVIZWxwZXJzLmdldEZpbGVCeUtleShub2RlLm5vZGVLZXkpO1xuICAgIGlmIChmaWxlID09IG51bGwpIHtcbiAgICAgIC8vIFRPRE86IENvbm5lY3Rpb24gY291bGQgaGF2ZSBiZWVuIGxvc3QgZm9yIHJlbW90ZSBmaWxlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVXNlIGByZXNvbHZlYCB0byBzdHJpcCB0cmFpbGluZyBzbGFzaGVzIGJlY2F1c2UgcmVuYW1pbmcgYSBmaWxlIHRvIGEgbmFtZSB3aXRoIGFcbiAgICAgKiB0cmFpbGluZyBzbGFzaCBpcyBhbiBlcnJvci5cbiAgICAgKi9cbiAgICBjb25zdCBuZXdQYXRoID0gcGF0aE1vZHVsZS5yZXNvbHZlKFxuICAgICAgLy8gVHJpbSBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlIHRvIHByZXZlbnQgYmFkIGZpbGVuYW1lcy5cbiAgICAgIHBhdGhNb2R1bGUuam9pbihwYXRoTW9kdWxlLmRpcm5hbWUobm9kZVBhdGgpLCBuZXdCYXNlbmFtZS50cmltKCkpXG4gICAgKTtcbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JOb2RlKG5vZGUpO1xuICAgIGxldCBzaG91bGRGU1JlbmFtZSA9IHRydWU7XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCkge1xuICAgICAgbGV0IG9sZFBhdGggPSBmaWxlLmdldFBhdGgoKTtcbiAgICAgIGlmICghRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxGaWxlKGZpbGUpKSB7XG4gICAgICAgIGNvbnN0IHJlbW90ZUZpbGUgPSAoKGZpbGU6IGFueSk6IChSZW1vdGVEaXJlY3RvcnkgfCBSZW1vdGVGaWxlKSk7XG4gICAgICAgIG9sZFBhdGggPSByZW1vdGVGaWxlLmdldExvY2FsUGF0aCgpO1xuICAgICAgfVxuICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IGhnUmVwb3NpdG9yeS5yZW5hbWUob2xkUGF0aCwgbmV3UGF0aCk7XG4gICAgICBzaG91bGRGU1JlbmFtZSA9ICFzdWNjZXNzO1xuICAgIH1cbiAgICBpZiAoc2hvdWxkRlNSZW5hbWUpIHtcbiAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNMb2NhbEZpbGUoZmlsZSkpIHtcbiAgICAgICAgYXdhaXQgZnNQcm9taXNlLnJlbmFtZShub2RlUGF0aCwgbmV3UGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCAoKGZpbGU6IGFueSk6IChSZW1vdGVEaXJlY3RvcnkgfCBSZW1vdGVGaWxlKSkucmVuYW1lKG5ld1BhdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhc3luYyBfb25Db25maXJtRHVwbGljYXRlKFxuICAgIGZpbGU6IEZpbGUgfCBSZW1vdGVGaWxlLFxuICAgIG5vZGVQYXRoOiBzdHJpbmcsXG4gICAgbmV3QmFzZW5hbWU6IHN0cmluZyxcbiAgICBhZGRUb1ZDUzogYm9vbGVhbixcbiAgICBvbkRpZENvbmZpcm06IChmaWxlUGF0aDogP3N0cmluZykgPT4gbWl4ZWQsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGZpbGUuZ2V0UGFyZW50KCk7XG4gICAgY29uc3QgbmV3RmlsZSA9IGRpcmVjdG9yeS5nZXRGaWxlKG5ld0Jhc2VuYW1lKTtcbiAgICBjb25zdCBuZXdQYXRoID0gbmV3RmlsZS5nZXRQYXRoKCk7XG4gICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0xvY2FsRmlsZShmaWxlKSkge1xuICAgICAgY29uc3QgZXhpc3RzID0gYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhuZXdQYXRoKTtcbiAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgIGF3YWl0IGZzUHJvbWlzZS5jb3B5KG5vZGVQYXRoLCBuZXdQYXRoKTtcbiAgICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gdGhpcy5fZ2V0SGdSZXBvc2l0b3J5Rm9yUGF0aChuZXdQYXRoKTtcbiAgICAgICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCAmJiBhZGRUb1ZDUykge1xuICAgICAgICAgIGZ1bmN0aW9uIGVycm9ySGFuZGxlcihlcnJvcikge1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBuZXdQYXRoICsgJyB3YXMgZHVwbGljYXRlZCwgYnV0IHRoZXJlIHdhcyBhbiBlcnJvciBhZGRpbmcgaXQgdG8gJyArXG4gICAgICAgICAgICAgICd2ZXJzaW9uIGNvbnRyb2wuJztcbiAgICAgICAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgKz0gJyAgRXJyb3I6ICcgKyBlcnJvci50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCByZXQgPSBoZ1JlcG9zaXRvcnkuYWRkKG5ld1BhdGgpLmNhdGNoKGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgaWYgKCFyZXQpIHtcbiAgICAgICAgICAgIGVycm9ySGFuZGxlcihudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25EaWRDb25maXJtKG5ld1BhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtuZXdQYXRofScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudChmaWxlLmlzRmlsZSgpKTtcbiAgICAgIGNvbnN0IHJlbW90ZUZpbGUgPSAoKGZpbGU6IGFueSk6IFJlbW90ZUZpbGUpO1xuICAgICAgY29uc3QgbmV3UmVtb3RlRmlsZSA9ICgobmV3RmlsZTogYW55KTogUmVtb3RlRmlsZSk7XG5cbiAgICAgIGNvbnN0IHdhc0NvcGllZCA9IGF3YWl0IHJlbW90ZUZpbGUuY29weShuZXdSZW1vdGVGaWxlLmdldExvY2FsUGF0aCgpKTtcbiAgICAgIGlmICghd2FzQ29waWVkKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJyR7bmV3UGF0aH0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JQYXRoKG5ld1JlbW90ZUZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCAmJiBhZGRUb1ZDUykge1xuICAgICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5hZGQobmV3UmVtb3RlRmlsZS5nZXRMb2NhbFBhdGgoKSk7XG4gICAgICAgIH1cbiAgICAgICAgb25EaWRDb25maXJtKG5ld1BhdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBvcGVuUmVuYW1lRGlhbG9nKCk6IHZvaWQge1xuICAgIGNvbnN0IHN0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBzdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuc2l6ZSAhPT0gMSkge1xuICAgICAgLy8gQ2FuIG9ubHkgcmVuYW1lIG9uZSBlbnRyeSBhdCBhIHRpbWUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBjb25zdCBub2RlUGF0aCA9IG5vZGUuZ2V0TG9jYWxQYXRoKCk7XG4gICAgdGhpcy5fb3BlbkRpYWxvZyh7XG4gICAgICBpY29uQ2xhc3NOYW1lOiAnaWNvbi1hcnJvdy1yaWdodCcsXG4gICAgICBpbml0aWFsVmFsdWU6IHBhdGhNb2R1bGUuYmFzZW5hbWUobm9kZVBhdGgpLFxuICAgICAgbWVzc2FnZTogbm9kZS5pc0NvbnRhaW5lclxuICAgICAgICA/IDxzcGFuPkVudGVyIHRoZSBuZXcgcGF0aCBmb3IgdGhlIGRpcmVjdG9yeS48L3NwYW4+XG4gICAgICAgIDogPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZmlsZS48L3NwYW4+LFxuICAgICAgb25Db25maXJtOiAobmV3QmFzZW5hbWU6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KSA9PiB7XG4gICAgICAgIHRoaXMuX29uQ29uZmlybVJlbmFtZShub2RlLCBub2RlUGF0aCwgbmV3QmFzZW5hbWUpLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbmFtZSB0byAke25ld0Jhc2VuYW1lfSBmYWlsZWRgKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgb25DbG9zZTogdGhpcy5fY2xvc2VEaWFsb2csXG4gICAgICBzZWxlY3RCYXNlbmFtZTogdHJ1ZSxcbiAgICB9KTtcbiAgfSxcblxuICBvcGVuRHVwbGljYXRlRGlhbG9nKG9uRGlkQ29uZmlybTogKGZpbGVQYXRoOiA/c3RyaW5nKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGNvbnN0IHN0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBzdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuc2l6ZSAhPT0gMSkge1xuICAgICAgLy8gQ2FuIG9ubHkgY29weSBvbmUgZW50cnkgYXQgYSB0aW1lLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSBzZWxlY3RlZE5vZGVzLmZpcnN0KCk7XG4gICAgY29uc3Qgbm9kZVBhdGggPSBub2RlLmdldExvY2FsUGF0aCgpO1xuICAgIGxldCBpbml0aWFsVmFsdWUgPSBwYXRoTW9kdWxlLmJhc2VuYW1lKG5vZGVQYXRoKTtcbiAgICBjb25zdCBleHQgPSBwYXRoTW9kdWxlLmV4dG5hbWUobm9kZVBhdGgpO1xuICAgIGluaXRpYWxWYWx1ZSA9IGluaXRpYWxWYWx1ZS5zdWJzdHIoMCwgaW5pdGlhbFZhbHVlLmxlbmd0aCAtIGV4dC5sZW5ndGgpICsgJy1jb3B5JyArIGV4dDtcbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JOb2RlKG5vZGUpO1xuICAgIGNvbnN0IGFkZGl0aW9uYWxPcHRpb25zID0ge307XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCkge1xuICAgICAgYWRkaXRpb25hbE9wdGlvbnNbJ2FkZFRvVkNTJ10gPSAnQWRkIHRoZSBuZXcgZmlsZSB0byB2ZXJzaW9uIGNvbnRyb2wuJztcbiAgICB9XG4gICAgdGhpcy5fb3BlbkRpYWxvZyh7XG4gICAgICBpY29uQ2xhc3NOYW1lOiAnaWNvbi1hcnJvdy1yaWdodCcsXG4gICAgICBpbml0aWFsVmFsdWU6IGluaXRpYWxWYWx1ZSxcbiAgICAgIG1lc3NhZ2U6IDxzcGFuPkVudGVyIHRoZSBuZXcgcGF0aCBmb3IgdGhlIGR1cGxpY2F0ZS48L3NwYW4+LFxuICAgICAgb25Db25maXJtOiAobmV3QmFzZW5hbWU6IHN0cmluZywgb3B0aW9uczoge2FkZFRvVkNTPzogYm9vbGVhbn0pID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IEZpbGVUcmVlSGVscGVycy5nZXRGaWxlQnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICAgICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgICAgIC8vIFRPRE86IENvbm5lY3Rpb24gY291bGQgaGF2ZSBiZWVuIGxvc3QgZm9yIHJlbW90ZSBmaWxlLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vbkNvbmZpcm1EdXBsaWNhdGUoXG4gICAgICAgICAgZmlsZSxcbiAgICAgICAgICBub2RlUGF0aCxcbiAgICAgICAgICBuZXdCYXNlbmFtZS50cmltKCksXG4gICAgICAgICAgISFvcHRpb25zLmFkZFRvVkNTLFxuICAgICAgICAgIG9uRGlkQ29uZmlybSxcbiAgICAgICAgKS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBGYWlsZWQgdG8gZHVwbGljYXRlICd7ZmlsZS5nZXRQYXRoKCl9J2ApO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIHNlbGVjdEJhc2VuYW1lOiB0cnVlLFxuICAgICAgYWRkaXRpb25hbE9wdGlvbnMsXG4gICAgfSk7XG4gIH0sXG5cbiAgX2dldFNlbGVjdGVkQ29udGFpbmVyTm9kZSgpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICBjb25zdCBzdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICAvKlxuICAgICAqIFRPRE86IENob29zaW5nIHRoZSBsYXN0IHNlbGVjdGVkIGtleSBpcyBpbmV4YWN0IHdoZW4gdGhlcmUgaXMgbW9yZSB0aGFuIDEgcm9vdC4gVGhlIFNldCBvZlxuICAgICAqIHNlbGVjdGVkIGtleXMgc2hvdWxkIGJlIG1haW50YWluZWQgYXMgYSBmbGF0IGxpc3QgYWNyb3NzIGFsbCByb290cyB0byBtYWludGFpbiBpbnNlcnRpb25cbiAgICAgKiBvcmRlci5cbiAgICAgKi9cbiAgICBjb25zdCBub2RlS2V5ID0gc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChub2RlS2V5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCByb290S2V5ID0gc3RvcmUuZ2V0Um9vdEZvcktleShub2RlS2V5KTtcbiAgICBpZiAocm9vdEtleSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHN0b3JlLmdldE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgcmV0dXJuIG5vZGUuaXNDb250YWluZXIgPyBub2RlIDogbm9kZS5nZXRQYXJlbnROb2RlKCk7XG4gIH0sXG5cbiAgX29wZW5BZGREaWFsb2coXG4gICAgZW50cnlUeXBlOiBzdHJpbmcsXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIG9uQ29uZmlybTogKGZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IE9iamVjdCkgPT4gbWl4ZWQsXG4gICkge1xuICAgIHRoaXMuX29wZW5EaWFsb2coe1xuICAgICAgaWNvbkNsYXNzTmFtZTogJ2ljb24tZmlsZS1hZGQnLFxuICAgICAgbWVzc2FnZTogPHNwYW4+RW50ZXIgdGhlIHBhdGggZm9yIHRoZSBuZXcge2VudHJ5VHlwZX0gaW4gdGhlIHJvb3Q6PGJyIC8+e3BhdGh9PC9zcGFuPixcbiAgICAgIG9uQ29uZmlybSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMuX2Nsb3NlRGlhbG9nLFxuICAgIH0pO1xuICB9LFxuXG4gIF9vcGVuRGlhbG9nKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9jbG9zZURpYWxvZygpO1xuICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZChkaWFsb2dIb3N0RWxlbWVudCk7XG4gICAgZGlhbG9nQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPEZpbGVEaWFsb2dDb21wb25lbnQgey4uLnByb3BzfSAvPixcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50XG4gICAgKTtcbiAgfSxcblxuICBfY2xvc2VEaWFsb2coKTogdm9pZCB7XG4gICAgaWYgKGRpYWxvZ0NvbXBvbmVudCAhPSBudWxsKSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0NvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmIChkaWFsb2dIb3N0RWxlbWVudCAhPSBudWxsKSB7XG4gICAgICBkaWFsb2dIb3N0RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW1BY3Rpb25zO1xuIl19