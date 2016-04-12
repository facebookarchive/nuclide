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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVTeXN0ZW1BY3Rpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs2Q0FlZ0MsbUNBQW1DOzs7OytCQUN2QyxtQkFBbUI7Ozs7NkJBQ25CLGlCQUFpQjs7NEJBSXRDLGdCQUFnQjs7Z0NBQ1UsMEJBQTBCOzs7O29CQUN4QyxNQUFNOzs2QkFDc0Isc0JBQXNCOztrQ0FDckMsNkJBQTZCOztxREFDOUIsbURBQW1EOztvQkFFM0QsTUFBTTs7OztBQUU3QixJQUFJLGVBQWdDLFlBQUEsQ0FBQztBQUNyQyxJQUFJLGlCQUErQixZQUFBLENBQUM7O0FBRXBDLElBQU0sd0JBQXdCLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FDdkMsd0RBQWlCLEtBQUssRUFDdEIsd0RBQWlCLEtBQUssRUFDdEIsd0RBQWlCLFFBQVEsQ0FDMUIsQ0FBQyxDQUFDOztBQUVILElBQU0saUJBQWlCLEdBQUc7QUFDeEIscUJBQW1CLEVBQUEsNkJBQUMsWUFBMEMsRUFBUTtBQUNwRSxRQUFNLElBQUksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsYUFBTztLQUNSO0FBQ0QsUUFBSSxDQUFDLGNBQWMsQ0FDakIsUUFBUSxFQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxvQkFDcEIsV0FBTyxRQUFRLEVBQVUsT0FBTyxFQUFhOztBQUUzQyxVQUFJLFFBQVEsS0FBSyxFQUFFLEVBQUU7QUFDbkIsZUFBTztPQUNSOzs7QUFHRCxVQUFNLFNBQVMsR0FBRyw2QkFBZ0IsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlELFVBQUksU0FBUyxJQUFJLElBQUksRUFBRTtBQUNyQixlQUFPO09BQ1I7OzZCQUVrQiw4QkFBVSxLQUFLLENBQUMsUUFBUSxDQUFDOztVQUFyQyxRQUFRLG9CQUFSLFFBQVE7O0FBQ2YsVUFBTSxRQUFRLEdBQUcsa0JBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLFVBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekQsVUFBTSxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDNUMsVUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxRQUFLLFFBQVEsd0JBQW9CLENBQUM7QUFDN0Qsb0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNwQixNQUFNO0FBQ0wsb0JBQVksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztPQUN0QztLQUNGLEVBQ0YsQ0FBQztHQUNIOztBQUVELG1CQUFpQixFQUFBLDJCQUFDLFlBQTBDLEVBQVE7QUFDbEUsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLElBQUksRUFBRTtBQUNULGFBQU87S0FDUjtBQUNELFFBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4RCxRQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7QUFDekIsdUJBQWlCLENBQUMsVUFBVSxDQUFDLEdBQUcsc0NBQXNDLENBQUM7S0FDeEU7QUFDRCxRQUFJLENBQUMsY0FBYyxDQUNqQixNQUFNLEVBQ04sSUFBSSxDQUFDLFNBQVMsR0FBRyxrQkFBVyxHQUFHLG9CQUMvQixXQUFPLFFBQVEsRUFBVSxPQUFPLEVBQTJCOztBQUV6RCxVQUFJLFFBQVEsS0FBSyxFQUFFLEVBQUU7QUFDbkIsZUFBTztPQUNSOzs7QUFHRCxVQUFNLFNBQVMsR0FBRyw2QkFBZ0IsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlELFVBQUksU0FBUyxJQUFJLElBQUksRUFBRTtBQUNyQixlQUFPO09BQ1I7O0FBRUQsVUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QyxVQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN2QyxVQUFJLE9BQU8sRUFBRTtBQUNYLFlBQUksWUFBWSxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtBQUN0RCxjQUFJO0FBQ0Ysa0JBQU0sWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7V0FDN0MsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGdCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsc0JBQ1AsT0FBTyxDQUFDLE9BQU8sdUNBQWlDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDL0UsQ0FBQztXQUNIO1NBQ0Y7QUFDRCxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO09BQ2pDLE1BQU07QUFDTCxZQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsUUFBSyxRQUFRLHdCQUFvQixDQUFDO0FBQzdELG9CQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDcEI7S0FDRixHQUNELGlCQUFpQixDQUNsQixDQUFDO0dBQ0g7O0FBRUQseUJBQXVCLEVBQUEsaUNBQUMsSUFBa0IsRUFBdUI7QUFDL0QsUUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM3QixRQUFJLFVBQVUsSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksRUFBRTtBQUN2RCxhQUFTLFVBQVUsQ0FBNEI7S0FDaEQ7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELHlCQUF1QixFQUFBLGlDQUFDLFFBQWdCLEVBQXVCO0FBQzdELFFBQU0sVUFBVSxHQUFHLDJDQUFrQixRQUFRLENBQUMsQ0FBQztBQUMvQyxRQUFJLFVBQVUsSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksRUFBRTtBQUN2RCxhQUFTLFVBQVUsQ0FBNEI7S0FDaEQ7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELEFBQU0sa0JBQWdCLG9CQUFBLFdBQ3BCLElBQWtCLEVBQ2xCLFFBQWdCLEVBQ2hCLFdBQW1CLEVBQ0o7QUFDZixRQUFNLEtBQUssR0FBRyw2QkFBZ0IsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0RCxRQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7O0FBRWpCLGFBQU87S0FDUjs7Ozs7O0FBTUQsUUFBTSxPQUFPLEdBQUcsa0JBQVcsT0FBTzs7QUFFaEMsc0JBQVcsSUFBSSxDQUFDLGtCQUFXLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FDbEUsQ0FBQztBQUNGLFFBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4RCxRQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO0FBQ3pCLFVBQUk7QUFDRixzQkFBYyxHQUFHLEtBQUssQ0FBQztBQUN2QixjQUFNLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ3JELENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixZQUFNLFNBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakMsWUFBTSxRQUFRLEdBQUcsTUFBTSxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUSxDQUFDLENBQUMsQ0FBQztBQUM1RCxZQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVEsQ0FBQyxDQUFDO0FBQzFDLFlBQUksd0JBQXdCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzVDLGNBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUN6QixtRkFBbUYsR0FDbkYsU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDekIsQ0FBQztTQUNIO0FBQ0Qsc0JBQWMsR0FBRyxJQUFJLENBQUM7T0FDdkI7S0FDRjtBQUNELFFBQUksY0FBYyxFQUFFO0FBQ2xCLFVBQU0sT0FBTyxHQUFHLHFEQUFpQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNsRSxZQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsK0JBQVEsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDekQ7R0FDRixDQUFBOztBQUVELEFBQU0scUJBQW1CLG9CQUFBLFdBQ3ZCLElBQXVCLEVBQ3ZCLFFBQWdCLEVBQ2hCLFdBQW1CLEVBQ25CLFFBQWlCLEVBQ2pCLFlBQTBDLEVBQzNCO0FBQ2YsUUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ25DLFFBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0MsUUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLFFBQU0sT0FBTyxHQUFHLHFEQUFpQyxPQUFPLENBQUMsQ0FBQztBQUMxRCxRQUFNLE1BQU0sR0FBRyxFQUFFLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsK0JBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUM7QUFDakUsUUFBSSxNQUFNLEVBQUU7QUFDVixVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsUUFBSyxPQUFPLHdCQUFvQixDQUFDO0FBQzVELGtCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsYUFBTztLQUNSO0FBQ0QsUUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNELFFBQUksWUFBWSxLQUFLLElBQUksSUFBSSxRQUFRLEVBQUU7QUFDckMsVUFBSTtBQUNGLGNBQU0sWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7T0FDbkMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFlBQU0sT0FBTyxHQUFHLE9BQU8sR0FBRyx1REFBdUQsR0FDL0UsMkJBQTJCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzdDLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JDLG9CQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsZUFBTztPQUNSO0FBQ0Qsa0JBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN2QjtHQUNGLENBQUE7O0FBRUQsa0JBQWdCLEVBQUEsNEJBQVM7OztBQUN2QixRQUFNLEtBQUssR0FBRyw2QkFBYyxXQUFXLEVBQUUsQ0FBQztBQUMxQyxRQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUMvQyxRQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFOztBQUU1QixhQUFPO0tBQ1I7O0FBRUQsUUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ25DLFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDaEMsUUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNmLG1CQUFhLEVBQUUsa0JBQWtCO0FBQ2pDLGtCQUFZLEVBQUUsa0JBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQztBQUMzQyxhQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsR0FDckI7Ozs7T0FBa0QsR0FDbEQ7Ozs7T0FBNkM7QUFDakQsZUFBUyxFQUFFLG1CQUFDLFdBQVcsRUFBVSxPQUFPLEVBQWE7QUFDbkQsY0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxTQUFNLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDaEUsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLGdCQUFjLFdBQVcsYUFBVSxDQUFDO1NBQ2hFLENBQUMsQ0FBQztPQUNKO0FBQ0QsYUFBTyxFQUFFLElBQUksQ0FBQyxZQUFZO0FBQzFCLG9CQUFjLEVBQUUsSUFBSTtLQUNyQixDQUFDLENBQUM7R0FDSjs7QUFFRCxxQkFBbUIsRUFBQSw2QkFBQyxZQUEwQyxFQUFROzs7QUFDcEUsUUFBTSxLQUFLLEdBQUcsNkJBQWMsV0FBVyxFQUFFLENBQUM7QUFDMUMsUUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDL0MsUUFBSSxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTs7QUFFNUIsYUFBTztLQUNSOztBQUVELFFBQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQyxRQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ2hDLFFBQUksWUFBWSxHQUFHLGtCQUFXLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqRCxRQUFNLEdBQUcsR0FBRyxrQkFBVyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsZ0JBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ3hGLFFBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4RCxRQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7QUFDekIsdUJBQWlCLENBQUMsVUFBVSxDQUFDLEdBQUcsc0NBQXNDLENBQUM7S0FDeEU7QUFDRCxRQUFJLENBQUMsV0FBVyxDQUFDO0FBQ2YsbUJBQWEsRUFBRSxrQkFBa0I7QUFDakMsa0JBQVksRUFBRSxZQUFZO0FBQzFCLGFBQU8sRUFBRTs7OztPQUFrRDtBQUMzRCxlQUFTLEVBQUUsbUJBQUMsV0FBVyxFQUFVLE9BQU8sRUFBMkI7QUFDakUsWUFBTSxJQUFJLEdBQUcsNkJBQWdCLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEQsWUFBSSxJQUFJLElBQUksSUFBSSxFQUFFOztBQUVoQixpQkFBTztTQUNSO0FBQ0QsZUFBSyxtQkFBbUIsQ0FDdEIsSUFBSSxFQUNKLFFBQVEsRUFDUixXQUFXLENBQUMsSUFBSSxFQUFFLEVBQ2xCLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUNsQixZQUFZLENBQ2IsU0FBTSxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQ2YsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLDRDQUEwQyxDQUFDO1NBQ3ZFLENBQUMsQ0FBQztPQUNKO0FBQ0QsYUFBTyxFQUFFLElBQUksQ0FBQyxZQUFZO0FBQzFCLG9CQUFjLEVBQUUsSUFBSTtBQUNwQix1QkFBaUIsRUFBakIsaUJBQWlCO0tBQ2xCLENBQUMsQ0FBQztHQUNKOztBQUVELDJCQUF5QixFQUFBLHFDQUFrQjtBQUN6QyxRQUFNLEtBQUssR0FBRyw2QkFBYyxXQUFXLEVBQUUsQ0FBQzs7Ozs7O0FBTTFDLFFBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzlDLFdBQU8sSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztHQUM5Qzs7QUFFRCxnQkFBYyxFQUFBLHdCQUNaLFNBQWlCLEVBQ2pCLElBQVksRUFDWixTQUF1RCxFQUV2RDtRQURBLGlCQUEwQix5REFBRyxFQUFFOztBQUUvQixRQUFJLENBQUMsV0FBVyxDQUFDO0FBQ2YsbUJBQWEsRUFBRSxlQUFlO0FBQzlCLGFBQU8sRUFBRTs7OztRQUFrQyxTQUFTOztRQUFjLDZDQUFNO1FBQUMsSUFBSTtPQUFRO0FBQ3JGLGVBQVMsRUFBVCxTQUFTO0FBQ1QsYUFBTyxFQUFFLElBQUksQ0FBQyxZQUFZO0FBQzFCLHVCQUFpQixFQUFqQixpQkFBaUI7S0FDbEIsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsYUFBVyxFQUFBLHFCQUFDLEtBQWEsRUFBUTtBQUMvQixRQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDcEIscUJBQWlCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDbEUsbUJBQWUsR0FBRyx1QkFBUyxNQUFNLENBQy9CLDhFQUF5QixLQUFLLENBQUksRUFDbEMsaUJBQWlCLENBQ2xCLENBQUM7R0FDSDs7QUFFRCxjQUFZLEVBQUEsd0JBQVM7QUFDbkIsUUFBSSxlQUFlLElBQUksSUFBSSxFQUFFO0FBQzNCLDZCQUFTLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDbkQscUJBQWUsR0FBRyxJQUFJLENBQUM7S0FDeEI7QUFDRCxRQUFJLGlCQUFpQixJQUFJLElBQUksRUFBRTtBQUM3Qix1QkFBaUIsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDNUQsdUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzFCO0dBQ0Y7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiRmlsZVN5c3RlbUFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RmlsZVRyZWVOb2RlfSBmcm9tICcuL0ZpbGVUcmVlTm9kZSc7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtSZW1vdGVGaWxlfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuaW1wb3J0IEZpbGVEaWFsb2dDb21wb25lbnQgZnJvbSAnLi4vY29tcG9uZW50cy9GaWxlRGlhbG9nQ29tcG9uZW50JztcbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IHtGaWxlVHJlZVN0b3JlfSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVtb3RlVXJpLCB7Z2V0UGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7RmlsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHtTdGF0dXNDb2RlTnVtYmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHBhdGhNb2R1bGUgZnJvbSAncGF0aCc7XG5cbmxldCBkaWFsb2dDb21wb25lbnQ6ID9SZWFjdENvbXBvbmVudDtcbmxldCBkaWFsb2dIb3N0RWxlbWVudDogP0hUTUxFbGVtZW50O1xuXG5jb25zdCBsZWdhbFN0YXR1c0NvZGVGb3JSZW5hbWUgPSBuZXcgU2V0KFtcbiAgU3RhdHVzQ29kZU51bWJlci5BRERFRCxcbiAgU3RhdHVzQ29kZU51bWJlci5DTEVBTixcbiAgU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRCxcbl0pO1xuXG5jb25zdCBGaWxlU3lzdGVtQWN0aW9ucyA9IHtcbiAgb3BlbkFkZEZvbGRlckRpYWxvZyhvbkRpZENvbmZpcm06IChmaWxlUGF0aDogP3N0cmluZykgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX29wZW5BZGREaWFsb2coXG4gICAgICAnZm9sZGVyJyxcbiAgICAgIG5vZGUubG9jYWxQYXRoICsgJy8nLFxuICAgICAgYXN5bmMgKGZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IE9iamVjdCkgPT4ge1xuICAgICAgICAvLyBQcmV2ZW50IHN1Ym1pc3Npb24gb2YgYSBibGFuayBmaWVsZCBmcm9tIGNyZWF0aW5nIGEgZGlyZWN0b3J5LlxuICAgICAgICBpZiAoZmlsZVBhdGggPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgZmlsZVBhdGggaXMgaW4gcm9vdEtleSBhbmQgaWYgbm90LCBmaW5kIHRoZSByb290S2V5IGl0IGJlbG9uZ3MgdG8uXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5nZXREaXJlY3RvcnlCeUtleShub2RlLnVyaSk7XG4gICAgICAgIGlmIChkaXJlY3RvcnkgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHtwYXRobmFtZX0gPSBSZW1vdGVVcmkucGFyc2UoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGhNb2R1bGUuYmFzZW5hbWUocGF0aG5hbWUpO1xuICAgICAgICBjb25zdCBuZXdEaXJlY3RvcnkgPSBkaXJlY3RvcnkuZ2V0U3ViZGlyZWN0b3J5KGJhc2VuYW1lKTtcbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IG5ld0RpcmVjdG9yeS5jcmVhdGUoKTtcbiAgICAgICAgaWYgKCFjcmVhdGVkKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAnJHtiYXNlbmFtZX0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICAgIG9uRGlkQ29uZmlybShudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvbkRpZENvbmZpcm0obmV3RGlyZWN0b3J5LmdldFBhdGgoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfSxcblxuICBvcGVuQWRkRmlsZURpYWxvZyhvbkRpZENvbmZpcm06IChmaWxlUGF0aDogP3N0cmluZykgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fZ2V0U2VsZWN0ZWRDb250YWluZXJOb2RlKCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9IHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvck5vZGUobm9kZSk7XG4gICAgY29uc3QgYWRkaXRpb25hbE9wdGlvbnMgPSB7fTtcbiAgICBpZiAoaGdSZXBvc2l0b3J5ICE9PSBudWxsKSB7XG4gICAgICBhZGRpdGlvbmFsT3B0aW9uc1snYWRkVG9WQ1MnXSA9ICdBZGQgdGhlIG5ldyBmaWxlIHRvIHZlcnNpb24gY29udHJvbC4nO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuQWRkRGlhbG9nKFxuICAgICAgJ2ZpbGUnLFxuICAgICAgbm9kZS5sb2NhbFBhdGggKyBwYXRoTW9kdWxlLnNlcCxcbiAgICAgIGFzeW5jIChmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiB7YWRkVG9WQ1M/OiBib29sZWFufSkgPT4ge1xuICAgICAgICAvLyBQcmV2ZW50IHN1Ym1pc3Npb24gb2YgYSBibGFuayBmaWVsZCBmcm9tIGNyZWF0aW5nIGEgZmlsZS5cbiAgICAgICAgaWYgKGZpbGVQYXRoID09PSAnJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGZpbGVQYXRoIGlzIGluIHJvb3RLZXkgYW5kIGlmIG5vdCwgZmluZCB0aGUgcm9vdEtleSBpdCBiZWxvbmdzIHRvLlxuICAgICAgICBjb25zdCBkaXJlY3RvcnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RGlyZWN0b3J5QnlLZXkobm9kZS51cmkpO1xuICAgICAgICBpZiAoZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXdGaWxlID0gZGlyZWN0b3J5LmdldEZpbGUoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgbmV3RmlsZS5jcmVhdGUoKTtcbiAgICAgICAgaWYgKGNyZWF0ZWQpIHtcbiAgICAgICAgICBpZiAoaGdSZXBvc2l0b3J5ICE9PSBudWxsICYmIG9wdGlvbnMuYWRkVG9WQ1MgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5hZGQoW25ld0ZpbGUuZ2V0UGF0aCgpXSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGFkZCAnJHtuZXdGaWxlLmdldFBhdGh9JyB0byB2ZXJzaW9uIGNvbnRyb2wuICBFcnJvcjogJHtlLnRvU3RyaW5nKCl9YCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgb25EaWRDb25maXJtKG5ld0ZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCcke2ZpbGVQYXRofScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICAgICAgb25EaWRDb25maXJtKG51bGwpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYWRkaXRpb25hbE9wdGlvbnMsXG4gICAgKTtcbiAgfSxcblxuICBfZ2V0SGdSZXBvc2l0b3J5Rm9yTm9kZShub2RlOiBGaWxlVHJlZU5vZGUpOiA/SGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgICBjb25zdCByZXBvc2l0b3J5ID0gbm9kZS5yZXBvO1xuICAgIGlmIChyZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZycpIHtcbiAgICAgIHJldHVybiAoKHJlcG9zaXRvcnk6IGFueSk6IEhnUmVwb3NpdG9yeUNsaWVudCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIF9nZXRIZ1JlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiA/SGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZycpIHtcbiAgICAgIHJldHVybiAoKHJlcG9zaXRvcnk6IGFueSk6IEhnUmVwb3NpdG9yeUNsaWVudCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIGFzeW5jIF9vbkNvbmZpcm1SZW5hbWUoXG4gICAgbm9kZTogRmlsZVRyZWVOb2RlLFxuICAgIG5vZGVQYXRoOiBzdHJpbmcsXG4gICAgbmV3QmFzZW5hbWU6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZW50cnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RW50cnlCeUtleShub2RlLnVyaSk7XG4gICAgaWYgKGVudHJ5ID09IG51bGwpIHtcbiAgICAgIC8vIFRPRE86IENvbm5lY3Rpb24gY291bGQgaGF2ZSBiZWVuIGxvc3QgZm9yIHJlbW90ZSBmaWxlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVXNlIGByZXNvbHZlYCB0byBzdHJpcCB0cmFpbGluZyBzbGFzaGVzIGJlY2F1c2UgcmVuYW1pbmcgYSBmaWxlIHRvIGEgbmFtZSB3aXRoIGFcbiAgICAgKiB0cmFpbGluZyBzbGFzaCBpcyBhbiBlcnJvci5cbiAgICAgKi9cbiAgICBjb25zdCBuZXdQYXRoID0gcGF0aE1vZHVsZS5yZXNvbHZlKFxuICAgICAgLy8gVHJpbSBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlIHRvIHByZXZlbnQgYmFkIGZpbGVuYW1lcy5cbiAgICAgIHBhdGhNb2R1bGUuam9pbihwYXRoTW9kdWxlLmRpcm5hbWUobm9kZVBhdGgpLCBuZXdCYXNlbmFtZS50cmltKCkpXG4gICAgKTtcbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSB0aGlzLl9nZXRIZ1JlcG9zaXRvcnlGb3JOb2RlKG5vZGUpO1xuICAgIGxldCBzaG91bGRGU1JlbmFtZSA9IHRydWU7XG4gICAgaWYgKGhnUmVwb3NpdG9yeSAhPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2hvdWxkRlNSZW5hbWUgPSBmYWxzZTtcbiAgICAgICAgYXdhaXQgaGdSZXBvc2l0b3J5LnJlbmFtZShlbnRyeS5nZXRQYXRoKCksIG5ld1BhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGVudHJ5LmdldFBhdGgoKTtcbiAgICAgICAgY29uc3Qgc3RhdHVzZXMgPSBhd2FpdCBoZ1JlcG9zaXRvcnkuZ2V0U3RhdHVzZXMoW2ZpbGVQYXRoXSk7XG4gICAgICAgIGNvbnN0IHBhdGhTdGF0dXMgPSBzdGF0dXNlcy5nZXQoZmlsZVBhdGgpO1xuICAgICAgICBpZiAobGVnYWxTdGF0dXNDb2RlRm9yUmVuYW1lLmhhcyhwYXRoU3RhdHVzKSkge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICdgaGcgcmVuYW1lYCBmYWlsZWQsIHdpbGwgdHJ5IHRvIG1vdmUgdGhlIGZpbGUgaWdub3JpbmcgdmVyc2lvbiBjb250cm9sIGluc3RlYWQuICAnICtcbiAgICAgICAgICAgICdFcnJvcjogJyArIGUudG9TdHJpbmcoKSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHNob3VsZEZTUmVuYW1lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNob3VsZEZTUmVuYW1lKSB7XG4gICAgICBjb25zdCBzZXJ2aWNlID0gZ2V0RmlsZVN5c3RlbVNlcnZpY2VCeU51Y2xpZGVVcmkoZW50cnkuZ2V0UGF0aCgpKTtcbiAgICAgIGF3YWl0IHNlcnZpY2UucmVuYW1lKGdldFBhdGgoZW50cnkuZ2V0UGF0aCgpKSwgbmV3UGF0aCk7XG4gICAgfVxuICB9LFxuXG4gIGFzeW5jIF9vbkNvbmZpcm1EdXBsaWNhdGUoXG4gICAgZmlsZTogRmlsZSB8IFJlbW90ZUZpbGUsXG4gICAgbm9kZVBhdGg6IHN0cmluZyxcbiAgICBuZXdCYXNlbmFtZTogc3RyaW5nLFxuICAgIGFkZFRvVkNTOiBib29sZWFuLFxuICAgIG9uRGlkQ29uZmlybTogKGZpbGVQYXRoOiA/c3RyaW5nKSA9PiBtaXhlZCxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZGlyZWN0b3J5ID0gZmlsZS5nZXRQYXJlbnQoKTtcbiAgICBjb25zdCBuZXdGaWxlID0gZGlyZWN0b3J5LmdldEZpbGUobmV3QmFzZW5hbWUpO1xuICAgIGNvbnN0IG5ld1BhdGggPSBuZXdGaWxlLmdldFBhdGgoKTtcbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0RmlsZVN5c3RlbVNlcnZpY2VCeU51Y2xpZGVVcmkobmV3UGF0aCk7XG4gICAgY29uc3QgZXhpc3RzID0gIShhd2FpdCBzZXJ2aWNlLmNvcHkobm9kZVBhdGgsIGdldFBhdGgobmV3UGF0aCkpKTtcbiAgICBpZiAoZXhpc3RzKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCcke25ld1BhdGh9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgIG9uRGlkQ29uZmlybShudWxsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gdGhpcy5fZ2V0SGdSZXBvc2l0b3J5Rm9yUGF0aChuZXdQYXRoKTtcbiAgICBpZiAoaGdSZXBvc2l0b3J5ICE9PSBudWxsICYmIGFkZFRvVkNTKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBoZ1JlcG9zaXRvcnkuYWRkKFtuZXdQYXRoXSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBuZXdQYXRoICsgJyB3YXMgZHVwbGljYXRlZCwgYnV0IHRoZXJlIHdhcyBhbiBlcnJvciBhZGRpbmcgaXQgdG8gJyArXG4gICAgICAgICAgJ3ZlcnNpb24gY29udHJvbC4gIEVycm9yOiAnICsgZS50b1N0cmluZygpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIG9uRGlkQ29uZmlybShudWxsKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgb25EaWRDb25maXJtKG5ld1BhdGgpO1xuICAgIH1cbiAgfSxcblxuICBvcGVuUmVuYW1lRGlhbG9nKCk6IHZvaWQge1xuICAgIGNvbnN0IHN0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBzdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuc2l6ZSAhPT0gMSkge1xuICAgICAgLy8gQ2FuIG9ubHkgcmVuYW1lIG9uZSBlbnRyeSBhdCBhIHRpbWUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBjb25zdCBub2RlUGF0aCA9IG5vZGUubG9jYWxQYXRoO1xuICAgIHRoaXMuX29wZW5EaWFsb2coe1xuICAgICAgaWNvbkNsYXNzTmFtZTogJ2ljb24tYXJyb3ctcmlnaHQnLFxuICAgICAgaW5pdGlhbFZhbHVlOiBwYXRoTW9kdWxlLmJhc2VuYW1lKG5vZGVQYXRoKSxcbiAgICAgIG1lc3NhZ2U6IG5vZGUuaXNDb250YWluZXJcbiAgICAgICAgPyA8c3Bhbj5FbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBkaXJlY3RvcnkuPC9zcGFuPlxuICAgICAgICA6IDxzcGFuPkVudGVyIHRoZSBuZXcgcGF0aCBmb3IgdGhlIGZpbGUuPC9zcGFuPixcbiAgICAgIG9uQ29uZmlybTogKG5ld0Jhc2VuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IE9iamVjdCkgPT4ge1xuICAgICAgICB0aGlzLl9vbkNvbmZpcm1SZW5hbWUobm9kZSwgbm9kZVBhdGgsIG5ld0Jhc2VuYW1lKS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBSZW5hbWUgdG8gJHtuZXdCYXNlbmFtZX0gZmFpbGVkYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMuX2Nsb3NlRGlhbG9nLFxuICAgICAgc2VsZWN0QmFzZW5hbWU6IHRydWUsXG4gICAgfSk7XG4gIH0sXG5cbiAgb3BlbkR1cGxpY2F0ZURpYWxvZyhvbkRpZENvbmZpcm06IChmaWxlUGF0aDogP3N0cmluZykgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBjb25zdCBzdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGlmIChzZWxlY3RlZE5vZGVzLnNpemUgIT09IDEpIHtcbiAgICAgIC8vIENhbiBvbmx5IGNvcHkgb25lIGVudHJ5IGF0IGEgdGltZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGNvbnN0IG5vZGVQYXRoID0gbm9kZS5sb2NhbFBhdGg7XG4gICAgbGV0IGluaXRpYWxWYWx1ZSA9IHBhdGhNb2R1bGUuYmFzZW5hbWUobm9kZVBhdGgpO1xuICAgIGNvbnN0IGV4dCA9IHBhdGhNb2R1bGUuZXh0bmFtZShub2RlUGF0aCk7XG4gICAgaW5pdGlhbFZhbHVlID0gaW5pdGlhbFZhbHVlLnN1YnN0cigwLCBpbml0aWFsVmFsdWUubGVuZ3RoIC0gZXh0Lmxlbmd0aCkgKyAnLWNvcHknICsgZXh0O1xuICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9IHRoaXMuX2dldEhnUmVwb3NpdG9yeUZvck5vZGUobm9kZSk7XG4gICAgY29uc3QgYWRkaXRpb25hbE9wdGlvbnMgPSB7fTtcbiAgICBpZiAoaGdSZXBvc2l0b3J5ICE9PSBudWxsKSB7XG4gICAgICBhZGRpdGlvbmFsT3B0aW9uc1snYWRkVG9WQ1MnXSA9ICdBZGQgdGhlIG5ldyBmaWxlIHRvIHZlcnNpb24gY29udHJvbC4nO1xuICAgIH1cbiAgICB0aGlzLl9vcGVuRGlhbG9nKHtcbiAgICAgIGljb25DbGFzc05hbWU6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogaW5pdGlhbFZhbHVlLFxuICAgICAgbWVzc2FnZTogPHNwYW4+RW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZHVwbGljYXRlLjwvc3Bhbj4sXG4gICAgICBvbkNvbmZpcm06IChuZXdCYXNlbmFtZTogc3RyaW5nLCBvcHRpb25zOiB7YWRkVG9WQ1M/OiBib29sZWFufSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gRmlsZVRyZWVIZWxwZXJzLmdldEZpbGVCeUtleShub2RlLnVyaSk7XG4gICAgICAgIGlmIChmaWxlID09IG51bGwpIHtcbiAgICAgICAgICAvLyBUT0RPOiBDb25uZWN0aW9uIGNvdWxkIGhhdmUgYmVlbiBsb3N0IGZvciByZW1vdGUgZmlsZS5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb25Db25maXJtRHVwbGljYXRlKFxuICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgbm9kZVBhdGgsXG4gICAgICAgICAgbmV3QmFzZW5hbWUudHJpbSgpLFxuICAgICAgICAgICEhb3B0aW9ucy5hZGRUb1ZDUyxcbiAgICAgICAgICBvbkRpZENvbmZpcm0sXG4gICAgICAgICkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgRmFpbGVkIHRvIGR1cGxpY2F0ZSAne2ZpbGUuZ2V0UGF0aCgpfSdgKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgb25DbG9zZTogdGhpcy5fY2xvc2VEaWFsb2csXG4gICAgICBzZWxlY3RCYXNlbmFtZTogdHJ1ZSxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zLFxuICAgIH0pO1xuICB9LFxuXG4gIF9nZXRTZWxlY3RlZENvbnRhaW5lck5vZGUoKTogP0ZpbGVUcmVlTm9kZSB7XG4gICAgY29uc3Qgc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgLypcbiAgICAgKiBUT0RPOiBDaG9vc2luZyB0aGUgbGFzdCBzZWxlY3RlZCBrZXkgaXMgaW5leGFjdCB3aGVuIHRoZXJlIGlzIG1vcmUgdGhhbiAxIHJvb3QuIFRoZSBTZXQgb2ZcbiAgICAgKiBzZWxlY3RlZCBrZXlzIHNob3VsZCBiZSBtYWludGFpbmVkIGFzIGEgZmxhdCBsaXN0IGFjcm9zcyBhbGwgcm9vdHMgdG8gbWFpbnRhaW4gaW5zZXJ0aW9uXG4gICAgICogb3JkZXIuXG4gICAgICovXG4gICAgY29uc3Qgbm9kZSA9IHN0b3JlLmdldFNlbGVjdGVkTm9kZXMoKS5maXJzdCgpO1xuICAgIHJldHVybiBub2RlLmlzQ29udGFpbmVyID8gbm9kZSA6IG5vZGUucGFyZW50O1xuICB9LFxuXG4gIF9vcGVuQWRkRGlhbG9nKFxuICAgIGVudHJ5VHlwZTogc3RyaW5nLFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBvbkNvbmZpcm06IChmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpID0+IG1peGVkLFxuICAgIGFkZGl0aW9uYWxPcHRpb25zPzogT2JqZWN0ID0ge30sXG4gICkge1xuICAgIHRoaXMuX29wZW5EaWFsb2coe1xuICAgICAgaWNvbkNsYXNzTmFtZTogJ2ljb24tZmlsZS1hZGQnLFxuICAgICAgbWVzc2FnZTogPHNwYW4+RW50ZXIgdGhlIHBhdGggZm9yIHRoZSBuZXcge2VudHJ5VHlwZX0gaW4gdGhlIHJvb3Q6PGJyIC8+e3BhdGh9PC9zcGFuPixcbiAgICAgIG9uQ29uZmlybSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMuX2Nsb3NlRGlhbG9nLFxuICAgICAgYWRkaXRpb25hbE9wdGlvbnMsXG4gICAgfSk7XG4gIH0sXG5cbiAgX29wZW5EaWFsb2cocHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMuX2Nsb3NlRGlhbG9nKCk7XG4gICAgZGlhbG9nSG9zdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLmFwcGVuZENoaWxkKGRpYWxvZ0hvc3RFbGVtZW50KTtcbiAgICBkaWFsb2dDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RmlsZURpYWxvZ0NvbXBvbmVudCB7Li4ucHJvcHN9IC8+LFxuICAgICAgZGlhbG9nSG9zdEVsZW1lbnRcbiAgICApO1xuICB9LFxuXG4gIF9jbG9zZURpYWxvZygpOiB2b2lkIHtcbiAgICBpZiAoZGlhbG9nQ29tcG9uZW50ICE9IG51bGwpIHtcbiAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoZGlhbG9nSG9zdEVsZW1lbnQpO1xuICAgICAgZGlhbG9nQ29tcG9uZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKGRpYWxvZ0hvc3RFbGVtZW50ICE9IG51bGwpIHtcbiAgICAgIGRpYWxvZ0hvc3RFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZGlhbG9nSG9zdEVsZW1lbnQpO1xuICAgICAgZGlhbG9nSG9zdEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVN5c3RlbUFjdGlvbnM7XG4iXX0=