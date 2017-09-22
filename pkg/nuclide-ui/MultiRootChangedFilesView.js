'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesView = undefined;

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../nuclide-vcs-base');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _openInDiffView;

function _load_openInDiffView() {
  return _openInDiffView = require('../commons-atom/open-in-diff-view');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _ChangedFilesList;

function _load_ChangedFilesList() {
  return _ChangedFilesList = _interopRequireDefault(require('./ChangedFilesList'));
}

var _Tree;

function _load_Tree() {
  return _Tree = require('./Tree');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ANALYTICS_PREFIX = 'changed-files-view'; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */

const DEFAULT_ANALYTICS_SOURCE_KEY = 'command';

class MultiRootChangedFilesView extends _react.PureComponent {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleAddFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).addPath)(filePath);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-add-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    }, this._handleDeleteFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).confirmAndDeletePath)(filePath);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-delete-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    }, this._handleForgetFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).forgetPath)(filePath);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-forget-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    }, this._handleOpenFileInDiffView = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, (_openInDiffView || _load_openInDiffView()).openFileInDiffView)(filePath);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-file-in-diff-view`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    }, this._handleRevertFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      const { getRevertTargetRevision } = this.props;
      let targetRevision = null;
      if (getRevertTargetRevision != null) {
        targetRevision = getRevertTargetRevision();
      }
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).confirmAndRevertPath)(filePath, targetRevision);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-revert-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    }, _temp;
  }

  componentDidMount() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const { commandPrefix, openInDiffViewOption } = this.props;
    this._subscriptions.add(atom.contextMenu.add({
      [`.${commandPrefix}-file-entry`]: [{ type: 'separator' }, {
        label: 'Add file to Mercurial',
        command: `${commandPrefix}:add`,
        shouldDisplay: event => {
          return this._getStatusCodeForFile(event) === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.UNTRACKED;
        }
      }, {
        label: 'Open file in Diff View',
        command: `${commandPrefix}:open-in-diff-view`,
        shouldDisplay: event => {
          return atom.packages.isPackageLoaded('fb-diff-view') && openInDiffViewOption;
        }
      }, {
        label: 'Revert File',
        command: `${commandPrefix}:revert`,
        shouldDisplay: event => {
          const statusCode = this._getStatusCodeForFile(event);
          if (statusCode == null) {
            return false;
          }
          return (_nuclideVcsBase || _load_nuclideVcsBase()).RevertibleStatusCodes.includes(statusCode);
        }
      }, {
        label: 'Delete File',
        command: `${commandPrefix}:delete-file`,
        shouldDisplay: event => {
          const statusCode = this._getStatusCodeForFile(event);
          return statusCode !== (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.REMOVED;
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
      }, {
        label: 'Forget file',
        command: `${commandPrefix}:forget-file`,
        shouldDisplay: event => {
          const statusCode = this._getStatusCodeForFile(event);
          return statusCode !== (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.REMOVED && statusCode !== (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.UNTRACKED;
        }
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
      this._handleDeleteFile(nuclideFilePath);
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:copy-file-name`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.basename(this._getFilePathFromEvent(event) || ''));
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:add`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        this._handleAddFile(filePath);
      }
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:revert`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        this._handleRevertFile(filePath);
      }
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:open-in-diff-view`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        this._handleOpenFileInDiffView(filePath);
      }
    }));
    this._subscriptions.add(atom.commands.add(`.${commandPrefix}-file-entry`, `${commandPrefix}:forget-file`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        this._handleForgetFile(filePath);
      }
    }));
  }

  _getStatusCodeForFile(event) {
    // Walk up the DOM tree to the element containing the relevant data- attributes.
    const target = event.target.closest('.nuclide-changed-file');

    if (!target) {
      throw new Error('Invariant violation: "target"');
    }

    const filePath = target.getAttribute('data-path');
    const rootPath = target.getAttribute('data-root');
    // $FlowFixMe
    const fileStatusesForRoot = this.props.fileStatuses.get(rootPath);

    if (!fileStatusesForRoot) {
      throw new Error('Invalid rootpath');
    }
    // $FlowFixMe


    const statusCode = fileStatusesForRoot.get(filePath);
    return statusCode;
  }

  _getFilePathFromEvent(event) {
    const eventTarget = event.currentTarget;
    // $FlowFixMe
    return eventTarget.getAttribute('data-path');
  }

  _getAnalyticsSurface() {
    const { analyticsSurface } = this.props;
    return analyticsSurface == null ? 'n/a' : analyticsSurface;
  }

  render() {
    const {
      checkedFiles: checkedFilesByRoot,
      commandPrefix,
      enableFileExpansion,
      enableInlineActions,
      fileChanges: fileChangesByRoot,
      fileStatuses: fileStatusesByRoot,
      hideEmptyFolders,
      onFileChecked,
      onFileChosen,
      onMarkFileResolved,
      openInDiffViewOption,
      selectedFile
    } = this.props;
    if (fileStatusesByRoot.size === 0) {
      return _react.createElement(
        (_Tree || _load_Tree()).TreeList,
        { showArrows: true },
        _react.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          'No changes'
        )
      );
      // The 'showArrows' is so CSS styling gives this the same indent as
      // real changes do (which themselves have showArrows=true).
    }
    const shouldShowFolderName = fileStatusesByRoot.size > 1;
    return _react.createElement(
      'div',
      { className: 'nuclide-ui-multi-root-file-tree-container' },
      Array.from(fileStatusesByRoot.entries()).map(([root, fileStatuses]) => {
        const fileChanges = fileChangesByRoot == null ? null : fileChangesByRoot.get(root);
        const checkedFiles = checkedFilesByRoot == null ? null : checkedFilesByRoot.get(root);
        return (
          // $FlowFixMe(>=0.53.0) Flow suppress
          _react.createElement((_ChangedFilesList || _load_ChangedFilesList()).default, {
            checkedFiles: checkedFiles,
            commandPrefix: commandPrefix,
            enableFileExpansion: enableFileExpansion === true,
            enableInlineActions: enableInlineActions === true,
            fileChanges: fileChanges,
            fileStatuses: fileStatuses,
            hideEmptyFolders: hideEmptyFolders,
            key: root,
            onAddFile: this._handleAddFile,
            onDeleteFile: this._handleDeleteFile,
            onFileChecked: onFileChecked,
            onFileChosen: onFileChosen,
            onForgetFile: this._handleForgetFile,
            onMarkFileResolved: onMarkFileResolved,
            onOpenFileInDiffView: this._handleOpenFileInDiffView,
            openInDiffViewOption: openInDiffViewOption || false,
            onRevertFile: this._handleRevertFile,
            rootPath: root,
            selectedFile: selectedFile,
            shouldShowFolderName: shouldShowFolderName
          })
        );
      })
    );
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }
}
exports.MultiRootChangedFilesView = MultiRootChangedFilesView;
MultiRootChangedFilesView.defaultProps = {
  checkedFiles: null,
  onFileChecked: () => {}
};