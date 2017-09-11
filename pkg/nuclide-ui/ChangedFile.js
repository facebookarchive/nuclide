'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../nuclide-vcs-base');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('./PathWithFileIcon'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ANALYTICS_SOURCE_KEY = 'inline'; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        * 
                                        * @format
                                        */

const LF = '\u000A';
class ChangedFile extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onCheckboxChange = isChecked => {
      this.props.onFileChecked(this.props.filePath);
    }, _temp;
  }

  _getFileClassname() {
    const { commandPrefix, fileStatus, isHgPath, isSelected } = this.props;
    return (0, (_classnames || _load_classnames()).default)('nuclide-changed-file', 'list-item', {
      selected: isSelected,
      [`${commandPrefix}-file-entry`]: isHgPath
    }, (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatusToTextColor[fileStatus]);
  }

  _renderAction(key, icon, tooltipTitle, onClick) {
    return _react.createElement(
      'div',
      {
        className: 'nuclide-changed-file-action',
        key: key,
        onClick: onClick
        // $FlowFixMe(>=0.53.0) Flow suppress
        , ref: (0, (_addTooltip || _load_addTooltip()).default)({
          delay: 300,
          placement: 'top',
          title: tooltipTitle
        }) },
      _react.createElement((_Icon || _load_Icon()).Icon, { icon: icon })
    );
  }

  _renderForgetAction(filePath) {
    return this._renderAction('forget' /* key */
    , 'circle-slash' /* icon */
    , 'Forget (stop tracking file in version control)' /* title */
    , this.props.onForgetFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderDeleteAction(filePath) {
    return this._renderAction('delete' /* key */
    , 'trashcan' /* icon */
    , 'Delete file from file system' /* title */
    , this.props.onDeleteFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderResolveAction(filePath) {
    return this.props.onMarkFileResolved ? this._renderAction('resolve' /* key */
    , 'check' /* icon */
    , 'Mark file as resolved' /* title */
    , this.props.onMarkFileResolved.bind(this, filePath, ANALYTICS_SOURCE_KEY)) : null;
  }

  _renderMarkDeletedAction(filePath) {
    return this._renderAction('mark-deleted' /* key */
    , 'circle-slash' /* icon */
    , 'Mark file as deleted (remove from version control)' /* title */
    , this.props.onForgetFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderRestoreAction(filePath) {
    return this._renderAction('restore' /* key */
    , 'playback-rewind' /* icon */
    , 'Restore file (revert to last known version)' /* title */
    , this.props.onRevertFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderAddAction(filePath) {
    return this._renderAction('add' /* key */
    , 'plus' /* icon */
    , 'Add file to version control' /* title */
    , this.props.onAddFile.bind(this, filePath, ANALYTICS_SOURCE_KEY));
  }

  _renderOpenInDiffViewAction(filePath) {
    return this.props.openInDiffViewOption ? this._renderAction('diff' /* key */
    , 'diff' /* icon */
    , 'Open file in Diff View' /* title */
    , this.props.onOpenFileInDiffView.bind(this, filePath, ANALYTICS_SOURCE_KEY)) : null;
  }

  render() {
    const {
      enableInlineActions,
      isChecked,
      isHgPath,
      filePath,
      fileStatus
    } = this.props;
    const baseName = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
    let actions;
    if (enableInlineActions && isHgPath) {
      const eligibleActions = [this._renderOpenInDiffViewAction(filePath)];
      switch (fileStatus) {
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
        case (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.CHANGE_DELETE:
          eligibleActions.push(this._renderDeleteAction(filePath));
          eligibleActions.push(this._renderResolveAction(filePath));
          break;
      }
      actions = _react.createElement(
        'div',
        { className: 'nuclide-changed-file-actions' },
        eligibleActions
      );
    }
    const statusName = (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatusToLabel[fileStatus];
    const projectRelativePath = (0, (_projects || _load_projects()).getAtomProjectRelativePath)(filePath) || filePath;
    const checkbox = isChecked != null ? _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      className: 'nuclide-changed-file-checkbox',
      checked: isChecked,
      onChange: this._onCheckboxChange
    }) : null;
    return _react.createElement(
      'li',
      {
        'data-name': baseName,
        'data-path': filePath,
        'data-root': this.props.rootPath,
        className: this._getFileClassname(),
        key: filePath },
      checkbox,
      _react.createElement(
        'span',
        {
          className: 'nuclide-changed-file-name',
          onClick: () => this.props.onFileChosen(filePath) },
        _react.createElement((_Icon || _load_Icon()).Icon, {
          className: 'nuclide-changed-file-name-icon',
          icon: (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatusToIcon[fileStatus]
        }),
        _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
          path: baseName,
          title: `${statusName}:${LF}${projectRelativePath}${LF}(Click to open in Nuclide)`
        })
      ),
      actions
    );
  }
}
exports.default = ChangedFile;