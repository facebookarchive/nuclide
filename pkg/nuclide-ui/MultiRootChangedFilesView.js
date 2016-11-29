'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesView = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _constants;

function _load_constants() {
  return _constants = require('../nuclide-hg-git-bridge/lib/constants');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../nuclide-remote-connection');
}

var _HgRepositoryClient;

function _load_HgRepositoryClient() {
  return _HgRepositoryClient = require('../nuclide-hg-repository-client/lib/HgRepositoryClient');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _reactForAtom = require('react-for-atom');

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../nuclide-hg-git-bridge');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _actions;

function _load_actions() {
  return _actions = require('../nuclide-hg-repository/lib/actions');
}

var _ChangedFilesList;

function _load_ChangedFilesList() {
  return _ChangedFilesList = _interopRequireDefault(require('./ChangedFilesList'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class MultiRootChangedFilesView extends _reactForAtom.React.Component {

  componentDidMount() {
    var _this = this;

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const { commandPrefix, getRevertTargetRevision } = this.props;
    this._subscriptions.add(atom.contextMenu.add({
      [`.${ commandPrefix }-file-entry`]: [{ type: 'separator' }, {
        label: 'Add to Mercurial',
        command: `${ commandPrefix }:add`,
        shouldDisplay: event => {
          return this._getStatusCodeForFile(event) === (_constants || _load_constants()).FileChangeStatus.UNTRACKED;
        }
      }, {
        label: 'Revert',
        command: `${ commandPrefix }:revert`,
        shouldDisplay: event => {
          const statusCode = this._getStatusCodeForFile(event);
          if (statusCode == null) {
            return false;
          }
          return (_constants || _load_constants()).RevertibleStatusCodes.includes(statusCode);
        }
      }, {
        label: 'Delete',
        command: `${ commandPrefix }:delete-file`,
        shouldDisplay: event => {
          const statusCode = this._getStatusCodeForFile(event);
          return statusCode !== (_constants || _load_constants()).FileChangeStatus.REMOVED;
        }
      }, {
        label: 'Goto File',
        command: `${ commandPrefix }:goto-file`
      }, {
        label: 'Copy File Name',
        command: `${ commandPrefix }:copy-file-name`
      }, {
        label: 'Copy Full Path',
        command: `${ commandPrefix }:copy-full-path`
      }, { type: 'separator' }]
    }));

    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:goto-file`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        atom.workspace.open(filePath);
      }
    }));

    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:copy-full-path`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.getPath(this._getFilePathFromEvent(event) || ''));
    }));
    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:delete-file`, (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (event) {
        const nuclideFilePath = _this._getFilePathFromEvent(event);
        const filePath = (_nuclideUri || _load_nuclideUri()).default.getPath(nuclideFilePath);
        const fsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(nuclideFilePath);
        try {
          yield fsService.unlink(filePath);
          const repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(nuclideFilePath);
          if (repository == null || repository.getType() !== 'hg') {
            return;
          }
          yield repository.remove([filePath], true);
        } catch (error) {
          atom.notifications.addError('Failed to delete file', {
            detail: error
          });
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()));
    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:copy-file-name`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.basename(this._getFilePathFromEvent(event) || ''));
    }));
    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:add`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        (0, (_actions || _load_actions()).addPath)(filePath);
      }
    }));
    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:revert`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        let targetRevision = null;
        if (getRevertTargetRevision != null) {
          targetRevision = getRevertTargetRevision();
        }
        (0, (_actions || _load_actions()).revertPath)(filePath, targetRevision);
      }
    }));
  }

  _getStatusCodeForFile(event) {
    // The context menu has the `currentTarget` set to `document`.
    // Hence, use `target` instead.
    const target = event.target;
    const filePath = target.getAttribute('data-path');
    const rootPath = target.getAttribute('data-root');
    const fileChangesForRoot = this.props.fileChanges.get(rootPath);

    if (!fileChangesForRoot) {
      throw new Error('Invalid rootpath');
    }

    const statusCode = fileChangesForRoot.get(filePath);
    return statusCode;
  }

  _getFilePathFromEvent(event) {
    const eventTarget = event.currentTarget;
    return eventTarget.getAttribute('data-path');
  }

  render() {
    if (this.props.fileChanges.size === 0) {
      return _reactForAtom.React.createElement(
        'div',
        null,
        'No changes'
      );
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-ui-multi-root-file-tree-container' },
      Array.from(this.props.fileChanges.entries()).map(([root, fileChanges]) => _reactForAtom.React.createElement((_ChangedFilesList || _load_ChangedFilesList()).default, {
        key: root,
        fileChanges: fileChanges,
        rootPath: root,
        commandPrefix: this.props.commandPrefix,
        selectedFile: this.props.selectedFile,
        hideEmptyFolders: this.props.hideEmptyFolders,
        shouldShowFolderName: this.props.fileChanges.size > 1,
        onFileChosen: this.props.onFileChosen
      }))
    );
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }
}
exports.MultiRootChangedFilesView = MultiRootChangedFilesView;