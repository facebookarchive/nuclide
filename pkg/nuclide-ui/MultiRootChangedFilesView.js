'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesView = undefined;

var _vcs;

function _load_vcs() {
  return _vcs = require('../commons-atom/vcs');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _react = _interopRequireDefault(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _ChangedFilesList;

function _load_ChangedFilesList() {
  return _ChangedFilesList = _interopRequireDefault(require('./ChangedFilesList'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class MultiRootChangedFilesView extends _react.default.Component {

  componentDidMount() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const { commandPrefix, getRevertTargetRevision } = this.props;
    this._subscriptions.add(atom.contextMenu.add({
      [`.${commandPrefix}-file-entry`]: [{ type: 'separator' }, {
        label: 'Add to Mercurial',
        command: `${commandPrefix}:add`,
        shouldDisplay: event => {
          return this._getStatusCodeForFile(event) === (_vcs || _load_vcs()).FileChangeStatus.UNTRACKED;
        }
      }, {
        label: 'Revert',
        command: `${commandPrefix}:revert`,
        shouldDisplay: event => {
          const statusCode = this._getStatusCodeForFile(event);
          if (statusCode == null) {
            return false;
          }
          return (_vcs || _load_vcs()).RevertibleStatusCodes.includes(statusCode);
        }
      }, {
        label: 'Delete',
        command: `${commandPrefix}:delete-file`,
        shouldDisplay: event => {
          const statusCode = this._getStatusCodeForFile(event);
          return statusCode !== (_vcs || _load_vcs()).FileChangeStatus.REMOVED;
        }
      }, {
        label: 'Goto File',
        command: `${commandPrefix}:goto-file`
      }, {
        label: 'Copy File Name',
        command: `${commandPrefix}:copy-file-name`
      }, {
        label: 'Copy Full Path',
        command: `${commandPrefix}:copy-full-path`
      }, { type: 'separator' }]
    }));

    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:goto-file`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        (0, (_goToLocation || _load_goToLocation()).goToLocation)(filePath);
      }
    }));

    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:copy-full-path`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.getPath(this._getFilePathFromEvent(event) || ''));
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:delete-file`, event => {
      const nuclideFilePath = this._getFilePathFromEvent(event);
      (0, (_vcs || _load_vcs()).confirmAndDeletePath)(nuclideFilePath);
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:copy-file-name`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.basename(this._getFilePathFromEvent(event) || ''));
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:add`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        (0, (_vcs || _load_vcs()).addPath)(filePath);
      }
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:revert`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        let targetRevision = null;
        if (getRevertTargetRevision != null) {
          targetRevision = getRevertTargetRevision();
        }
        (0, (_vcs || _load_vcs()).confirmAndRevertPath)(filePath, targetRevision);
      }
    }));
  }

  _getStatusCodeForFile(event) {
    // The context menu has the `currentTarget` set to `document`.
    // Hence, use `target` instead.
    const target = event.target;
    const filePath = target.getAttribute('data-path');
    const rootPath = target.getAttribute('data-root');
    // $FlowFixMe
    const fileChangesForRoot = this.props.fileChanges.get(rootPath);

    if (!fileChangesForRoot) {
      throw new Error('Invalid rootpath');
    }
    // $FlowFixMe


    const statusCode = fileChangesForRoot.get(filePath);
    return statusCode;
  }

  _getFilePathFromEvent(event) {
    const eventTarget = event.currentTarget;
    // $FlowFixMe
    return eventTarget.getAttribute('data-path');
  }

  render() {
    if (this.props.fileChanges.size === 0) {
      return _react.default.createElement(
        'div',
        null,
        'No changes'
      );
    }

    return _react.default.createElement(
      'div',
      { className: 'nuclide-ui-multi-root-file-tree-container' },
      Array.from(this.props.fileChanges.entries()).map(([root, fileChanges]) => _react.default.createElement((_ChangedFilesList || _load_ChangedFilesList()).default, {
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