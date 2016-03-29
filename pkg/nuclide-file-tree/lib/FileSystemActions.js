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
//# sourceMappingURL=data:application/json;base64,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QUksQ0FBQyxXQUFXLENBQUM7QUFDZixtQkFBYSxFQUFFLGVBQWU7QUFDOUIsYUFBTyxFQUFFOzs7O1FBQWtDLFNBQVM7O1FBQWMsNkNBQU07UUFBQyxJQUFJO09BQVE7QUFDckYsZUFBUyxFQUFULFNBQVM7QUFDVCxhQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7QUFDMUIsdUJBQWlCLEVBQWpCLGlCQUFpQjtLQUNsQixDQUFDLENBQUM7R0FDSjs7QUFFRCxhQUFXLEVBQUEscUJBQUMsS0FBYSxFQUFRO0FBQy9CLFFBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNwQixxQkFBaUIsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xELFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNsRSxtQkFBZSxHQUFHLHVCQUFTLE1BQU0sQ0FDL0IsOEVBQXlCLEtBQUssQ0FBSSxFQUNsQyxpQkFBaUIsQ0FDbEIsQ0FBQztHQUNIOztBQUVELGNBQVksRUFBQSx3QkFBUztBQUNuQixRQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUU7QUFDM0IsNkJBQVMsc0JBQXNCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNuRCxxQkFBZSxHQUFHLElBQUksQ0FBQztLQUN4QjtBQUNELFFBQUksaUJBQWlCLElBQUksSUFBSSxFQUFFO0FBQzdCLHVCQUFpQixDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM1RCx1QkFBaUIsR0FBRyxJQUFJLENBQUM7S0FDMUI7R0FDRjtDQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJGaWxlU3lzdGVtQWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIEZpbGVUcmVlTm9kZSBmcm9tICcuL0ZpbGVUcmVlTm9kZSc7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtSZW1vdGVGaWxlfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuaW1wb3J0IEZpbGVEaWFsb2dDb21wb25lbnQgZnJvbSAnLi4vY29tcG9uZW50cy9GaWxlRGlhbG9nQ29tcG9uZW50JztcbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFJlbW90ZVVyaSwge2dldFBhdGh9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge0ZpbGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jbGllbnQnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1naXQtYnJpZGdlJztcbmltcG9ydCB7U3RhdHVzQ29kZU51bWJlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5cbmltcG9ydCBwYXRoTW9kdWxlIGZyb20gJ3BhdGgnO1xuXG5sZXQgZGlhbG9nQ29tcG9uZW50OiA/UmVhY3RDb21wb25lbnQ7XG5sZXQgZGlhbG9nSG9zdEVsZW1lbnQ6ID9IVE1MRWxlbWVudDtcblxuY29uc3QgbGVnYWxTdGF0dXNDb2RlRm9yUmVuYW1lID0gbmV3IFNldChbXG4gIFN0YXR1c0NvZGVOdW1iZXIuQURERUQsXG4gIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU4sXG4gIFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQsXG5dKTtcblxuY29uc3QgRmlsZVN5c3RlbUFjdGlvbnMgPSB7XG4gIG9wZW5BZGRGb2xkZXJEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX2dldFNlbGVjdGVkQ29udGFpbmVyTm9kZSgpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuQWRkRGlhbG9nKFxuICAgICAgJ2ZvbGRlcicsXG4gICAgICBub2RlLmdldExvY2FsUGF0aCgpICsgJy8nLFxuICAgICAgYXN5bmMgKGZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IE9iamVjdCkgPT4ge1xuICAgICAgICAvLyBQcmV2ZW50IHN1Ym1pc3Npb24gb2YgYSBibGFuayBmaWVsZCBmcm9tIGNyZWF0aW5nIGEgZGlyZWN0b3J5LlxuICAgICAgICBpZiAoZmlsZVBhdGggPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgZmlsZVBhdGggaXMgaW4gcm9vdEtleSBhbmQgaWYgbm90LCBmaW5kIHRoZSByb290S2V5IGl0IGJlbG9uZ3MgdG8uXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5nZXREaXJlY3RvcnlCeUtleShub2RlLm5vZGVLZXkpO1xuICAgICAgICBpZiAoZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7cGF0aG5hbWV9ID0gUmVtb3RlVXJpLnBhcnNlKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgYmFzZW5hbWUgPSBwYXRoTW9kdWxlLmJhc2VuYW1lKHBhdGhuYW1lKTtcbiAgICAgICAgY29uc3QgbmV3RGlyZWN0b3J5ID0gZGlyZWN0b3J5LmdldFN1YmRpcmVjdG9yeShiYXNlbmFtZSk7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBuZXdEaXJlY3RvcnkuY3JlYXRlKCk7XG4gICAgICAgIGlmICghY3JlYXRlZCkge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJyR7YmFzZW5hbWV9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb25EaWRDb25maXJtKG5ld0RpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICk7XG4gIH0sXG5cbiAgb3BlbkFkZEZpbGVEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX2dldFNlbGVjdGVkQ29udGFpbmVyTm9kZSgpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JOb2RlKG5vZGUpO1xuICAgIGNvbnN0IGFkZGl0aW9uYWxPcHRpb25zID0ge307XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCkge1xuICAgICAgYWRkaXRpb25hbE9wdGlvbnNbJ2FkZFRvVkNTJ10gPSAnQWRkIHRoZSBuZXcgZmlsZSB0byB2ZXJzaW9uIGNvbnRyb2wuJztcbiAgICB9XG4gICAgdGhpcy5fb3BlbkFkZERpYWxvZyhcbiAgICAgICdmaWxlJyxcbiAgICAgIG5vZGUuZ2V0TG9jYWxQYXRoKCkgKyBwYXRoTW9kdWxlLnNlcCxcbiAgICAgIGFzeW5jIChmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiB7YWRkVG9WQ1M/OiBib29sZWFufSkgPT4ge1xuICAgICAgICAvLyBQcmV2ZW50IHN1Ym1pc3Npb24gb2YgYSBibGFuayBmaWVsZCBmcm9tIGNyZWF0aW5nIGEgZmlsZS5cbiAgICAgICAgaWYgKGZpbGVQYXRoID09PSAnJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGZpbGVQYXRoIGlzIGluIHJvb3RLZXkgYW5kIGlmIG5vdCwgZmluZCB0aGUgcm9vdEtleSBpdCBiZWxvbmdzIHRvLlxuICAgICAgICBjb25zdCBkaXJlY3RvcnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RGlyZWN0b3J5QnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICAgICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IGRpcmVjdG9yeS5nZXRGaWxlKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IG5ld0ZpbGUuY3JlYXRlKCk7XG4gICAgICAgIGlmIChjcmVhdGVkKSB7XG4gICAgICAgICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCAmJiBvcHRpb25zLmFkZFRvVkNTID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBhd2FpdCBoZ1JlcG9zaXRvcnkuYWRkKFtuZXdGaWxlLmdldFBhdGgoKV0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBhZGQgJyR7bmV3RmlsZS5nZXRQYXRofScgdG8gdmVyc2lvbiBjb250cm9sLiAgRXJyb3I6ICR7ZS50b1N0cmluZygpfWAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG9uRGlkQ29uZmlybShuZXdGaWxlLmdldFBhdGgoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtmaWxlUGF0aH0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICAgIG9uRGlkQ29uZmlybShudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zLFxuICAgICk7XG4gIH0sXG5cbiAgX2dldEhnUmVwb3NpdG9yeUZvck5vZGUobm9kZTogRmlsZVRyZWVOb2RlKTogP0hnUmVwb3NpdG9yeUNsaWVudCB7XG4gICAgY29uc3QgZW50cnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RW50cnlCeUtleShub2RlLm5vZGVLZXkpO1xuICAgIGlmIChlbnRyeSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvclBhdGgoZW50cnkuZ2V0UGF0aCgpKTtcbiAgfSxcblxuICBfZ2V0SGdSZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aDogc3RyaW5nKTogP0hnUmVwb3NpdG9yeUNsaWVudCB7XG4gICAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoKTtcbiAgICBpZiAocmVwb3NpdG9yeSAhPSBudWxsICYmIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnKSB7XG4gICAgICByZXR1cm4gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICBhc3luYyBfb25Db25maXJtUmVuYW1lKFxuICAgIG5vZGU6IEZpbGVUcmVlTm9kZSxcbiAgICBub2RlUGF0aDogc3RyaW5nLFxuICAgIG5ld0Jhc2VuYW1lOiBzdHJpbmcsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGVudHJ5ID0gRmlsZVRyZWVIZWxwZXJzLmdldEVudHJ5QnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICBpZiAoZW50cnkgPT0gbnVsbCkge1xuICAgICAgLy8gVE9ETzogQ29ubmVjdGlvbiBjb3VsZCBoYXZlIGJlZW4gbG9zdCBmb3IgcmVtb3RlIGZpbGUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBVc2UgYHJlc29sdmVgIHRvIHN0cmlwIHRyYWlsaW5nIHNsYXNoZXMgYmVjYXVzZSByZW5hbWluZyBhIGZpbGUgdG8gYSBuYW1lIHdpdGggYVxuICAgICAqIHRyYWlsaW5nIHNsYXNoIGlzIGFuIGVycm9yLlxuICAgICAqL1xuICAgIGNvbnN0IG5ld1BhdGggPSBwYXRoTW9kdWxlLnJlc29sdmUoXG4gICAgICAvLyBUcmltIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UgdG8gcHJldmVudCBiYWQgZmlsZW5hbWVzLlxuICAgICAgcGF0aE1vZHVsZS5qb2luKHBhdGhNb2R1bGUuZGlybmFtZShub2RlUGF0aCksIG5ld0Jhc2VuYW1lLnRyaW0oKSlcbiAgICApO1xuICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9IHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvck5vZGUobm9kZSk7XG4gICAgbGV0IHNob3VsZEZTUmVuYW1lID0gdHJ1ZTtcbiAgICBpZiAoaGdSZXBvc2l0b3J5ICE9PSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICBzaG91bGRGU1JlbmFtZSA9IGZhbHNlO1xuICAgICAgICBhd2FpdCBoZ1JlcG9zaXRvcnkucmVuYW1lKGVudHJ5LmdldFBhdGgoKSwgbmV3UGF0aCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZW50cnkuZ2V0UGF0aCgpO1xuICAgICAgICBjb25zdCBzdGF0dXNlcyA9IGF3YWl0IGhnUmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbZmlsZVBhdGhdKTtcbiAgICAgICAgY29uc3QgcGF0aFN0YXR1cyA9IHN0YXR1c2VzLmdldChmaWxlUGF0aCk7XG4gICAgICAgIGlmIChsZWdhbFN0YXR1c0NvZGVGb3JSZW5hbWUuaGFzKHBhdGhTdGF0dXMpKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgJ2BoZyByZW5hbWVgIGZhaWxlZCwgd2lsbCB0cnkgdG8gbW92ZSB0aGUgZmlsZSBpZ25vcmluZyB2ZXJzaW9uIGNvbnRyb2wgaW5zdGVhZC4gICcgK1xuICAgICAgICAgICAgJ0Vycm9yOiAnICsgZS50b1N0cmluZygpLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgc2hvdWxkRlNSZW5hbWUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2hvdWxkRlNSZW5hbWUpIHtcbiAgICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaShlbnRyeS5nZXRQYXRoKCkpO1xuICAgICAgYXdhaXQgc2VydmljZS5yZW5hbWUoZ2V0UGF0aChlbnRyeS5nZXRQYXRoKCkpLCBuZXdQYXRoKTtcbiAgICB9XG4gIH0sXG5cbiAgYXN5bmMgX29uQ29uZmlybUR1cGxpY2F0ZShcbiAgICBmaWxlOiBGaWxlIHwgUmVtb3RlRmlsZSxcbiAgICBub2RlUGF0aDogc3RyaW5nLFxuICAgIG5ld0Jhc2VuYW1lOiBzdHJpbmcsXG4gICAgYWRkVG9WQ1M6IGJvb2xlYW4sXG4gICAgb25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBkaXJlY3RvcnkgPSBmaWxlLmdldFBhcmVudCgpO1xuICAgIGNvbnN0IG5ld0ZpbGUgPSBkaXJlY3RvcnkuZ2V0RmlsZShuZXdCYXNlbmFtZSk7XG4gICAgY29uc3QgbmV3UGF0aCA9IG5ld0ZpbGUuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaShuZXdQYXRoKTtcbiAgICBjb25zdCBleGlzdHMgPSAhKGF3YWl0IHNlcnZpY2UuY29weShub2RlUGF0aCwgZ2V0UGF0aChuZXdQYXRoKSkpO1xuICAgIGlmIChleGlzdHMpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJyR7bmV3UGF0aH0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JQYXRoKG5ld1BhdGgpO1xuICAgIGlmIChoZ1JlcG9zaXRvcnkgIT09IG51bGwgJiYgYWRkVG9WQ1MpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5hZGQoW25ld1BhdGhdKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IG5ld1BhdGggKyAnIHdhcyBkdXBsaWNhdGVkLCBidXQgdGhlcmUgd2FzIGFuIGVycm9yIGFkZGluZyBpdCB0byAnICtcbiAgICAgICAgICAndmVyc2lvbiBjb250cm9sLiAgRXJyb3I6ICcgKyBlLnRvU3RyaW5nKCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvbkRpZENvbmZpcm0obmV3UGF0aCk7XG4gICAgfVxuICB9LFxuXG4gIG9wZW5SZW5hbWVEaWFsb2coKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSByZW5hbWUgb25lIGVudHJ5IGF0IGEgdGltZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGNvbnN0IG5vZGVQYXRoID0gbm9kZS5nZXRMb2NhbFBhdGgoKTtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogcGF0aE1vZHVsZS5iYXNlbmFtZShub2RlUGF0aCksXG4gICAgICBtZXNzYWdlOiBub2RlLmlzQ29udGFpbmVyXG4gICAgICAgID8gPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZGlyZWN0b3J5Ljwvc3Bhbj5cbiAgICAgICAgOiA8c3Bhbj5FbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBmaWxlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpID0+IHtcbiAgICAgICAgdGhpcy5fb25Db25maXJtUmVuYW1lKG5vZGUsIG5vZGVQYXRoLCBuZXdCYXNlbmFtZSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgUmVuYW1lIHRvICR7bmV3QmFzZW5hbWV9IGZhaWxlZGApO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIHNlbGVjdEJhc2VuYW1lOiB0cnVlLFxuICAgIH0pO1xuICB9LFxuXG4gIG9wZW5EdXBsaWNhdGVEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSBjb3B5IG9uZSBlbnRyeSBhdCBhIHRpbWUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBjb25zdCBub2RlUGF0aCA9IG5vZGUuZ2V0TG9jYWxQYXRoKCk7XG4gICAgbGV0IGluaXRpYWxWYWx1ZSA9IHBhdGhNb2R1bGUuYmFzZW5hbWUobm9kZVBhdGgpO1xuICAgIGNvbnN0IGV4dCA9IHBhdGhNb2R1bGUuZXh0bmFtZShub2RlUGF0aCk7XG4gICAgaW5pdGlhbFZhbHVlID0gaW5pdGlhbFZhbHVlLnN1YnN0cigwLCBpbml0aWFsVmFsdWUubGVuZ3RoIC0gZXh0Lmxlbmd0aCkgKyAnLWNvcHknICsgZXh0O1xuICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9IHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvck5vZGUobm9kZSk7XG4gICAgY29uc3QgYWRkaXRpb25hbE9wdGlvbnMgPSB7fTtcbiAgICBpZiAoaGdSZXBvc2l0b3J5ICE9PSBudWxsKSB7XG4gICAgICBhZGRpdGlvbmFsT3B0aW9uc1snYWRkVG9WQ1MnXSA9ICdBZGQgdGhlIG5ldyBmaWxlIHRvIHZlcnNpb24gY29udHJvbC4nO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogaW5pdGlhbFZhbHVlLFxuICAgICAgbWVzc2FnZTogPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZHVwbGljYXRlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nLCBvcHRpb25zOiB7YWRkVG9WQ1M/OiBib29sZWFufSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gRmlsZVRyZWVIZWxwZXJzLmdldEZpbGVCeUtleShub2RlLm5vZGVLZXkpO1xuICAgICAgICBpZiAoZmlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgLy8gVE9ETzogQ29ubmVjdGlvbiBjb3VsZCBoYXZlIGJlZW4gbG9zdCBmb3IgcmVtb3RlIGZpbGUuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29uQ29uZmlybUR1cGxpY2F0ZShcbiAgICAgICAgICBmaWxlLFxuICAgICAgICAgIG5vZGVQYXRoLFxuICAgICAgICAgIG5ld0Jhc2VuYW1lLnRyaW0oKSxcbiAgICAgICAgICAhIW9wdGlvbnMuYWRkVG9WQ1MsXG4gICAgICAgICAgb25EaWRDb25maXJtLFxuICAgICAgICApLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYEZhaWxlZCB0byBkdXBsaWNhdGUgJ3tmaWxlLmdldFBhdGgoKX0nYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMuX2Nsb3NlRGlhbG9nLFxuICAgICAgc2VsZWN0QmFzZW5hbWU6IHRydWUsXG4gICAgICBhZGRpdGlvbmFsT3B0aW9ucyxcbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHN0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIC8qXG4gICAgICogVE9ETzogQ2hvb3NpbmcgdGhlIGxhc3Qgc2VsZWN0ZWQga2V5IGlzIGluZXhhY3Qgd2hlbiB0aGVyZSBpcyBtb3JlIHRoYW4gMSByb290LiBUaGUgU2V0IG9mXG4gICAgICogc2VsZWN0ZWQga2V5cyBzaG91bGQgYmUgbWFpbnRhaW5lZCBhcyBhIGZsYXQgbGlzdCBhY3Jvc3MgYWxsIHJvb3RzIHRvIG1haW50YWluIGluc2VydGlvblxuICAgICAqIG9yZGVyLlxuICAgICAqL1xuICAgIGNvbnN0IG5vZGVLZXkgPSBzdG9yZS5nZXRTZWxlY3RlZEtleXMoKS5sYXN0KCk7XG4gICAgaWYgKG5vZGVLZXkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJvb3RLZXkgPSBzdG9yZS5nZXRSb290Rm9yS2V5KG5vZGVLZXkpO1xuICAgIGlmIChyb290S2V5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gc3RvcmUuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICByZXR1cm4gbm9kZS5pc0NvbnRhaW5lciA/IG5vZGUgOiBub2RlLmdldFBhcmVudE5vZGUoKTtcbiAgfSxcblxuICBfb3BlbkFkZERpYWxvZyhcbiAgICBlbnRyeVR5cGU6IHN0cmluZyxcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgb25Db25maXJtOiAoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KSA9PiBtaXhlZCxcbiAgICBhZGRpdGlvbmFsT3B0aW9ucz86IE9iamVjdCA9IHt9LFxuICApIHtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWZpbGUtYWRkJyxcbiAgICAgIG1lc3NhZ2U6IDxzcGFuPkVudGVyIHRoZSBwYXRoIGZvciB0aGUgbmV3IHtlbnRyeVR5cGV9IGluIHRoZSByb290OjxiciAvPntwYXRofTwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zLFxuICAgIH0pO1xuICB9LFxuXG4gIF9vcGVuRGlhbG9nKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9jbG9zZURpYWxvZygpO1xuICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZChkaWFsb2dIb3N0RWxlbWVudCk7XG4gICAgZGlhbG9nQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPEZpbGVEaWFsb2dDb21wb25lbnQgey4uLnByb3BzfSAvPixcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50XG4gICAgKTtcbiAgfSxcblxuICBfY2xvc2VEaWFsb2coKTogdm9pZCB7XG4gICAgaWYgKGRpYWxvZ0NvbXBvbmVudCAhPSBudWxsKSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0NvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmIChkaWFsb2dIb3N0RWxlbWVudCAhPSBudWxsKSB7XG4gICAgICBkaWFsb2dIb3N0RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW1BY3Rpb25zO1xuIl19