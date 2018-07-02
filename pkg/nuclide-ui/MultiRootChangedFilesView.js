"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesView = void 0;

function _nuclideVcsBase() {
  const data = require("../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _openInDiffView() {
  const data = require("../commons-atom/open-in-diff-view");

  _openInDiffView = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _ChangedFilesList() {
  const data = _interopRequireDefault(require("./ChangedFilesList"));

  _ChangedFilesList = function () {
    return data;
  };

  return data;
}

function _Tree() {
  const data = require("../../modules/nuclide-commons-ui/Tree");

  _Tree = function () {
    return data;
  };

  return data;
}

function _immutable() {
  const data = _interopRequireDefault(require("immutable"));

  _immutable = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const ANALYTICS_PREFIX = 'changed-files-view';
const DEFAULT_ANALYTICS_SOURCE_KEY = 'command';

class MultiRootChangedFilesView extends React.PureComponent {
  constructor(props) {
    super(props);

    this._handleAddFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, _nuclideVcsBase().addPath)(filePath);
      (0, _nuclideAnalytics().track)(`${ANALYTICS_PREFIX}-add-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._handleDeleteFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, _nuclideVcsBase().confirmAndDeletePath)(filePath);
      (0, _nuclideAnalytics().track)(`${ANALYTICS_PREFIX}-delete-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._handleForgetFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, _nuclideVcsBase().forgetPath)(filePath);
      (0, _nuclideAnalytics().track)(`${ANALYTICS_PREFIX}-forget-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._handleOpenFileInDiffView = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      (0, _openInDiffView().openFileInDiffView)(filePath);
      (0, _nuclideAnalytics().track)(`${ANALYTICS_PREFIX}-file-in-diff-view`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._handleRevertFile = (filePath, analyticsSource = DEFAULT_ANALYTICS_SOURCE_KEY) => {
      const {
        getRevertTargetRevision
      } = this.props;
      let targetRevision = null;

      if (getRevertTargetRevision != null) {
        targetRevision = getRevertTargetRevision();
      }

      (0, _nuclideVcsBase().confirmAndRevertPath)(filePath, targetRevision);
      (0, _nuclideAnalytics().track)(`${ANALYTICS_PREFIX}-revert-file`, {
        source: analyticsSource,
        surface: this._getAnalyticsSurface()
      });
    };

    this._itemSelector = `.${props.commandPrefix}.nuclide-ui-multi-root-file-tree-container .nuclide-changed-file`;
  }

  _getAnalyticsSurface() {
    const {
      analyticsSurface
    } = this.props;
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
      return React.createElement(_Tree().TreeList, {
        showArrows: true
      }, React.createElement(_Tree().TreeItem, null, "No changes")); // The 'showArrows' is so CSS styling gives this the same indent as
      // real changes do (which themselves have showArrows=true).
    }

    const shouldShowFolderName = fileStatusesByRoot.size > 1;
    return React.createElement("div", {
      className: (0, _classnames().default)(commandPrefix, 'nuclide-ui-multi-root-file-tree-container')
    }, Array.from(fileStatusesByRoot.entries()).map(([root, fileStatuses]) => {
      if (fileStatuses.size == null && hideEmptyFolders) {
        return null;
      }

      const checkedFiles = checkedFilesByRoot == null ? null : checkedFilesByRoot.get(root);
      return (// $FlowFixMe(>=0.53.0) Flow suppress
        React.createElement(_ChangedFilesList().default, {
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
    }));
  }

}

exports.MultiRootChangedFilesView = MultiRootChangedFilesView;
MultiRootChangedFilesView.defaultProps = {
  checkedFiles: null,
  onFileChecked: () => {}
};