"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
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

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideVcsBase() {
  const data = require("../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Icon() {
  const data = require("../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _PathWithFileIcon() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons-ui/PathWithFileIcon"));

  _PathWithFileIcon = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../modules/nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const LF = '\u000A';
const COMMAND_PREFIX = 'changed-file';
const CONTEXT_MENU_KEY = 'context-menu';
const INLINE_KEY = 'inline';

class ChangedFile extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onCheckboxChange = isChecked => {
      (0, _nullthrows().default)(this.props.onFileChecked)(this.props.filePath);
    }, _temp;
  }

  componentDidMount() {
    const node = _reactDom.default.findDOMNode(this);

    this._disposables = new (_UniversalDisposable().default)(atom.commands.add(node, `${COMMAND_PREFIX}:goto-file`, event => {
      (0, _goToLocation().goToLocation)(this.props.filePath);
    }), atom.commands.add(node, `${COMMAND_PREFIX}:copy-full-path`, event => {
      atom.clipboard.write(_nuclideUri().default.getPath(this.props.filePath || ''));
    }), atom.commands.add(node, `${COMMAND_PREFIX}:delete-file`, event => {
      const {
        onDeleteFile,
        filePath
      } = this.props;

      if (onDeleteFile != null) {
        onDeleteFile(filePath, CONTEXT_MENU_KEY);
      }
    }), atom.commands.add(node, `${COMMAND_PREFIX}:copy-file-name`, event => {
      atom.clipboard.write(_nuclideUri().default.basename(this.props.filePath || ''));
    }), atom.commands.add(node, `${COMMAND_PREFIX}:add`, event => {
      const {
        onAddFile,
        filePath
      } = this.props;

      if (onAddFile != null) {
        onAddFile(filePath, CONTEXT_MENU_KEY);
      }
    }), atom.commands.add(node, `${COMMAND_PREFIX}:revert`, event => {
      const {
        onRevertFile,
        filePath
      } = this.props;

      if (onRevertFile != null) {
        onRevertFile(filePath, CONTEXT_MENU_KEY);
      }
    }), atom.commands.add(node, `${COMMAND_PREFIX}:open-in-diff-view`, event => {
      const {
        onOpenFileInDiffView,
        filePath
      } = this.props;

      if (onOpenFileInDiffView != null) {
        onOpenFileInDiffView(filePath, CONTEXT_MENU_KEY);
      }
    }), atom.commands.add(node, `${COMMAND_PREFIX}:forget-file`, event => {
      const {
        onForgetFile,
        filePath
      } = this.props;

      if (onForgetFile != null) {
        onForgetFile(filePath, CONTEXT_MENU_KEY);
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _getFileClassname() {
    const {
      fileStatus,
      generatedType,
      isSelected
    } = this.props;
    return (0, _classnames().default)('nuclide-changed-file', 'list-item', 'nuclide-path-with-terminal', this._generatedClass(generatedType), {
      selected: isSelected
    }, _nuclideVcsBase().FileChangeStatusToTextColor[fileStatus]);
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
    return React.createElement("div", {
      className: "nuclide-changed-file-action",
      key: key,
      onClick: onClick // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: (0, _addTooltip().default)({
        delay: 300,
        placement: 'top',
        title: tooltipTitle
      })
    }, React.createElement(_Icon().Icon, {
      icon: icon
    }));
  }

  _renderForgetAction(filePath) {
    const {
      onForgetFile
    } = this.props;
    return onForgetFile != null ? this._renderAction('forget'
    /* key */
    , 'circle-slash'
    /* icon */
    , 'Forget (stop tracking file in version control)'
    /* title */
    , onForgetFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderDeleteAction(filePath) {
    const {
      onDeleteFile
    } = this.props;
    return onDeleteFile != null ? this._renderAction('delete'
    /* key */
    , 'trashcan'
    /* icon */
    , 'Delete file from file system'
    /* title */
    , onDeleteFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderResolveAction(filePath) {
    const {
      onMarkFileResolved
    } = this.props;
    return onMarkFileResolved ? this._renderAction('resolve'
    /* key */
    , 'check'
    /* icon */
    , 'Mark file as resolved'
    /* title */
    , onMarkFileResolved.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderMarkDeletedAction(filePath) {
    const {
      onForgetFile
    } = this.props;
    return onForgetFile != null ? this._renderAction('mark-deleted'
    /* key */
    , 'circle-slash'
    /* icon */
    , 'Mark file as deleted (remove from version control)'
    /* title */
    , onForgetFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderRestoreAction(filePath) {
    const {
      onRevertFile
    } = this.props;
    return onRevertFile != null ? this._renderAction('restore'
    /* key */
    , 'playback-rewind'
    /* icon */
    , 'Restore file (revert to last known version)'
    /* title */
    , onRevertFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderAddAction(filePath) {
    const {
      onAddFile
    } = this.props;
    return onAddFile != null ? this._renderAction('add'
    /* key */
    , 'plus'
    /* icon */
    , 'Add file to version control'
    /* title */
    , onAddFile.bind(this, filePath, INLINE_KEY)) : null;
  }

  _renderOpenInDiffViewAction(filePath) {
    const {
      onOpenFileInDiffView
    } = this.props;
    return onOpenFileInDiffView != null ? this._renderAction('diff'
    /* key */
    , 'diff'
    /* icon */
    , 'Open file in Diff View'
    /* title */
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

    const enableForget = onForgetFile != null && fileStatus === _nuclideVcsBase().FileChangeStatus.ADDED;

    const enableDelete = onDeleteFile != null && (fileStatus === _nuclideVcsBase().FileChangeStatus.UNTRACKED || fileStatus === _nuclideVcsBase().FileChangeStatus.CHANGE_DELETE);

    const enableAdd = onAddFile != null && fileStatus === _nuclideVcsBase().FileChangeStatus.UNTRACKED;

    const enableRestore = onRevertFile != null && (fileStatus === _nuclideVcsBase().FileChangeStatus.MISSING || fileStatus === _nuclideVcsBase().FileChangeStatus.MODIFIED || fileStatus === _nuclideVcsBase().FileChangeStatus.REMOVED);

    const enableMarkDeleted = onForgetFile != null && fileStatus === _nuclideVcsBase().FileChangeStatus.MISSING;

    const enableResolve = onMarkFileResolved != null && fileStatus === _nuclideVcsBase().FileChangeStatus.CHANGE_DELETE;

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

    const actions = eligibleActions.length > 0 ? React.createElement("div", {
      className: "nuclide-changed-file-actions"
    }, eligibleActions) : null;
    const handleFileChosen = onFileChosen != null ? () => onFileChosen(filePath) : null;

    const statusName = _nuclideVcsBase().FileChangeStatusToLabel[fileStatus];

    const checkbox = isChecked != null ? React.createElement(_Checkbox().Checkbox, {
      className: "nuclide-changed-file-checkbox",
      checked: isChecked,
      onChange: this._onCheckboxChange
    }) : null;
    let relativePath = filePath;

    try {
      relativePath = _nuclideUri().default.relative(rootPath, filePath);
    } catch (err) {
      (0, _log4js().getLogger)('nuclide-ui').error('ChangedFile failed to get relative path for %s, %s\nDid the cwd change? ', rootPath, filePath, err);
    }

    return React.createElement("li", {
      "data-name": displayPath,
      "data-path": filePath,
      "data-root": this.props.rootPath,
      "data-enable-diff-view": enableDiffView || null,
      "data-enable-forget": enableForget || null,
      "data-enable-delete": enableDelete || null,
      "data-enable-add": enableAdd || null,
      "data-enable-revert": enableRestore || null,
      className: this._getFileClassname(),
      key: filePath
    }, checkbox, React.createElement("span", {
      className: "nuclide-changed-file-name",
      onClick: handleFileChosen
    }, React.createElement(_Icon().Icon, {
      className: "nuclide-changed-file-name-icon",
      icon: _nuclideVcsBase().FileChangeStatusToIcon[fileStatus]
    }), React.createElement(_PathWithFileIcon().default, {
      path: displayPath,
      title: `${statusName}:${LF}${relativePath}${LF}(Click to open in Nuclide)`
    })), actions);
  }

}

exports.default = ChangedFile;

function getCommandTargetForEvent(event) {
  const {
    target
  } = event;
  return target.closest('.nuclide-changed-file') || target;
} // this will currently never get GC'd, but should only ever be created once
// If this might become a problem, consider refcounting wrt ChangedFile instances


atom.contextMenu.add({
  '.nuclide-changed-file': [{
    type: 'separator'
  }, {
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
  }, {
    type: 'separator'
  }]
});