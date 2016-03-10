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
            yield hgRepository.add(newFile.getPath());
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
    var repository = (0, _hgGitBridge.repositoryForPath)(filePath);
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
      if (_FileTreeHelpers2['default'].isLocalEntry(entry)) {
        yield _nuclideCommons.fsPromise.rename(nodePath, newPath);
      } else {
        yield entry.rename(newPath);
      }
    }
  }),

  _onConfirmDuplicate: _asyncToGenerator(function* (file, nodePath, newBasename, addToVCS, onDidConfirm) {
    var directory = file.getParent();
    var newFile = directory.getFile(newBasename);
    var newPath = newFile.getPath();
    var exists = false;
    if (_FileTreeHelpers2['default'].isLocalEntry(file)) {
      exists = yield _nuclideCommons.fsPromise.exists(newPath);
      if (!exists) {
        yield _nuclideCommons.fsPromise.copy(nodePath, newPath);
      }
    } else {
      (0, _assert2['default'])(file.isFile());
      var remoteFile = file;
      var newRemoteFile = newFile;

      var wasCopied = yield remoteFile.copy(newRemoteFile.getLocalPath());
      exists = !wasCopied;
    }
    if (exists) {
      atom.notifications.addError('\'' + newPath + '\' already exists.');
      onDidConfirm(null);
      return;
    }
    var hgRepository = this._getHgRepositoryForPath(newPath);
    if (hgRepository !== null && addToVCS) {
      try {
        yield hgRepository.add(newPath);
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
//# sourceMappingURL=data:application/json;base64,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QWEsRUFBRSxlQUFlO0FBQzlCLGFBQU8sRUFBRTs7OztRQUFrQyxTQUFTOztRQUFjLDZDQUFNO1FBQUMsSUFBSTtPQUFRO0FBQ3JGLGVBQVMsRUFBVCxTQUFTO0FBQ1QsYUFBTyxFQUFFLElBQUksQ0FBQyxZQUFZO0FBQzFCLHVCQUFpQixFQUFqQixpQkFBaUI7S0FDbEIsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsYUFBVyxFQUFBLHFCQUFDLEtBQWEsRUFBUTtBQUMvQixRQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDcEIscUJBQWlCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDbEUsbUJBQWUsR0FBRyx1QkFBUyxNQUFNLENBQy9CLDhFQUF5QixLQUFLLENBQUksRUFDbEMsaUJBQWlCLENBQ2xCLENBQUM7R0FDSDs7QUFFRCxjQUFZLEVBQUEsd0JBQVM7QUFDbkIsUUFBSSxlQUFlLElBQUksSUFBSSxFQUFFO0FBQzNCLDZCQUFTLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDbkQscUJBQWUsR0FBRyxJQUFJLENBQUM7S0FDeEI7QUFDRCxRQUFJLGlCQUFpQixJQUFJLElBQUksRUFBRTtBQUM3Qix1QkFBaUIsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDNUQsdUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzFCO0dBQ0Y7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiRmlsZVN5c3RlbUFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBGaWxlVHJlZU5vZGUgZnJvbSAnLi9GaWxlVHJlZU5vZGUnO1xuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge1xuICBSZW1vdGVEaXJlY3RvcnksXG4gIFJlbW90ZUZpbGUsXG59IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcblxuaW1wb3J0IEZpbGVEaWFsb2dDb21wb25lbnQgZnJvbSAnLi4vY29tcG9uZW50cy9GaWxlRGlhbG9nQ29tcG9uZW50JztcbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFJlbW90ZVVyaSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7RmlsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2ZzUHJvbWlzZX0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS9jb21tb25zJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aE1vZHVsZSBmcm9tICdwYXRoJztcblxubGV0IGRpYWxvZ0NvbXBvbmVudDogP1JlYWN0Q29tcG9uZW50O1xubGV0IGRpYWxvZ0hvc3RFbGVtZW50OiA/SFRNTEVsZW1lbnQ7XG5cbmNvbnN0IEZpbGVTeXN0ZW1BY3Rpb25zID0ge1xuICBvcGVuQWRkRm9sZGVyRGlhbG9nKG9uRGlkQ29uZmlybTogKGZpbGVQYXRoOiA/c3RyaW5nKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9nZXRTZWxlY3RlZENvbnRhaW5lck5vZGUoKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fb3BlbkFkZERpYWxvZyhcbiAgICAgICdmb2xkZXInLFxuICAgICAgbm9kZS5nZXRMb2NhbFBhdGgoKSArICcvJyxcbiAgICAgIGFzeW5jIChmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBzdWJtaXNzaW9uIG9mIGEgYmxhbmsgZmllbGQgZnJvbSBjcmVhdGluZyBhIGRpcmVjdG9yeS5cbiAgICAgICAgaWYgKGZpbGVQYXRoID09PSAnJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGZpbGVQYXRoIGlzIGluIHJvb3RLZXkgYW5kIGlmIG5vdCwgZmluZCB0aGUgcm9vdEtleSBpdCBiZWxvbmdzIHRvLlxuICAgICAgICBjb25zdCBkaXJlY3RvcnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RGlyZWN0b3J5QnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICAgICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge3BhdGhuYW1lfSA9IFJlbW90ZVVyaS5wYXJzZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGJhc2VuYW1lID0gcGF0aE1vZHVsZS5iYXNlbmFtZShwYXRobmFtZSk7XG4gICAgICAgIGNvbnN0IG5ld0RpcmVjdG9yeSA9IGRpcmVjdG9yeS5nZXRTdWJkaXJlY3RvcnkoYmFzZW5hbWUpO1xuICAgICAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgbmV3RGlyZWN0b3J5LmNyZWF0ZSgpO1xuICAgICAgICBpZiAoIWNyZWF0ZWQpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCcke2Jhc2VuYW1lfScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9uRGlkQ29uZmlybShuZXdEaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9LFxuXG4gIG9wZW5BZGRGaWxlRGlhbG9nKG9uRGlkQ29uZmlybTogKGZpbGVQYXRoOiA/c3RyaW5nKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9nZXRTZWxlY3RlZENvbnRhaW5lck5vZGUoKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gdGhpcy5fZ2V0SGdSZXBvc2l0b3J5Rm9yTm9kZShub2RlKTtcbiAgICBjb25zdCBhZGRpdGlvbmFsT3B0aW9ucyA9IHt9O1xuICAgIGlmIChoZ1JlcG9zaXRvcnkgIT09IG51bGwpIHtcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zWydhZGRUb1ZDUyddID0gJ0FkZCB0aGUgbmV3IGZpbGUgdG8gdmVyc2lvbiBjb250cm9sLic7XG4gICAgfVxuICAgIHRoaXMuX29wZW5BZGREaWFsb2coXG4gICAgICAnZmlsZScsXG4gICAgICBub2RlLmdldExvY2FsUGF0aCgpICsgcGF0aE1vZHVsZS5zZXAsXG4gICAgICBhc3luYyAoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczoge2FkZFRvVkNTPzogYm9vbGVhbn0pID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBzdWJtaXNzaW9uIG9mIGEgYmxhbmsgZmllbGQgZnJvbSBjcmVhdGluZyBhIGZpbGUuXG4gICAgICAgIGlmIChmaWxlUGF0aCA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBmaWxlUGF0aCBpcyBpbiByb290S2V5IGFuZCBpZiBub3QsIGZpbmQgdGhlIHJvb3RLZXkgaXQgYmVsb25ncyB0by5cbiAgICAgICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICAgIGlmIChkaXJlY3RvcnkgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBkaXJlY3RvcnkuZ2V0RmlsZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBuZXdGaWxlLmNyZWF0ZSgpO1xuICAgICAgICBpZiAoY3JlYXRlZCkge1xuICAgICAgICAgIGlmIChoZ1JlcG9zaXRvcnkgIT09IG51bGwgJiYgb3B0aW9ucy5hZGRUb1ZDUyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgYXdhaXQgaGdSZXBvc2l0b3J5LmFkZChuZXdGaWxlLmdldFBhdGgoKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGFkZCAnJHtuZXdGaWxlLmdldFBhdGh9JyB0byB2ZXJzaW9uIGNvbnRyb2wuICBFcnJvcjogJHtlLnRvU3RyaW5nKCl9YCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgb25EaWRDb25maXJtKG5ld0ZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCcke2ZpbGVQYXRofScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYWRkaXRpb25hbE9wdGlvbnMsXG4gICAgKTtcbiAgfSxcblxuICBfZ2V0SGdSZXBvc2l0b3J5Rm9yTm9kZShub2RlOiBGaWxlVHJlZU5vZGUpOiA/SGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgICBjb25zdCBlbnRyeSA9IEZpbGVUcmVlSGVscGVycy5nZXRFbnRyeUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgaWYgKGVudHJ5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZ2V0SGdSZXBvc2l0b3J5Rm9yUGF0aChlbnRyeS5nZXRQYXRoKCkpO1xuICB9LFxuXG4gIF9nZXRIZ1JlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiA/SGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZycpIHtcbiAgICAgIHJldHVybiAoKHJlcG9zaXRvcnk6IGFueSk6IEhnUmVwb3NpdG9yeUNsaWVudCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIGFzeW5jIF9vbkNvbmZpcm1SZW5hbWUoXG4gICAgbm9kZTogRmlsZVRyZWVOb2RlLFxuICAgIG5vZGVQYXRoOiBzdHJpbmcsXG4gICAgbmV3QmFzZW5hbWU6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZW50cnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RW50cnlCeUtleShub2RlLm5vZGVLZXkpO1xuICAgIGlmIChlbnRyeSA9PSBudWxsKSB7XG4gICAgICAvLyBUT0RPOiBDb25uZWN0aW9uIGNvdWxkIGhhdmUgYmVlbiBsb3N0IGZvciByZW1vdGUgZmlsZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFVzZSBgcmVzb2x2ZWAgdG8gc3RyaXAgdHJhaWxpbmcgc2xhc2hlcyBiZWNhdXNlIHJlbmFtaW5nIGEgZmlsZSB0byBhIG5hbWUgd2l0aCBhXG4gICAgICogdHJhaWxpbmcgc2xhc2ggaXMgYW4gZXJyb3IuXG4gICAgICovXG4gICAgY29uc3QgbmV3UGF0aCA9IHBhdGhNb2R1bGUucmVzb2x2ZShcbiAgICAgIC8vIFRyaW0gbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSB0byBwcmV2ZW50IGJhZCBmaWxlbmFtZXMuXG4gICAgICBwYXRoTW9kdWxlLmpvaW4ocGF0aE1vZHVsZS5kaXJuYW1lKG5vZGVQYXRoKSwgbmV3QmFzZW5hbWUudHJpbSgpKVxuICAgICk7XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gdGhpcy5fZ2V0SGdSZXBvc2l0b3J5Rm9yTm9kZShub2RlKTtcbiAgICBsZXQgc2hvdWxkRlNSZW5hbWUgPSB0cnVlO1xuICAgIGlmIChoZ1JlcG9zaXRvcnkgIT09IG51bGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNob3VsZEZTUmVuYW1lID0gZmFsc2U7XG4gICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5yZW5hbWUoZW50cnkuZ2V0UGF0aCgpLCBuZXdQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICdgaGcgcmVuYW1lYCBmYWlsZWQsIHdpbGwgdHJ5IHRvIG1vdmUgdGhlIGZpbGUgaWdub3JpbmcgdmVyc2lvbiBjb250cm9sIGluc3RlYWQuICAnICtcbiAgICAgICAgICAnRXJyb3I6ICcgKyBlLnRvU3RyaW5nKCksXG4gICAgICAgICk7XG4gICAgICAgIHNob3VsZEZTUmVuYW1lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNob3VsZEZTUmVuYW1lKSB7XG4gICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxFbnRyeShlbnRyeSkpIHtcbiAgICAgICAgYXdhaXQgZnNQcm9taXNlLnJlbmFtZShub2RlUGF0aCwgbmV3UGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCAoKGVudHJ5OiBhbnkpOiAoUmVtb3RlRGlyZWN0b3J5IHwgUmVtb3RlRmlsZSkpLnJlbmFtZShuZXdQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXN5bmMgX29uQ29uZmlybUR1cGxpY2F0ZShcbiAgICBmaWxlOiBGaWxlIHwgUmVtb3RlRmlsZSxcbiAgICBub2RlUGF0aDogc3RyaW5nLFxuICAgIG5ld0Jhc2VuYW1lOiBzdHJpbmcsXG4gICAgYWRkVG9WQ1M6IGJvb2xlYW4sXG4gICAgb25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBkaXJlY3RvcnkgPSBmaWxlLmdldFBhcmVudCgpO1xuICAgIGNvbnN0IG5ld0ZpbGUgPSBkaXJlY3RvcnkuZ2V0RmlsZShuZXdCYXNlbmFtZSk7XG4gICAgY29uc3QgbmV3UGF0aCA9IG5ld0ZpbGUuZ2V0UGF0aCgpO1xuICAgIGxldCBleGlzdHMgPSBmYWxzZTtcbiAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxFbnRyeShmaWxlKSkge1xuICAgICAgZXhpc3RzID0gYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhuZXdQYXRoKTtcbiAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgIGF3YWl0IGZzUHJvbWlzZS5jb3B5KG5vZGVQYXRoLCBuZXdQYXRoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaW52YXJpYW50KGZpbGUuaXNGaWxlKCkpO1xuICAgICAgY29uc3QgcmVtb3RlRmlsZSA9ICgoZmlsZTogYW55KTogUmVtb3RlRmlsZSk7XG4gICAgICBjb25zdCBuZXdSZW1vdGVGaWxlID0gKChuZXdGaWxlOiBhbnkpOiBSZW1vdGVGaWxlKTtcblxuICAgICAgY29uc3Qgd2FzQ29waWVkID0gYXdhaXQgcmVtb3RlRmlsZS5jb3B5KG5ld1JlbW90ZUZpbGUuZ2V0TG9jYWxQYXRoKCkpO1xuICAgICAgZXhpc3RzID0gIXdhc0NvcGllZDtcbiAgICB9XG4gICAgaWYgKGV4aXN0cykge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtuZXdQYXRofScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICBvbkRpZENvbmZpcm0obnVsbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9IHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvclBhdGgobmV3UGF0aCk7XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCAmJiBhZGRUb1ZDUykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgaGdSZXBvc2l0b3J5LmFkZChuZXdQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IG5ld1BhdGggKyAnIHdhcyBkdXBsaWNhdGVkLCBidXQgdGhlcmUgd2FzIGFuIGVycm9yIGFkZGluZyBpdCB0byAnICtcbiAgICAgICAgICAndmVyc2lvbiBjb250cm9sLiAgRXJyb3I6ICcgKyBlLnRvU3RyaW5nKCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvbkRpZENvbmZpcm0obmV3UGF0aCk7XG4gICAgfVxuICB9LFxuXG4gIG9wZW5SZW5hbWVEaWFsb2coKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSByZW5hbWUgb25lIGVudHJ5IGF0IGEgdGltZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGNvbnN0IG5vZGVQYXRoID0gbm9kZS5nZXRMb2NhbFBhdGgoKTtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogcGF0aE1vZHVsZS5iYXNlbmFtZShub2RlUGF0aCksXG4gICAgICBtZXNzYWdlOiBub2RlLmlzQ29udGFpbmVyXG4gICAgICAgID8gPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZGlyZWN0b3J5Ljwvc3Bhbj5cbiAgICAgICAgOiA8c3Bhbj5FbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBmaWxlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpID0+IHtcbiAgICAgICAgdGhpcy5fb25Db25maXJtUmVuYW1lKG5vZGUsIG5vZGVQYXRoLCBuZXdCYXNlbmFtZSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgUmVuYW1lIHRvICR7bmV3QmFzZW5hbWV9IGZhaWxlZGApO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIHNlbGVjdEJhc2VuYW1lOiB0cnVlLFxuICAgIH0pO1xuICB9LFxuXG4gIG9wZW5EdXBsaWNhdGVEaWFsb2cob25EaWRDb25maXJtOiAoZmlsZVBhdGg6ID9zdHJpbmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplICE9PSAxKSB7XG4gICAgICAvLyBDYW4gb25seSBjb3B5IG9uZSBlbnRyeSBhdCBhIHRpbWUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBjb25zdCBub2RlUGF0aCA9IG5vZGUuZ2V0TG9jYWxQYXRoKCk7XG4gICAgbGV0IGluaXRpYWxWYWx1ZSA9IHBhdGhNb2R1bGUuYmFzZW5hbWUobm9kZVBhdGgpO1xuICAgIGNvbnN0IGV4dCA9IHBhdGhNb2R1bGUuZXh0bmFtZShub2RlUGF0aCk7XG4gICAgaW5pdGlhbFZhbHVlID0gaW5pdGlhbFZhbHVlLnN1YnN0cigwLCBpbml0aWFsVmFsdWUubGVuZ3RoIC0gZXh0Lmxlbmd0aCkgKyAnLWNvcHknICsgZXh0O1xuICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9IHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvck5vZGUobm9kZSk7XG4gICAgY29uc3QgYWRkaXRpb25hbE9wdGlvbnMgPSB7fTtcbiAgICBpZiAoaGdSZXBvc2l0b3J5ICE9PSBudWxsKSB7XG4gICAgICBhZGRpdGlvbmFsT3B0aW9uc1snYWRkVG9WQ1MnXSA9ICdBZGQgdGhlIG5ldyBmaWxlIHRvIHZlcnNpb24gY29udHJvbC4nO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogaW5pdGlhbFZhbHVlLFxuICAgICAgbWVzc2FnZTogPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZHVwbGljYXRlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nLCBvcHRpb25zOiB7YWRkVG9WQ1M/OiBib29sZWFufSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gRmlsZVRyZWVIZWxwZXJzLmdldEZpbGVCeUtleShub2RlLm5vZGVLZXkpO1xuICAgICAgICBpZiAoZmlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgLy8gVE9ETzogQ29ubmVjdGlvbiBjb3VsZCBoYXZlIGJlZW4gbG9zdCBmb3IgcmVtb3RlIGZpbGUuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29uQ29uZmlybUR1cGxpY2F0ZShcbiAgICAgICAgICBmaWxlLFxuICAgICAgICAgIG5vZGVQYXRoLFxuICAgICAgICAgIG5ld0Jhc2VuYW1lLnRyaW0oKSxcbiAgICAgICAgICAhIW9wdGlvbnMuYWRkVG9WQ1MsXG4gICAgICAgICAgb25EaWRDb25maXJtLFxuICAgICAgICApLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYEZhaWxlZCB0byBkdXBsaWNhdGUgJ3tmaWxlLmdldFBhdGgoKX0nYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMuX2Nsb3NlRGlhbG9nLFxuICAgICAgc2VsZWN0QmFzZW5hbWU6IHRydWUsXG4gICAgICBhZGRpdGlvbmFsT3B0aW9ucyxcbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHN0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIC8qXG4gICAgICogVE9ETzogQ2hvb3NpbmcgdGhlIGxhc3Qgc2VsZWN0ZWQga2V5IGlzIGluZXhhY3Qgd2hlbiB0aGVyZSBpcyBtb3JlIHRoYW4gMSByb290LiBUaGUgU2V0IG9mXG4gICAgICogc2VsZWN0ZWQga2V5cyBzaG91bGQgYmUgbWFpbnRhaW5lZCBhcyBhIGZsYXQgbGlzdCBhY3Jvc3MgYWxsIHJvb3RzIHRvIG1haW50YWluIGluc2VydGlvblxuICAgICAqIG9yZGVyLlxuICAgICAqL1xuICAgIGNvbnN0IG5vZGVLZXkgPSBzdG9yZS5nZXRTZWxlY3RlZEtleXMoKS5sYXN0KCk7XG4gICAgaWYgKG5vZGVLZXkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJvb3RLZXkgPSBzdG9yZS5nZXRSb290Rm9yS2V5KG5vZGVLZXkpO1xuICAgIGlmIChyb290S2V5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gc3RvcmUuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICByZXR1cm4gbm9kZS5pc0NvbnRhaW5lciA/IG5vZGUgOiBub2RlLmdldFBhcmVudE5vZGUoKTtcbiAgfSxcblxuICBfb3BlbkFkZERpYWxvZyhcbiAgICBlbnRyeVR5cGU6IHN0cmluZyxcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgb25Db25maXJtOiAoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KSA9PiBtaXhlZCxcbiAgICBhZGRpdGlvbmFsT3B0aW9ucz86IE9iamVjdCA9IHt9LFxuICApIHtcbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWZpbGUtYWRkJyxcbiAgICAgIG1lc3NhZ2U6IDxzcGFuPkVudGVyIHRoZSBwYXRoIGZvciB0aGUgbmV3IHtlbnRyeVR5cGV9IGluIHRoZSByb290OjxiciAvPntwYXRofTwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm0sXG4gICAgICBvbkNsb3NlOiB0aGlzLl9jbG9zZURpYWxvZyxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zLFxuICAgIH0pO1xuICB9LFxuXG4gIF9vcGVuRGlhbG9nKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9jbG9zZURpYWxvZygpO1xuICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZChkaWFsb2dIb3N0RWxlbWVudCk7XG4gICAgZGlhbG9nQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPEZpbGVEaWFsb2dDb21wb25lbnQgey4uLnByb3BzfSAvPixcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50XG4gICAgKTtcbiAgfSxcblxuICBfY2xvc2VEaWFsb2coKTogdm9pZCB7XG4gICAgaWYgKGRpYWxvZ0NvbXBvbmVudCAhPSBudWxsKSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0NvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmIChkaWFsb2dIb3N0RWxlbWVudCAhPSBudWxsKSB7XG4gICAgICBkaWFsb2dIb3N0RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW1BY3Rpb25zO1xuIl19