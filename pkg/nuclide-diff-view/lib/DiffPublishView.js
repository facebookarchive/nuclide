'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../nuclide-ui/add-tooltip'));
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('../../nuclide-ui/Toolbar');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('../../nuclide-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('../../nuclide-ui/ToolbarRight');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DiffRevisionView extends _react.default.Component {

  render() {
    const { commitMessage } = this.props;
    const commitTitle = commitMessage.split(/\n/)[0];
    const revision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(commitMessage);

    return revision == null ? _react.default.createElement('span', null) : _react.default.createElement(
      'a',
      { href: revision.url, title: commitTitle },
      revision.name
    );
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

class DiffPublishView extends _react.default.Component {

  constructor(props) {
    super(props);
    this._onClickBack = this._onClickBack.bind(this);
    this.__onClickPublish = this.__onClickPublish.bind(this);
    this._onTogglePrepare = this._onTogglePrepare.bind(this);
    this._onLintExcuseChange = this._onLintExcuseChange.bind(this);
    this._toggleDockPublishConfig = this._toggleDockPublishConfig.bind(this);
    this._onToggleVerbatim = this._onToggleVerbatim.bind(this);
  }

  componentDidMount() {
    this.__populatePublishText();
  }

  componentDidUpdate(prevProps) {
    if (this.props.message !== prevProps.message || this.props.publishModeState !== prevProps.publishModeState) {
      this.__populatePublishText();
    }
  }

  __populatePublishText() {
    const messageEditor = this.refs.message;
    if (messageEditor != null) {
      messageEditor.getTextBuffer().setText(this.props.message || '');
    }
  }

  __onClickPublish() {
    const isPrepareChecked = this.props.isPrepareMode;
    this.props.diffModel.publishDiff(this.__getPublishMessage() || '', isPrepareChecked);
  }

  __getPublishMessage() {
    const messageEditor = this.refs.message;
    return messageEditor == null ? this.props.message : messageEditor.getTextBuffer().getText();
  }

  __getStatusEditor() {
    const { publishModeState } = this.props;
    const isBusy = publishModeState === (_constants || _load_constants()).PublishModeState.LOADING_PUBLISH_MESSAGE || publishModeState === (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH;
    return _react.default.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
      grammar: atom.grammars.grammarForScopeName('source.fb-arcanist-editor'),
      ref: 'message',
      softWrapped: true,
      readOnly: isBusy,
      syncTextContents: false,
      gutterHidden: true
    });
  }

  _getToolbar() {
    const {
      headCommitMessage,
      isPrepareMode,
      lintExcuse,
      publishMode,
      publishModeState,
      shouldDockPublishView,
      verbatimModeEnabled
    } = this.props;
    let revisionView;
    if (headCommitMessage != null) {
      revisionView = _react.default.createElement(DiffRevisionView, { commitMessage: headCommitMessage });
    }
    let isBusy;
    let publishMessage;
    switch (publishModeState) {
      case (_constants || _load_constants()).PublishModeState.READY:
        isBusy = false;
        if (publishMode === (_constants || _load_constants()).PublishMode.CREATE) {
          publishMessage = 'Publish Phabricator Revision';
        } else {
          publishMessage = 'Update Phabricator Revision';
        }
        break;
      case (_constants || _load_constants()).PublishModeState.LOADING_PUBLISH_MESSAGE:
        isBusy = true;
        publishMessage = 'Loading...';
        break;
      case (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH:
        isBusy = true;
        publishMessage = 'Publishing...';
        break;
      case (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR:
        isBusy = false;
        publishMessage = 'Fixed? - Retry Publishing';
        break;
      default:
        throw new Error('Invalid publish mode!');
    }

    const publishButton = _react.default.createElement(
      (_Button || _load_Button()).Button,
      {
        className: (0, (_classnames || _load_classnames()).default)({ 'btn-progress': isBusy }),
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
        onClick: this.__onClickPublish,
        disabled: isBusy },
      publishMessage
    );

    const toggleDockButton = _react.default.createElement((_Button || _load_Button()).Button, {
      icon: shouldDockPublishView ? 'move-up' : 'move-down',
      onClick: this._toggleDockPublishConfig,
      title: 'Dock or Popup view'
    });

    const backButton = shouldDockPublishView ? _react.default.createElement(
      (_Button || _load_Button()).Button,
      {
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        onClick: this._onClickBack },
      'Back'
    ) : null;

    let prepareOptionElement;
    if (publishMode === (_constants || _load_constants()).PublishMode.CREATE) {
      prepareOptionElement = _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: isPrepareMode,
        className: 'padded',
        label: 'Prepare',
        tabIndex: '-1',
        onChange: this._onTogglePrepare,
        ref: (0, (_addTooltip || _load_addTooltip()).default)({
          title: 'Whether to mark the new created revision as unpublished.',
          delay: 200,
          placement: 'top'
        })
      });
    }

    let verbatimeOptionElement;
    if (publishMode === (_constants || _load_constants()).PublishMode.UPDATE) {
      verbatimeOptionElement = _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'padded',
        checked: verbatimModeEnabled,
        label: 'Verbatim',
        onChange: this._onToggleVerbatim,
        ref: (0, (_addTooltip || _load_addTooltip()).default)({
          title: 'Whether to override the diff\'s' + 'commit message on Phabricator with that of your local commit.',
          delay: 200,
          placement: 'top'
        })
      });
    }

    const lintExcuseElement = _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      className: 'nuclide-diff-view-excuse',
      size: 'sm',
      ref: (0, (_addTooltip || _load_addTooltip()).default)({
        title: 'Leave this box empty to run local lint and unit tests or ' + 'enter an excuse to skip them.',
        delay: 200,
        placement: 'top'
      }),
      onDidChange: this._onLintExcuseChange,
      placeholderText: '(Optional) Excuse',
      value: lintExcuse,
      width: 200
    });

    return _react.default.createElement(
      'div',
      { className: 'publish-toolbar-wrapper' },
      _react.default.createElement(
        (_Toolbar || _load_Toolbar()).Toolbar,
        { location: 'bottom' },
        _react.default.createElement(
          (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
          { className: 'nuclide-diff-view-publish-toolbar-left' },
          revisionView,
          verbatimeOptionElement,
          prepareOptionElement,
          lintExcuseElement
        ),
        _react.default.createElement(
          (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
          null,
          _react.default.createElement(
            (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
            { size: (_ButtonGroup || _load_ButtonGroup()).ButtonGroupSizes.SMALL },
            backButton,
            publishButton,
            toggleDockButton
          )
        )
      )
    );
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'nuclide-diff-mode' },
      _react.default.createElement(
        'div',
        { className: 'message-editor-wrapper' },
        this.__getStatusEditor()
      ),
      this._getToolbar()
    );
  }

  _toggleDockPublishConfig() {
    // Persist publish message between docked and modal views.
    this.props.diffModel.updatePublishMessage(this.__getPublishMessage());
    const shouldDockPublishView = (_featureConfig || _load_featureConfig()).default.get((_constants || _load_constants()).SHOULD_DOCK_PUBLISH_VIEW_CONFIG_KEY);
    (_featureConfig || _load_featureConfig()).default.set((_constants || _load_constants()).SHOULD_DOCK_PUBLISH_VIEW_CONFIG_KEY, !shouldDockPublishView);
  }

  _onLintExcuseChange(lintExcuse) {
    this.props.diffModel.setLintExcuse(lintExcuse);
  }

  _onTogglePrepare(isChecked) {
    this.props.diffModel.setIsPrepareMode(isChecked);
  }

  _onClickBack() {
    const { publishModeState } = this.props;
    const diffMode = publishModeState === (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR ? (_constants || _load_constants()).DiffMode.PUBLISH_MODE : (_constants || _load_constants()).DiffMode.BROWSE_MODE;
    this.props.diffModel.setViewMode(diffMode);
  }

  _onToggleVerbatim(isChecked) {
    this.props.diffModel.setVerbatimModeEnabled(isChecked);
  }
}
exports.default = DiffPublishView;