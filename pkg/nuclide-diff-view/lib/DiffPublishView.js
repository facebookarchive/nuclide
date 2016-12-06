'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-arcanist-rpc/lib/utils');
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

var _reactForAtom = require('react-for-atom');

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

class DiffRevisionView extends _reactForAtom.React.Component {

  render() {
    const { commitMessage } = this.props;
    const commitTitle = commitMessage.split(/\n/)[0];
    const revision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(commitMessage);

    return revision == null ? _reactForAtom.React.createElement('span', null) : _reactForAtom.React.createElement(
      'a',
      { href: revision.url, title: commitTitle },
      revision.name
    );
  }
}class DiffPublishView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._onClickBack = this._onClickBack.bind(this);
    this.__onClickPublish = this.__onClickPublish.bind(this);
    this._onTogglePrepare = this._onTogglePrepare.bind(this);
    this._toggleDockPublishConfig = this._toggleDockPublishConfig.bind(this);
    this.state = {
      isPrepareMode: false
    };
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
    const isPrepareChecked = this.state.isPrepareMode;

    this.props.diffModel.publishDiff(this.__getPublishMessage() || '', isPrepareChecked, null);
  }

  __getPublishMessage() {
    const messageEditor = this.refs.message;
    return messageEditor == null ? this.props.message : messageEditor.getTextBuffer().getText();
  }

  __getStatusEditor() {
    const { publishModeState } = this.props;
    const isBusy = publishModeState === (_constants || _load_constants()).PublishModeState.LOADING_PUBLISH_MESSAGE || publishModeState === (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH;
    return _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
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
      publishMode,
      publishModeState,
      shouldDockPublishView
    } = this.props;
    let revisionView;
    if (headCommitMessage != null) {
      revisionView = _reactForAtom.React.createElement(DiffRevisionView, { commitMessage: headCommitMessage });
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

    const publishButton = _reactForAtom.React.createElement(
      (_Button || _load_Button()).Button,
      {
        className: (0, (_classnames || _load_classnames()).default)({ 'btn-progress': isBusy }),
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
        onClick: this.__onClickPublish,
        disabled: isBusy },
      publishMessage
    );

    const toggleDockButton = _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
      icon: shouldDockPublishView ? 'move-up' : 'move-down',
      onClick: this._toggleDockPublishConfig,
      title: 'Dock or Popup view'
    });

    const backButton = shouldDockPublishView ? _reactForAtom.React.createElement(
      (_Button || _load_Button()).Button,
      {
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        onClick: this._onClickBack },
      'Back'
    ) : null;

    let prepareOptionElement;
    if (publishMode === (_constants || _load_constants()).PublishMode.CREATE) {
      prepareOptionElement = _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: this.state.isPrepareMode,
        className: 'padded',
        label: 'Prepare',
        tabIndex: '-1',
        onChange: this._onTogglePrepare
      });
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'publish-toolbar-wrapper' },
      _reactForAtom.React.createElement(
        (_Toolbar || _load_Toolbar()).Toolbar,
        { location: 'bottom' },
        _reactForAtom.React.createElement(
          (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
          { className: 'nuclide-diff-view-publish-toolbar-left' },
          revisionView,
          prepareOptionElement
        ),
        _reactForAtom.React.createElement(
          (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
          null,
          _reactForAtom.React.createElement(
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
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-mode' },
      _reactForAtom.React.createElement(
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

  _onTogglePrepare(isChecked) {
    this.setState({ isPrepareMode: isChecked });
  }

  _onClickBack() {
    const { publishModeState } = this.props;
    const diffMode = publishModeState === (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR ? (_constants || _load_constants()).DiffMode.PUBLISH_MODE : (_constants || _load_constants()).DiffMode.BROWSE_MODE;
    this.props.diffModel.setViewMode(diffMode);
  }
}
exports.default = DiffPublishView;
module.exports = exports['default'];