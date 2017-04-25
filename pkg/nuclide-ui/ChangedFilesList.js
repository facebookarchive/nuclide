'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('./add-tooltip'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../nuclide-vcs-base');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _react = _interopRequireDefault(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('./PathWithFileIcon'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FILE_CHANGES_INITIAL_PAGE_SIZE = 100; /**
                                             * Copyright (c) 2015-present, Facebook, Inc.
                                             * All rights reserved.
                                             *
                                             * This source code is licensed under the license found in the LICENSE file in
                                             * the root directory of this source tree.
                                             *
                                             * 
                                             */

const ANALYTICS_SOURCE_KEY = 'inline';

function isHgPath(path) {
  const repo = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(path);
  return repo != null && repo.getType() === 'hg';
}

class ChangedFilesList extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false,
      visiblePagesCount: 1
    };
  }

  _getFileClassname(file, fileChangeValue) {
    const { commandPrefix, rootPath, selectedFile } = this.props;
    const repository = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(rootPath);
    return (0, (_classnames || _load_classnames()).default)('nuclide-file-changes-list-item', 'list-item', {
      selected: file === selectedFile,
      [`${commandPrefix}-file-entry`]: repository != null && repository.getType() === 'hg'
    }, (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatusToTextColor[fileChangeValue]);
  }

  _renderAction(key, icon, tooltipTitle, onClick) {
    return _react.default.createElement(
      'div',
      {
        className: 'nuclide-file-changes-file-action',
        key: key,
        onClick: onClick,
        ref: (0, (_addTooltip || _load_addTooltip()).default)({
          delay: 300,
          placement: 'top',
          title: tooltipTitle
        }) },
      _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: icon })
    );
  }

  _renderForgetAction(filePath) {
    return this._renderAction('forget', /* key */
    'circle-slash', /* icon */
    'Forget (stop tracking file in version control)', /* title */
    this.props.onForgetFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderDeleteAction(filePath) {
    return this._renderAction('delete', /* key */
    'trashcan', /* icon */
    'Delete file from file system', /* title */
    this.props.onDeleteFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderMarkDeletedAction(filePath) {
    return this._renderAction('mark-deleted', /* key */
    'circle-slash', /* icon */
    'Mark file as deleted (remove from version control)', /* title */
    this.props.onForgetFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderRestoreAction(filePath) {
    return this._renderAction('restore', /* key */
    'playback-rewind', /* icon */
    'Restore file (revert to last known version)', /* title */
    this.props.onRevertFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderAddAction(filePath) {
    return this._renderAction('add', /* key */
    'plus', /* icon */
    'Add file to version control', /* title */
    this.props.onAddFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderOpenInDiffViewAction(filePath) {
    return this._renderAction('diff', /* key */
    'diff', /* icon */
    'Open file in Diff View', /* title */
    this.props.onOpenFileInDiffView.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  render() {
    const {
      fileChanges,
      enableInlineActions
    } = this.props;
    if (fileChanges.size === 0 && this.props.hideEmptyFolders) {
      return null;
    }

    const filesToShow = FILE_CHANGES_INITIAL_PAGE_SIZE * this.state.visiblePagesCount;
    const sizeLimitedFileChanges = Array.from(fileChanges.entries()).slice(0, filesToShow);

    const rootClassName = (0, (_classnames || _load_classnames()).default)('list-nested-item', {
      collapsed: this.state.isCollapsed
    });

    const showMoreFilesElement = fileChanges.size > filesToShow ? _react.default.createElement('div', {
      className: 'icon icon-ellipsis',
      ref: (0, (_addTooltip || _load_addTooltip()).default)({
        title: 'Show more files with uncommitted changes',
        delay: 300,
        placement: 'bottom'
      }),
      onClick: () => this.setState({ visiblePagesCount: this.state.visiblePagesCount + 1 })
    }) : null;

    return _react.default.createElement(
      'ul',
      { className: 'list-tree has-collapsable-children' },
      _react.default.createElement(
        'li',
        { className: rootClassName },
        this.props.shouldShowFolderName ? _react.default.createElement(
          'div',
          {
            className: 'list-item',
            key: this.props.rootPath,
            onClick: () => this.setState({ isCollapsed: !this.state.isCollapsed }) },
          _react.default.createElement(
            'span',
            {
              className: 'icon icon-file-directory nuclide-file-changes-root-entry',
              'data-path': this.props.rootPath },
            (_nuclideUri || _load_nuclideUri()).default.basename(this.props.rootPath)
          )
        ) : null,
        _react.default.createElement(
          'ul',
          { className: 'list-tree has-flat-children' },
          sizeLimitedFileChanges.map(([filePath, fileChangeValue]) => {
            const baseName = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
            let actions;
            if (enableInlineActions && isHgPath(filePath)) {
              const eligibleActions = [this._renderOpenInDiffViewAction(filePath)];
              switch (fileChangeValue) {
                case (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.ADDED:
                  eligibleActions.push(this._renderForgetAction(filePath), this._renderDeleteAction(filePath));
                  break;
                case (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.UNTRACKED:
                  eligibleActions.push(this._renderAddAction(filePath), this._renderDeleteAction(filePath));
                  break;
                case (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MISSING:
                  // removed from FS but not VCS
                  eligibleActions.push(this._renderRestoreAction(filePath), this._renderMarkDeletedAction(filePath));
                  break;
                case (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MODIFIED:
                case (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.REMOVED:
                  // removed from both FS and VCS
                  eligibleActions.push(this._renderRestoreAction(filePath));
                  break;
              }
              actions = _react.default.createElement(
                'div',
                { className: 'nuclide-file-changes-file-actions' },
                eligibleActions
              );
            }
            return _react.default.createElement(
              'li',
              {
                'data-name': baseName,
                'data-path': filePath,
                'data-root': this.props.rootPath,
                className: this._getFileClassname(filePath, fileChangeValue),
                key: filePath },
              _react.default.createElement(
                'span',
                {
                  className: 'nuclide-file-changes-file-entry',
                  onClick: () => this.props.onFileChosen(filePath) },
                _react.default.createElement((_Icon || _load_Icon()).Icon, {
                  className: 'nuclide-file-changes-file-entry-icon',
                  icon: (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatusToIcon[fileChangeValue]
                }),
                _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
                  path: baseName,
                  ref: (0, (_addTooltip || _load_addTooltip()).default)({
                    title: `${filePath} – Click to open`,
                    // Extra long delay to limit spawning aggressive follow-through behavior.
                    delay: 1000,
                    placement: 'top'
                  })
                })
              ),
              actions
            );
          }),
          _react.default.createElement(
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