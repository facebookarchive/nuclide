function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _FileTreeStore = require('./FileTreeStore');

var _FileTreeStore2 = _interopRequireDefault(_FileTreeStore);

var _componentsFileDialogComponent = require('../components/FileDialogComponent');

var _componentsFileDialogComponent2 = _interopRequireDefault(_componentsFileDialogComponent);

var _reactForAtom = require('react-for-atom');

var _remoteUri = require('../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var dialogComponent = undefined;
var dialogHostElement = undefined;

var FileSystemActions = {
  openAddFolderDialog: function openAddFolderDialog(onDidConfirm) {
    var node = this._getSelectedContainerNode();
    if (!node) {
      return;
    }
    this._openAddDialog('folder', node.getLocalPath() + '/', _asyncToGenerator(function* (filePath) {
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

  openRenameDialog: function openRenameDialog() {
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
      onConfirm: function onConfirm(newBasename) {
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
        if (_FileTreeHelpers2['default'].isLocalFile(file)) {
          _fsPlus2['default'].rename(nodePath, newPath);
        } else {
          file.rename(newPath);
        }
      },
      onClose: this._closeDialog,
      selectBasename: true
    });
  },

  openDuplicateDialog: function openDuplicateDialog(onDidConfirm) {
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
    this._openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: initialValue,
      message: _reactForAtom.React.createElement(
        'span',
        null,
        'Enter the new path for the duplicate.'
      ),
      onConfirm: _asyncToGenerator(function* (newBasename) {
        var file = _FileTreeHelpers2['default'].getFileByKey(node.nodeKey);
        if (file == null) {
          // TODO: Connection could have been lost for remote file.
          return;
        }
        if (_FileTreeHelpers2['default'].isLocalFile(file)) {
          (function () {
            var directory = file.getParent();
            var newFile = directory.getFile(newBasename.trim());
            var newPath = newFile.getPath();
            _fsPlus2['default'].exists(newPath, function (exists) {
              if (!exists) {
                _fsPlus2['default'].copy(nodePath, newPath);
              } else {
                atom.notifications.addError('\'' + newPath + '\' already exists.');
              }
            });
          })();
        } else {
          (0, _assert2['default'])(file.isFile());
          var remoteFile = file;
          var remoteDirectory = remoteFile.getParent();
          var newRemoteFile = remoteDirectory.getFile(newBasename.trim());
          var newRemotePath = newRemoteFile.getPath();

          var wasCopied = yield remoteFile.copy(newRemoteFile.getLocalPath());
          if (!wasCopied) {
            atom.notifications.addError('\'' + newRemotePath + '\' already exists.');
            onDidConfirm(null);
          } else {
            onDidConfirm(newRemotePath);
          }
        }
      }),
      onClose: this._closeDialog,
      selectBasename: true
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
    dialogComponent = _reactForAtom.React.render(_reactForAtom.React.createElement(_componentsFileDialogComponent2['default'], props), dialogHostElement);
  },

  _closeDialog: function _closeDialog() {
    if (dialogComponent != null) {
      _reactForAtom.React.unmountComponentAtNode(dialogHostElement);
      dialogComponent = null;
    }
    if (dialogHostElement != null) {
      dialogHostElement.parentNode.removeChild(dialogHostElement);
      dialogHostElement = null;
    }
  }
};

module.exports = FileSystemActions;
//# sourceMappingURL=data:application/json;base64,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QyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2hELHFCQUFlLEdBQUcsSUFBSSxDQUFDO0tBQ3hCO0FBQ0QsUUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7QUFDN0IsdUJBQWlCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVELHVCQUFpQixHQUFHLElBQUksQ0FBQztLQUMxQjtHQUNGO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkZpbGVTeXN0ZW1BY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRmlsZVRyZWVOb2RlIGZyb20gJy4vRmlsZVRyZWVOb2RlJztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCBGaWxlRGlhbG9nQ29tcG9uZW50IGZyb20gJy4uL2NvbXBvbmVudHMvRmlsZURpYWxvZ0NvbXBvbmVudCc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVtb3RlVXJpIGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgcGF0aE1vZHVsZSBmcm9tICdwYXRoJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5sZXQgZGlhbG9nQ29tcG9uZW50OiA/UmVhY3RDb21wb25lbnQ7XG5sZXQgZGlhbG9nSG9zdEVsZW1lbnQ6ID9IVE1MRWxlbWVudDtcblxuY29uc3QgRmlsZVN5c3RlbUFjdGlvbnMgPSB7XG4gIG9wZW5BZGRGb2xkZXJEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX2dldFNlbGVjdGVkQ29udGFpbmVyTm9kZSgpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuQWRkRGlhbG9nKCdmb2xkZXInLCBub2RlLmdldExvY2FsUGF0aCgpICsgJy8nLCBhc3luYyAoZmlsZVBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgLy8gUHJldmVudCBzdWJtaXNzaW9uIG9mIGEgYmxhbmsgZmllbGQgZnJvbSBjcmVhdGluZyBhIGRpcmVjdG9yeS5cbiAgICAgIGlmIChmaWxlUGF0aCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBjaGVjayBpZiBmaWxlUGF0aCBpcyBpbiByb290S2V5IGFuZCBpZiBub3QsIGZpbmQgdGhlIHJvb3RLZXkgaXQgYmVsb25ncyB0by5cbiAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5nZXREaXJlY3RvcnlCeUtleShub2RlLm5vZGVLZXkpO1xuICAgICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qge3BhdGhuYW1lfSA9IFJlbW90ZVVyaS5wYXJzZShmaWxlUGF0aCk7XG4gICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGhNb2R1bGUuYmFzZW5hbWUocGF0aG5hbWUpO1xuICAgICAgY29uc3QgbmV3RGlyZWN0b3J5ID0gZGlyZWN0b3J5LmdldFN1YmRpcmVjdG9yeShiYXNlbmFtZSk7XG4gICAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgbmV3RGlyZWN0b3J5LmNyZWF0ZSgpO1xuICAgICAgaWYgKCFjcmVhdGVkKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJyR7YmFzZW5hbWV9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25EaWRDb25maXJtKG5ld0RpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIG9wZW5BZGRGaWxlRGlhbG9nKG9uRGlkQ29uZmlybTogKGZpbGVQYXRoOiA/c3RyaW5nKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9nZXRTZWxlY3RlZENvbnRhaW5lck5vZGUoKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fb3BlbkFkZERpYWxvZygnZmlsZScsIG5vZGUuZ2V0TG9jYWxQYXRoKCkgKyAnLycsIGFzeW5jIChmaWxlUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAvLyBQcmV2ZW50IHN1Ym1pc3Npb24gb2YgYSBibGFuayBmaWVsZCBmcm9tIGNyZWF0aW5nIGEgZmlsZS5cbiAgICAgIGlmIChmaWxlUGF0aCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBjaGVjayBpZiBmaWxlUGF0aCBpcyBpbiByb290S2V5IGFuZCBpZiBub3QsIGZpbmQgdGhlIHJvb3RLZXkgaXQgYmVsb25ncyB0by5cbiAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5nZXREaXJlY3RvcnlCeUtleShub2RlLm5vZGVLZXkpO1xuICAgICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3RmlsZSA9IGRpcmVjdG9yeS5nZXRGaWxlKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBuZXdGaWxlLmNyZWF0ZSgpO1xuICAgICAgaWYgKGNyZWF0ZWQpIHtcbiAgICAgICAgb25EaWRDb25maXJtKG5ld0ZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJyR7ZmlsZVBhdGh9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIG9wZW5SZW5hbWVEaWFsb2coKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSByZW5hbWUgb25lIGVudHJ5IGF0IGEgdGltZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGNvbnN0IG5vZGVQYXRoID0gbm9kZS5nZXRMb2NhbFBhdGgoKTtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogcGF0aE1vZHVsZS5iYXNlbmFtZShub2RlUGF0aCksXG4gICAgICBtZXNzYWdlOiBub2RlLmlzQ29udGFpbmVyXG4gICAgICAgID8gPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZGlyZWN0b3J5Ljwvc3Bhbj5cbiAgICAgICAgOiA8c3Bhbj5FbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBmaWxlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RmlsZUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICAgIGlmIChmaWxlID09IG51bGwpIHtcbiAgICAgICAgICAvLyBUT0RPOiBDb25uZWN0aW9uIGNvdWxkIGhhdmUgYmVlbiBsb3N0IGZvciByZW1vdGUgZmlsZS5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAgKiBVc2UgYHJlc29sdmVgIHRvIHN0cmlwIHRyYWlsaW5nIHNsYXNoZXMgYmVjYXVzZSByZW5hbWluZyBhIGZpbGUgdG8gYSBuYW1lIHdpdGggYVxuICAgICAgICAgKiB0cmFpbGluZyBzbGFzaCBpcyBhbiBlcnJvci5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG5ld1BhdGggPSBwYXRoTW9kdWxlLnJlc29sdmUoXG4gICAgICAgICAgLy8gVHJpbSBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlIHRvIHByZXZlbnQgYmFkIGZpbGVuYW1lcy5cbiAgICAgICAgICBwYXRoTW9kdWxlLmpvaW4ocGF0aE1vZHVsZS5kaXJuYW1lKG5vZGVQYXRoKSwgbmV3QmFzZW5hbWUudHJpbSgpKVxuICAgICAgICApO1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxGaWxlKGZpbGUpKSB7XG4gICAgICAgICAgZnMucmVuYW1lKG5vZGVQYXRoLCBuZXdQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAoKGZpbGU6IGFueSk6IChSZW1vdGVEaXJlY3RvcnkgfCBSZW1vdGVGaWxlKSkucmVuYW1lKG5ld1BhdGgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25DbG9zZTogdGhpcy5fY2xvc2VEaWFsb2csXG4gICAgICBzZWxlY3RCYXNlbmFtZTogdHJ1ZSxcbiAgICB9KTtcbiAgfSxcblxuICBvcGVuRHVwbGljYXRlRGlhbG9nKG9uRGlkQ29uZmlybTogKGZpbGVQYXRoOiA/c3RyaW5nKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGNvbnN0IHN0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBzdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuc2l6ZSAhPT0gMSkge1xuICAgICAgLy8gQ2FuIG9ubHkgY29weSBvbmUgZW50cnkgYXQgYSB0aW1lLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSBzZWxlY3RlZE5vZGVzLmZpcnN0KCk7XG4gICAgY29uc3Qgbm9kZVBhdGggPSBub2RlLmdldExvY2FsUGF0aCgpO1xuICAgIGxldCBpbml0aWFsVmFsdWUgPSBwYXRoTW9kdWxlLmJhc2VuYW1lKG5vZGVQYXRoKTtcbiAgICBjb25zdCBleHQgPSBwYXRoTW9kdWxlLmV4dG5hbWUobm9kZVBhdGgpO1xuICAgIGluaXRpYWxWYWx1ZSA9IGluaXRpYWxWYWx1ZS5zdWJzdHIoMCwgaW5pdGlhbFZhbHVlLmxlbmd0aCAtIGV4dC5sZW5ndGgpICsgJy1jb3B5JyArIGV4dDtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogaW5pdGlhbFZhbHVlLFxuICAgICAgbWVzc2FnZTogPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZHVwbGljYXRlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IGFzeW5jIChuZXdCYXNlbmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RmlsZUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICAgIGlmIChmaWxlID09IG51bGwpIHtcbiAgICAgICAgICAvLyBUT0RPOiBDb25uZWN0aW9uIGNvdWxkIGhhdmUgYmVlbiBsb3N0IGZvciByZW1vdGUgZmlsZS5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0xvY2FsRmlsZShmaWxlKSkge1xuICAgICAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IGZpbGUuZ2V0UGFyZW50KCk7XG4gICAgICAgICAgY29uc3QgbmV3RmlsZSA9IGRpcmVjdG9yeS5nZXRGaWxlKG5ld0Jhc2VuYW1lLnRyaW0oKSk7XG4gICAgICAgICAgY29uc3QgbmV3UGF0aCA9IG5ld0ZpbGUuZ2V0UGF0aCgpO1xuICAgICAgICAgIGZzLmV4aXN0cyhuZXdQYXRoLCBmdW5jdGlvbihleGlzdHMpIHtcbiAgICAgICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgICAgIGZzLmNvcHkobm9kZVBhdGgsIG5ld1BhdGgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtuZXdQYXRofScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW52YXJpYW50KGZpbGUuaXNGaWxlKCkpO1xuICAgICAgICAgIGNvbnN0IHJlbW90ZUZpbGUgPSAoKGZpbGU6IGFueSk6IFJlbW90ZUZpbGUpO1xuICAgICAgICAgIGNvbnN0IHJlbW90ZURpcmVjdG9yeSA9IHJlbW90ZUZpbGUuZ2V0UGFyZW50KCk7XG4gICAgICAgICAgY29uc3QgbmV3UmVtb3RlRmlsZSA9IHJlbW90ZURpcmVjdG9yeS5nZXRGaWxlKG5ld0Jhc2VuYW1lLnRyaW0oKSk7XG4gICAgICAgICAgY29uc3QgbmV3UmVtb3RlUGF0aCA9IG5ld1JlbW90ZUZpbGUuZ2V0UGF0aCgpO1xuXG4gICAgICAgICAgY29uc3Qgd2FzQ29waWVkID1cbiAgICAgICAgICAgIGF3YWl0IHJlbW90ZUZpbGUuY29weShuZXdSZW1vdGVGaWxlLmdldExvY2FsUGF0aCgpKTtcbiAgICAgICAgICBpZiAoIXdhc0NvcGllZCkge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtuZXdSZW1vdGVQYXRofScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICAgICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9uRGlkQ29uZmlybShuZXdSZW1vdGVQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIHNlbGVjdEJhc2VuYW1lOiB0cnVlLFxuICAgIH0pO1xuICB9LFxuXG4gIF9nZXRTZWxlY3RlZENvbnRhaW5lck5vZGUoKTogP0ZpbGVUcmVlTm9kZSB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgLypcbiAgICAgKiBUT0RPOiBDaG9vc2luZyB0aGUgbGFzdCBzZWxlY3RlZCBrZXkgaXMgaW5leGFjdCB3aGVuIHRoZXJlIGlzIG1vcmUgdGhhbiAxIHJvb3QuIFRoZSBTZXQgb2ZcbiAgICAgKiBzZWxlY3RlZCBrZXlzIHNob3VsZCBiZSBtYWludGFpbmVkIGFzIGEgZmxhdCBsaXN0IGFjcm9zcyBhbGwgcm9vdHMgdG8gbWFpbnRhaW4gaW5zZXJ0aW9uXG4gICAgICogb3JkZXIuXG4gICAgICovXG4gICAgY29uc3Qgbm9kZUtleSA9IHN0b3JlLmdldFNlbGVjdGVkS2V5cygpLmxhc3QoKTtcbiAgICBpZiAobm9kZUtleSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleSA9IHN0b3JlLmdldFJvb3RGb3JLZXkobm9kZUtleSk7XG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IG5vZGUgPSBzdG9yZS5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIHJldHVybiBub2RlLmlzQ29udGFpbmVyID8gbm9kZSA6IG5vZGUuZ2V0UGFyZW50Tm9kZSgpO1xuICB9LFxuXG4gIF9vcGVuQWRkRGlhbG9nKGVudHJ5VHlwZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIG9uQ29uZmlybTogKGZpbGVQYXRoOiBzdHJpbmcpID0+IG1peGVkKSB7XG4gICAgdGhpcy5fb3BlbkRpYWxvZyh7XG4gICAgICBpY29uQ2xhc3NOYW1lOiAnaWNvbi1maWxlLWFkZCcsXG4gICAgICBtZXNzYWdlOiA8c3Bhbj5FbnRlciB0aGUgcGF0aCBmb3IgdGhlIG5ldyB7ZW50cnlUeXBlfSBpbiB0aGUgcm9vdDo8YnIgLz57cGF0aH08L3NwYW4+LFxuICAgICAgb25Db25maXJtLFxuICAgICAgb25DbG9zZTogdGhpcy5fY2xvc2VEaWFsb2csXG4gICAgfSk7XG4gIH0sXG5cbiAgX29wZW5EaWFsb2cocHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMuX2Nsb3NlRGlhbG9nKCk7XG4gICAgZGlhbG9nSG9zdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLmFwcGVuZENoaWxkKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICBkaWFsb2dDb21wb25lbnQgPSBSZWFjdC5yZW5kZXIoXG4gICAgICA8RmlsZURpYWxvZ0NvbXBvbmVudCB7Li4ucHJvcHN9IC8+LFxuICAgICAgZGlhbG9nSG9zdEVsZW1lbnRcbiAgICApO1xuICB9LFxuXG4gIF9jbG9zZURpYWxvZygpOiB2b2lkIHtcbiAgICBpZiAoZGlhbG9nQ29tcG9uZW50ICE9IG51bGwpIHtcbiAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUoZGlhbG9nSG9zdEVsZW1lbnQpO1xuICAgICAgZGlhbG9nQ29tcG9uZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKGRpYWxvZ0hvc3RFbGVtZW50ICE9IG51bGwpIHtcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZGlhbG9nSG9zdEVsZW1lbnQpO1xuICAgICAgZGlhbG9nSG9zdEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVN5c3RlbUFjdGlvbnM7XG4iXX0=