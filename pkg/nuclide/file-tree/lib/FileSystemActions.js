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
//# sourceMappingURL=data:application/json;base64,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QyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ25ELHFCQUFlLEdBQUcsSUFBSSxDQUFDO0tBQ3hCO0FBQ0QsUUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7QUFDN0IsdUJBQWlCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVELHVCQUFpQixHQUFHLElBQUksQ0FBQztLQUMxQjtHQUNGO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkZpbGVTeXN0ZW1BY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRmlsZVRyZWVOb2RlIGZyb20gJy4vRmlsZVRyZWVOb2RlJztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCBGaWxlRGlhbG9nQ29tcG9uZW50IGZyb20gJy4uL2NvbXBvbmVudHMvRmlsZURpYWxvZ0NvbXBvbmVudCc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJztcbmltcG9ydCBwYXRoTW9kdWxlIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmxldCBkaWFsb2dDb21wb25lbnQ6ID9SZWFjdENvbXBvbmVudDtcbmxldCBkaWFsb2dIb3N0RWxlbWVudDogP0hUTUxFbGVtZW50O1xuXG5jb25zdCBGaWxlU3lzdGVtQWN0aW9ucyA9IHtcbiAgb3BlbkFkZEZvbGRlckRpYWxvZyhvbkRpZENvbmZpcm06IChmaWxlUGF0aDogP3N0cmluZykgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX29wZW5BZGREaWFsb2coJ2ZvbGRlcicsIG5vZGUuZ2V0TG9jYWxQYXRoKCkgKyAnLycsIGFzeW5jIChmaWxlUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAvLyBQcmV2ZW50IHN1Ym1pc3Npb24gb2YgYSBibGFuayBmaWVsZCBmcm9tIGNyZWF0aW5nIGEgZGlyZWN0b3J5LlxuICAgICAgaWYgKGZpbGVQYXRoID09PSAnJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGZpbGVQYXRoIGlzIGluIHJvb3RLZXkgYW5kIGlmIG5vdCwgZmluZCB0aGUgcm9vdEtleSBpdCBiZWxvbmdzIHRvLlxuICAgICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICBpZiAoZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7cGF0aG5hbWV9ID0gUmVtb3RlVXJpLnBhcnNlKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IGJhc2VuYW1lID0gcGF0aE1vZHVsZS5iYXNlbmFtZShwYXRobmFtZSk7XG4gICAgICBjb25zdCBuZXdEaXJlY3RvcnkgPSBkaXJlY3RvcnkuZ2V0U3ViZGlyZWN0b3J5KGJhc2VuYW1lKTtcbiAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBuZXdEaXJlY3RvcnkuY3JlYXRlKCk7XG4gICAgICBpZiAoIWNyZWF0ZWQpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtiYXNlbmFtZX0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvbkRpZENvbmZpcm0obmV3RGlyZWN0b3J5LmdldFBhdGgoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgb3BlbkFkZEZpbGVEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX2dldFNlbGVjdGVkQ29udGFpbmVyTm9kZSgpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuQWRkRGlhbG9nKCdmaWxlJywgbm9kZS5nZXRMb2NhbFBhdGgoKSArICcvJywgYXN5bmMgKGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgIC8vIFByZXZlbnQgc3VibWlzc2lvbiBvZiBhIGJsYW5rIGZpZWxkIGZyb20gY3JlYXRpbmcgYSBmaWxlLlxuICAgICAgaWYgKGZpbGVQYXRoID09PSAnJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGZpbGVQYXRoIGlzIGluIHJvb3RLZXkgYW5kIGlmIG5vdCwgZmluZCB0aGUgcm9vdEtleSBpdCBiZWxvbmdzIHRvLlxuICAgICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICBpZiAoZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBuZXdGaWxlID0gZGlyZWN0b3J5LmdldEZpbGUoZmlsZVBhdGgpO1xuICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IG5ld0ZpbGUuY3JlYXRlKCk7XG4gICAgICBpZiAoY3JlYXRlZCkge1xuICAgICAgICBvbkRpZENvbmZpcm0obmV3RmlsZS5nZXRQYXRoKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtmaWxlUGF0aH0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgb3BlblJlbmFtZURpYWxvZygpOiB2b2lkIHtcbiAgICBjb25zdCBzdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGlmIChzZWxlY3RlZE5vZGVzLnNpemUgIT09IDEpIHtcbiAgICAgIC8vIENhbiBvbmx5IHJlbmFtZSBvbmUgZW50cnkgYXQgYSB0aW1lLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSBzZWxlY3RlZE5vZGVzLmZpcnN0KCk7XG4gICAgY29uc3Qgbm9kZVBhdGggPSBub2RlLmdldExvY2FsUGF0aCgpO1xuICAgIHRoaXMuX29wZW5EaWFsb2coe1xuICAgICAgaWNvbkNsYXNzTmFtZTogJ2ljb24tYXJyb3ctcmlnaHQnLFxuICAgICAgaW5pdGlhbFZhbHVlOiBwYXRoTW9kdWxlLmJhc2VuYW1lKG5vZGVQYXRoKSxcbiAgICAgIG1lc3NhZ2U6IG5vZGUuaXNDb250YWluZXJcbiAgICAgICAgPyA8c3Bhbj5FbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBkaXJlY3RvcnkuPC9zcGFuPlxuICAgICAgICA6IDxzcGFuPkVudGVyIHRoZSBuZXcgcGF0aCBmb3IgdGhlIGZpbGUuPC9zcGFuPixcbiAgICAgIG9uQ29uZmlybTogKG5ld0Jhc2VuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IEZpbGVUcmVlSGVscGVycy5nZXRGaWxlQnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICAgICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgICAgIC8vIFRPRE86IENvbm5lY3Rpb24gY291bGQgaGF2ZSBiZWVuIGxvc3QgZm9yIHJlbW90ZSBmaWxlLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFVzZSBgcmVzb2x2ZWAgdG8gc3RyaXAgdHJhaWxpbmcgc2xhc2hlcyBiZWNhdXNlIHJlbmFtaW5nIGEgZmlsZSB0byBhIG5hbWUgd2l0aCBhXG4gICAgICAgICAqIHRyYWlsaW5nIHNsYXNoIGlzIGFuIGVycm9yLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbmV3UGF0aCA9IHBhdGhNb2R1bGUucmVzb2x2ZShcbiAgICAgICAgICAvLyBUcmltIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UgdG8gcHJldmVudCBiYWQgZmlsZW5hbWVzLlxuICAgICAgICAgIHBhdGhNb2R1bGUuam9pbihwYXRoTW9kdWxlLmRpcm5hbWUobm9kZVBhdGgpLCBuZXdCYXNlbmFtZS50cmltKCkpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNMb2NhbEZpbGUoZmlsZSkpIHtcbiAgICAgICAgICBmcy5yZW5hbWUobm9kZVBhdGgsIG5ld1BhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICgoZmlsZTogYW55KTogKFJlbW90ZURpcmVjdG9yeSB8IFJlbW90ZUZpbGUpKS5yZW5hbWUobmV3UGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIHNlbGVjdEJhc2VuYW1lOiB0cnVlLFxuICAgIH0pO1xuICB9LFxuXG4gIG9wZW5EdXBsaWNhdGVEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSBjb3B5IG9uZSBlbnRyeSBhdCBhIHRpbWUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBjb25zdCBub2RlUGF0aCA9IG5vZGUuZ2V0TG9jYWxQYXRoKCk7XG4gICAgbGV0IGluaXRpYWxWYWx1ZSA9IHBhdGhNb2R1bGUuYmFzZW5hbWUobm9kZVBhdGgpO1xuICAgIGNvbnN0IGV4dCA9IHBhdGhNb2R1bGUuZXh0bmFtZShub2RlUGF0aCk7XG4gICAgaW5pdGlhbFZhbHVlID0gaW5pdGlhbFZhbHVlLnN1YnN0cigwLCBpbml0aWFsVmFsdWUubGVuZ3RoIC0gZXh0Lmxlbmd0aCkgKyAnLWNvcHknICsgZXh0O1xuICAgIHRoaXMuX29wZW5EaWFsb2coe1xuICAgICAgaWNvbkNsYXNzTmFtZTogJ2ljb24tYXJyb3ctcmlnaHQnLFxuICAgICAgaW5pdGlhbFZhbHVlOiBpbml0aWFsVmFsdWUsXG4gICAgICBtZXNzYWdlOiA8c3Bhbj5FbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBkdXBsaWNhdGUuPC9zcGFuPixcbiAgICAgIG9uQ29uZmlybTogYXN5bmMgKG5ld0Jhc2VuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IEZpbGVUcmVlSGVscGVycy5nZXRGaWxlQnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICAgICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgICAgIC8vIFRPRE86IENvbm5lY3Rpb24gY291bGQgaGF2ZSBiZWVuIGxvc3QgZm9yIHJlbW90ZSBmaWxlLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxGaWxlKGZpbGUpKSB7XG4gICAgICAgICAgY29uc3QgZGlyZWN0b3J5ID0gZmlsZS5nZXRQYXJlbnQoKTtcbiAgICAgICAgICBjb25zdCBuZXdGaWxlID0gZGlyZWN0b3J5LmdldEZpbGUobmV3QmFzZW5hbWUudHJpbSgpKTtcbiAgICAgICAgICBjb25zdCBuZXdQYXRoID0gbmV3RmlsZS5nZXRQYXRoKCk7XG4gICAgICAgICAgZnMuZXhpc3RzKG5ld1BhdGgsIGZ1bmN0aW9uKGV4aXN0cykge1xuICAgICAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICAgICAgZnMuY29weShub2RlUGF0aCwgbmV3UGF0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCcke25ld1BhdGh9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnZhcmlhbnQoZmlsZS5pc0ZpbGUoKSk7XG4gICAgICAgICAgY29uc3QgcmVtb3RlRmlsZSA9ICgoZmlsZTogYW55KTogUmVtb3RlRmlsZSk7XG4gICAgICAgICAgY29uc3QgcmVtb3RlRGlyZWN0b3J5ID0gcmVtb3RlRmlsZS5nZXRQYXJlbnQoKTtcbiAgICAgICAgICBjb25zdCBuZXdSZW1vdGVGaWxlID0gcmVtb3RlRGlyZWN0b3J5LmdldEZpbGUobmV3QmFzZW5hbWUudHJpbSgpKTtcbiAgICAgICAgICBjb25zdCBuZXdSZW1vdGVQYXRoID0gbmV3UmVtb3RlRmlsZS5nZXRQYXRoKCk7XG5cbiAgICAgICAgICBjb25zdCB3YXNDb3BpZWQgPVxuICAgICAgICAgICAgYXdhaXQgcmVtb3RlRmlsZS5jb3B5KG5ld1JlbW90ZUZpbGUuZ2V0TG9jYWxQYXRoKCkpO1xuICAgICAgICAgIGlmICghd2FzQ29waWVkKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCcke25ld1JlbW90ZVBhdGh9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgICAgICAgIG9uRGlkQ29uZmlybShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25EaWRDb25maXJtKG5ld1JlbW90ZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMuX2Nsb3NlRGlhbG9nLFxuICAgICAgc2VsZWN0QmFzZW5hbWU6IHRydWUsXG4gICAgfSk7XG4gIH0sXG5cbiAgX2dldFNlbGVjdGVkQ29udGFpbmVyTm9kZSgpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICBjb25zdCBzdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICAvKlxuICAgICAqIFRPRE86IENob29zaW5nIHRoZSBsYXN0IHNlbGVjdGVkIGtleSBpcyBpbmV4YWN0IHdoZW4gdGhlcmUgaXMgbW9yZSB0aGFuIDEgcm9vdC4gVGhlIFNldCBvZlxuICAgICAqIHNlbGVjdGVkIGtleXMgc2hvdWxkIGJlIG1haW50YWluZWQgYXMgYSBmbGF0IGxpc3QgYWNyb3NzIGFsbCByb290cyB0byBtYWludGFpbiBpbnNlcnRpb25cbiAgICAgKiBvcmRlci5cbiAgICAgKi9cbiAgICBjb25zdCBub2RlS2V5ID0gc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChub2RlS2V5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCByb290S2V5ID0gc3RvcmUuZ2V0Um9vdEZvcktleShub2RlS2V5KTtcbiAgICBpZiAocm9vdEtleSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHN0b3JlLmdldE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgcmV0dXJuIG5vZGUuaXNDb250YWluZXIgPyBub2RlIDogbm9kZS5nZXRQYXJlbnROb2RlKCk7XG4gIH0sXG5cbiAgX29wZW5BZGREaWFsb2coZW50cnlUeXBlOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgb25Db25maXJtOiAoZmlsZVBhdGg6IHN0cmluZykgPT4gbWl4ZWQpIHtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWZpbGUtYWRkJyxcbiAgICAgIG1lc3NhZ2U6IDxzcGFuPkVudGVyIHRoZSBwYXRoIGZvciB0aGUgbmV3IHtlbnRyeVR5cGV9IGluIHRoZSByb290OjxiciAvPntwYXRofTwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICB9KTtcbiAgfSxcblxuICBfb3BlbkRpYWxvZyhwcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy5fY2xvc2VEaWFsb2coKTtcbiAgICBkaWFsb2dIb3N0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkuYXBwZW5kQ2hpbGQoZGlhbG9nSG9zdEVsZW1lbnQpO1xuICAgIGRpYWxvZ0NvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxGaWxlRGlhbG9nQ29tcG9uZW50IHsuLi5wcm9wc30gLz4sXG4gICAgICBkaWFsb2dIb3N0RWxlbWVudFxuICAgICk7XG4gIH0sXG5cbiAgX2Nsb3NlRGlhbG9nKCk6IHZvaWQge1xuICAgIGlmIChkaWFsb2dDb21wb25lbnQgIT0gbnVsbCkge1xuICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShkaWFsb2dIb3N0RWxlbWVudCk7XG4gICAgICBkaWFsb2dDb21wb25lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoZGlhbG9nSG9zdEVsZW1lbnQgIT0gbnVsbCkge1xuICAgICAgZGlhbG9nSG9zdEVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkaWFsb2dIb3N0RWxlbWVudCk7XG4gICAgICBkaWFsb2dIb3N0RWxlbWVudCA9IG51bGw7XG4gICAgfVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzdGVtQWN0aW9ucztcbiJdfQ==