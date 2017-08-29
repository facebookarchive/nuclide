'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../nuclide-vcs-base');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

var _ChangedFile;

function _load_ChangedFile() {
  return _ChangedFile = _interopRequireDefault(require('./ChangedFile'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function isHgPath(path) {
  const repo = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(path);
  return repo != null && repo.getType() === 'hg';
}

const FILE_CHANGES_INITIAL_PAGE_SIZE = 100;

class ChangedFilesList extends _react.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false,
      visiblePagesCount: 1
    };
  }

  render() {
    const {
      checkedFiles,
      commandPrefix,
      enableFileExpansion,
      enableInlineActions,
      fileChanges,
      fileStatuses,
      onAddFile,
      onDeleteFile,
      onFileChecked,
      onFileChosen,
      onForgetFile,
      onMarkFileResolved,
      onOpenFileInDiffView,
      openInDiffViewOption,
      onRevertFile,
      rootPath,
      selectedFile
    } = this.props;
    if (fileStatuses.size === 0 && this.props.hideEmptyFolders) {
      return null;
    }

    const filesToShow = FILE_CHANGES_INITIAL_PAGE_SIZE * this.state.visiblePagesCount;
    const sizeLimitedFileChanges = Array.from(fileStatuses.entries()).slice(0, filesToShow);

    const rootClassName = (0, (_classnames || _load_classnames()).default)('list-nested-item', {
      collapsed: this.state.isCollapsed
    });

    const showMoreFilesElement = fileStatuses.size > filesToShow ? _react.createElement('div', {
      className: 'icon icon-ellipsis'
      // $FlowFixMe(>=0.53.0) Flow suppress
      , ref: (0, (_addTooltip || _load_addTooltip()).default)({
        title: 'Show more files with uncommitted changes',
        delay: 300,
        placement: 'bottom'
      }),
      onClick: () => this.setState({
        visiblePagesCount: this.state.visiblePagesCount + 1
      })
    }) : null;

    const isHgRoot = isHgPath(rootPath);
    return _react.createElement(
      'ul',
      { className: 'list-tree has-collapsable-children nuclide-changed-files-list' },
      _react.createElement(
        'li',
        { className: rootClassName },
        this.props.shouldShowFolderName ? _react.createElement(
          'div',
          {
            className: 'list-item',
            key: this.props.rootPath,
            onClick: () => this.setState({ isCollapsed: !this.state.isCollapsed }) },
          _react.createElement(
            'span',
            {
              className: 'icon icon-file-directory nuclide-file-changes-root-entry',
              'data-path': this.props.rootPath },
            (_nuclideUri || _load_nuclideUri()).default.basename(this.props.rootPath)
          )
        ) : null,
        _react.createElement(
          'ul',
          { className: 'list-tree has-flat-children' },
          sizeLimitedFileChanges.map(([filePath, fileStatus]) => _react.createElement((_ChangedFile || _load_ChangedFile()).default, {
            commandPrefix: commandPrefix,
            enableFileExpansion: enableFileExpansion,
            enableInlineActions: enableInlineActions,
            fileChanges: fileChanges == null ? null : fileChanges.get(filePath),
            filePath: filePath,
            fileStatus: fileStatus,
            isChecked: checkedFiles == null ? null : checkedFiles.has(filePath),
            isHgPath: isHgRoot,
            isSelected: selectedFile === filePath,
            key: filePath,
            onAddFile: onAddFile,
            onDeleteFile: onDeleteFile,
            onFileChecked: onFileChecked,
            onFileChosen: onFileChosen,
            onForgetFile: onForgetFile,
            onMarkFileResolved: onMarkFileResolved,
            onOpenFileInDiffView: onOpenFileInDiffView,
            openInDiffViewOption: openInDiffViewOption,
            onRevertFile: onRevertFile,
            rootPath: rootPath
          })),
          _react.createElement(
            'li',
            null,
            showMoreFilesElement
          )
        )
      )
    );
  }
}
exports.default = ChangedFilesList;