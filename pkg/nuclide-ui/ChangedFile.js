'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../modules/nuclide-commons-atom/go-to-location');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../modules/nuclide-commons-ui/addTooltip'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../modules/nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../nuclide-vcs-base');
}

var _react = _interopRequireWildcard(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('../../modules/nuclide-commons-ui/Icon');
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('./PathWithFileIcon'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../modules/nuclide-commons-ui/Checkbox');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LF = '\u000A'; /**
                      * Copyright (c) 2015-present, Facebook, Inc.
                      * All rights reserved.
                      *
                      * This source code is licensed under the license found in the LICENSE file in
                      * the root directory of this source tree.
                      *
                      * 
                      * @format
                      */

const COMMAND_PREFIX = 'changed-file';
const CONTEXT_MENU_KEY = 'context-menu';
const INLINE_KEY = 'inline';

class ChangedFile extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onCheckboxChange = isChecked => {
      (0, (_nullthrows || _load_nullthrows()).default)(this.props.onFileChecked)(this.props.filePath);
    }, _temp;
  }

  componentDidMount() {
    const node = _reactDom.default.findDOMNode(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add(node, `${COMMAND_PREFIX}:goto-file`, event => {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(this.props.filePath);
    }), atom.commands.add(node, `${COMMAND_PREFIX}:copy-full-path`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.getPath(this.props.filePath || ''));
    }), atom.commands.add(node, `${COMMAND_PREFIX}:delete-file`, event => {
      const { onDeleteFile, filePath } = this.props;
      if (onDeleteFile != null) {
        onDeleteFile(filePath, CONTEXT_MENU_KEY);
      }
    }), atom.commands.add(node, `${COMMAND_PREFIX}:copy-file-name`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.basename(this.props.filePath || ''));
    }), atom.commands.add(node, `${COMMAND_PREFIX}:add`, event => {
      const { onAddFile, filePath } = this.props;
      if (onAddFile != null) {
        onAddFile(filePath, CONTEXT_MENU_KEY);
      }
    }), atom.commands.add(node, `${COMMAND_PREFIX}:revert`, event => {
      const { onRevertFile, filePath } = this.props;
      if (onRevertFile != null) {
        onRevertFile(filePath, CONTEXT_MENU_KEY);
      }
    }), atom.commands.add(node, `${COMMAND_PREFIX}:open-in-diff-view`, event => {
      const { onOpenFileInDiffView, filePath } = this.props;
      if (onOpenFileInDiffView != null) {
        onOpenFileInDiffView(filePath, CONTEXT_MENU_KEY);
      }
    }), atom.commands.add(node, `${COMMAND_PREFIX}:forget-file`, event => {
      const { onForgetFile, filePath } = this.props;
      if (onForgetFile != null) {
        onForgetFile(filePath, CONTEXT_MENU_KEY);
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _getFileClassname() {
    const { fileStatus, generatedType, isSelected } = this.props;
    return (0, (_classnames || _load_classnames()).default)('nuclide-changed-file', 'list-item', 'nuclide-path-with-terminal', this._generatedClass(generatedType), {
      selected: isSelected
    }, (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatusToTextColor[fileStatus]);
  }

  _generatedClass(generatedType) {
    switch (generatedType) {
      case 'generated':
        return 'generated-fully';
      case 'partial':
        return 'generated-partly';
      default:
        return null;
    }
  }

  _renderAction(key, icon, tooltipTitle, onClick) {
    return _react.createElement(
      'div',
      {
        className: 'nuclide-changed-file-action',
        key: key,
        onClick: onClick
        // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        , ref: (0, (_addTooltip || _load_addTooltip()).default)({
          delay: 300,
          placement: 'top',
          title: tooltipTitle
        }) },
      _react.createElement((_Icon || _load_Icon()).Icon, { icon: icon })
    );
  }

  _renderForgetAction(filePath) {
    const { onForgetFile } = this.props;
    return onForgetFile != null ? this._renderAction('forget' /* key */
    , 'circle-slash' /* icon */
    , 'Forget (stop tracking file in version control)' /* title */
    , onForgetFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderDeleteAction(filePath) {
    const { onDeleteFile } = this.props;
    return onDeleteFile != null ? this._renderAction('delete' /* key */
    , 'trashcan' /* icon */
    , 'Delete file from file system' /* title */
    , onDeleteFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderResolveAction(filePath) {
    const { onMarkFileResolved } = this.props;
    return onMarkFileResolved ? this._renderAction('resolve' /* key */
    , 'check' /* icon */
    , 'Mark file as resolved' /* title */
    , onMarkFileResolved.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderMarkDeletedAction(filePath) {
    const { onForgetFile } = this.props;
    return onForgetFile != null ? this._renderAction('mark-deleted' /* key */
    , 'circle-slash' /* icon */
    , 'Mark file as deleted (remove from version control)' /* title */
    , onForgetFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderRestoreAction(filePath) {
    const { onRevertFile } = this.props;
    return onRevertFile != null ? this._renderAction('restore' /* key */
    , 'playback-rewind' /* icon */
    , 'Restore file (revert to last known version)' /* title */
    , onRevertFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderAddAction(filePath) {
    const { onAddFile } = this.props;
    return onAddFile != null ? this._renderAction('add' /* key */
    , 'plus' /* icon */
    , 'Add file to version control' /* title */
    , onAddFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderOpenInDiffViewAction(filePath) {
    const { onOpenFileInDiffView } = this.props;
    return onOpenFileInDiffView != null ? this._renderAction('diff' /* key */
    , 'diff' /* icon */
    , 'Open file in Diff View' /* title */
    , onOpenFileInDiffView.bind(this, filePath, INLINE_KEY)) : null;
  }

  render() {
    const {
      isChecked,
      displayPath,
      filePath,
      fileStatus,
      rootPath,
      onFileChosen,
      onOpenFileInDiffView,
      onForgetFile,
      onDeleteFile,
      onAddFile,
      onRevertFile,
      onMarkFileResolved
    } = this.props;

    const enableDiffView = onOpenFileInDiffView != null;
    const enableForget = onForgetFile != null && fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.ADDED;
    const enableDelete = onDeleteFile != null && (fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.UNTRACKED || fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.CHANGE_DELETE);
    const enableAdd = onAddFile != null && fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.UNTRACKED;
    const enableRestore = onRevertFile != null && (fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MISSING || fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MODIFIED || fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.REMOVED);
    const enableMarkDeleted = onForgetFile != null && fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MISSING;
    const enableResolve = onMarkFileResolved != null && fileStatus === (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.CHANGE_DELETE;

    const eligibleActions = [];
    if (enableDiffView) {
      eligibleActions.push(this._renderOpenInDiffViewAction(filePath));
    }
    if (enableAdd) {
      eligibleActions.push(this._renderAddAction(filePath));
    }
    if (enableDelete) {
      eligibleActions.push(this._renderDeleteAction(filePath));
    }
    if (enableForget) {
      eligibleActions.push(this._renderForgetAction(filePath));
    }
    if (enableRestore) {
      eligibleActions.push(this._renderRestoreAction(filePath));
    }
    if (enableMarkDeleted) {
      eligibleActions.push(this._renderMarkDeletedAction(filePath));
    }
    if (enableResolve) {
      eligibleActions.push(this._renderResolveAction(filePath));
    }

    const actions = eligibleActions.length > 0 ? _react.createElement(
      'div',
      { className: 'nuclide-changed-file-actions' },
      eligibleActions
    ) : null;
    const handleFileChosen = onFileChosen != null ? () => onFileChosen(filePath) : null;

    const statusName = (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatusToLabel[fileStatus];
    const checkbox = isChecked != null ? _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      className: 'nuclide-changed-file-checkbox',
      checked: isChecked,
      onChange: this._onCheckboxChange
    }) : null;
    const relativePath = (_nuclideUri || _load_nuclideUri()).default.relative(rootPath, filePath);
    return _react.createElement(
      'li',
      {
        'data-name': displayPath,
        'data-path': filePath,
        'data-root': this.props.rootPath,
        'data-enable-diff-view': enableDiffView || null,
        'data-enable-forget': enableForget || null,
        'data-enable-delete': enableDelete || null,
        'data-enable-add': enableAdd || null,
        'data-enable-revert': enableRestore || null,
        className: this._getFileClassname(),
        key: filePath },
      checkbox,
      _react.createElement(
        'span',
        { className: 'nuclide-changed-file-name', onClick: handleFileChosen },
        _react.createElement((_Icon || _load_Icon()).Icon, {
          className: 'nuclide-changed-file-name-icon',
          icon: (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatusToIcon[fileStatus]
        }),
        _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
          path: displayPath,
          title: `${statusName}:${LF}${relativePath}${LF}(Click to open in Nuclide)`
        })
      ),
      actions
    );
  }
}

exports.default = ChangedFile;
function getCommandTargetForEvent(event) {
  const { target } = event;
  return target.closest('.nuclide-changed-file') || target;
}

// this will currently never get GC'd, but should only ever be created once
// If this might become a problem, consider refcounting wrt ChangedFile instances
atom.contextMenu.add({
  '.nuclide-changed-file': [{ type: 'separator' }, {
    label: 'Add file to Mercurial',
    command: `${COMMAND_PREFIX}:add`,
    shouldDisplay: event => {
      return getCommandTargetForEvent(event).hasAttribute('data-enable-add');
    }
  }, {
    label: 'Open file in Diff View',
    command: `${COMMAND_PREFIX}:open-in-diff-view`,
    shouldDisplay: event => {
      return getCommandTargetForEvent(event).hasAttribute('data-enable-diff-view');
    }
  }, {
    label: 'Revert File',
    command: `${COMMAND_PREFIX}:revert`,
    shouldDisplay: event => {
      return getCommandTargetForEvent(event).hasAttribute('data-enable-revert');
    }
  }, {
    label: 'Delete File',
    command: `${COMMAND_PREFIX}:delete-file`,
    shouldDisplay: event => {
      return getCommandTargetForEvent(event).hasAttribute('data-enable-delete');
    }
  }, {
    label: 'Goto File',
    command: `${COMMAND_PREFIX}:goto-file`
  }, {
    label: 'Copy File Name',
    command: `${COMMAND_PREFIX}:copy-file-name`
  }, {
    label: 'Copy Full Path',
    command: `${COMMAND_PREFIX}:copy-full-path`
  }, {
    label: 'Forget file',
    command: `${COMMAND_PREFIX}:forget-file`,
    shouldDisplay: event => {
      return getCommandTargetForEvent(event).hasAttribute('data-enable-forget');
    }
  }, { type: 'separator' }]
});