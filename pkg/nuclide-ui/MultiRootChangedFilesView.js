'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesView = undefined;

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../nuclide-vcs-base');
}

var _openInDiffView;

function _load_openInDiffView() {
  return _openInDiffView = require('../commons-atom/open-in-diff-view');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../nuclide-analytics');
}

var _react = _interopRequireWildcard(require('react'));

var _ChangedFilesList;

function _load_ChangedFilesList() {
  return _ChangedFilesList = _interopRequireDefault(require('./ChangedFilesList'));
}

var _Tree;

function _load_Tree() {
  return _Tree = require('../../modules/nuclide-commons-ui/Tree');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

  constructor(props) {
    super(props);

    this._handleAddFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).addPath)(filePath);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-add-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._handleDeleteFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).confirmAndDeletePath)(filePath);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-delete-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._handleForgetFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).forgetPath)(filePath);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-forget-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._handleOpenFileInDiffView = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, (_openInDiffView || _load_openInDiffView()).openFileInDiffView)(filePath);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(`${ANALYTICS_PREFIX}-file-in-diff-view`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._handleRevertFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
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
    };

    this._itemSelector = `.${props.commandPrefix}.nuclide-ui-multi-root-file-tree-container .nuclide-changed-file`;
  }

  _getAnalyticsSurface() {
    const { analyticsSurface } = this.props;
    return analyticsSurface == null ? 'n/a' : analyticsSurface;
  }

  render() {
    const {
      checkedFiles: checkedFilesByRoot,
      commandPrefix,
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
      {
        className: (0, (_classnames || _load_classnames()).default)(commandPrefix, 'nuclide-ui-multi-root-file-tree-container') },
      Array.from(fileStatusesByRoot.entries()).map(([root, fileStatuses]) => {
        if (fileStatuses.size == null && hideEmptyFolders) {
          return null;
        }
        const checkedFiles = checkedFilesByRoot == null ? null : checkedFilesByRoot.get(root);
        return (
          // $FlowFixMe(>=0.53.0) Flow suppress
          _react.createElement((_ChangedFilesList || _load_ChangedFilesList()).default, {
            checkedFiles: checkedFiles,
            fileStatuses: fileStatuses,
            generatedTypes: this.props.generatedTypes,
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
}
exports.MultiRootChangedFilesView = MultiRootChangedFilesView;
MultiRootChangedFilesView.defaultProps = {
  checkedFiles: null,
  onFileChecked: () => {}
};