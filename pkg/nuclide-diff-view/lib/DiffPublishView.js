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
exports.default = undefined;

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
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

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let DiffRevisionView = class DiffRevisionView extends _reactForAtom.React.Component {

  render() {
    const commitMessage = this.props.commitMessage;

    const commitTitle = commitMessage.split(/\n/)[0];
    const revision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(commitMessage);

    return revision == null ? _reactForAtom.React.createElement('span', null) : _reactForAtom.React.createElement(
      'a',
      { href: revision.url, title: commitTitle },
      revision.name
    );
  }
};
let DiffPublishView = class DiffPublishView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._onClickBack = this._onClickBack.bind(this);
    this.__onClickPublish = this.__onClickPublish.bind(this);
    this._onTogglePrepare = this._onTogglePrepare.bind(this);
    this.state = {
      hasLintError: false,
      isPrepareMode: false
    };
  }

  componentDidMount() {
    this._textBuffer = new _atom.TextBuffer();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this.props.diffModel.getPublishUpdates().subscribe(this._onPublishUpdate.bind(this)));
    this.__populatePublishText();
  }

  _onPublishUpdate(message) {
    const text = message.text;
    // If the messages contain a lint error or warning show lint input

    if ((_constants || _load_constants()).LintErrorMessages.some(error => text.includes(error))) {
      this.setState({ hasLintError: true });
    }
    this._textBuffer.append(text);
    const updatesEditor = this.refs.publishUpdates;
    if (updatesEditor != null) {
      updatesEditor.getElement().scrollToBottom();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.message !== prevProps.message || this.props.publishModeState !== prevProps.publishModeState) {
      this.__populatePublishText();
    }
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  __populatePublishText() {
    const messageEditor = this.refs.message;
    if (messageEditor != null) {
      messageEditor.getTextBuffer().setText(this.props.message || '');
    }
  }

  __onClickPublish() {
    this._textBuffer.setText('');
    this.setState({ hasLintError: false });

    const isPrepareChecked = this.state.isPrepareMode;

    let lintExcuse;
    if (this.refs.excuse != null) {
      lintExcuse = this.refs.excuse.getText();
    }
    this.props.diffModel.publishDiff(this.__getPublishMessage() || '', isPrepareChecked, lintExcuse);
  }

  __getPublishMessage() {
    const messageEditor = this.refs.message;
    if (messageEditor != null) {
      return messageEditor.getTextBuffer().getText();
    } else {
      return this.props.message;
    }
  }

  __getStatusEditor() {
    const publishModeState = this.props.publishModeState;

    let isBusy;
    let statusEditor;

    const getStreamStatusEditor = () => {
      return _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        ref: 'publishUpdates',
        softWrapped: true,
        textBuffer: this._textBuffer,
        readOnly: true,
        syncTextContents: false,
        gutterHidden: true
      });
    };

    const getPublishMessageEditor = () => {
      return _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        ref: 'message',
        softWrapped: true,
        readOnly: isBusy,
        syncTextContents: false,
        gutterHidden: true
      });
    };

    switch (publishModeState) {
      case (_constants || _load_constants()).PublishModeState.READY:
        isBusy = false;
        statusEditor = getPublishMessageEditor();
        break;
      case (_constants || _load_constants()).PublishModeState.LOADING_PUBLISH_MESSAGE:
        isBusy = true;
        statusEditor = getPublishMessageEditor();
        break;
      case (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH:
        isBusy = true;
        statusEditor = getStreamStatusEditor();
        break;
      case (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR:
        isBusy = false;
        statusEditor = getStreamStatusEditor();
        break;
      default:
        throw new Error('Invalid publish mode!');
    }

    return statusEditor;
  }

  __getExcuseInput() {
    if (this.state.hasLintError === true) {
      return _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        className: 'nuclide-diff-view-lint-excuse',
        placeholderText: 'Lint excuse',
        ref: 'excuse',
        size: 'lg'
      });
    }

    return null;
  }

  _getToolbar() {
    var _props = this.props;
    const publishModeState = _props.publishModeState,
          publishMode = _props.publishMode,
          headCommitMessage = _props.headCommitMessage;

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
        buttonType: (_Button || _load_Button()).ButtonTypes.SUCCESS,
        onClick: this.__onClickPublish,
        disabled: isBusy },
      publishMessage
    );

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
          prepareOptionElement,
          this.__getExcuseInput()
        ),
        _reactForAtom.React.createElement(
          (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
          null,
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            {
              size: (_Button || _load_Button()).ButtonSizes.SMALL,
              onClick: this._onClickBack },
            'Back'
          ),
          publishButton
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

  _onTogglePrepare(isChecked) {
    this.setState({ isPrepareMode: isChecked });
  }

  _onClickBack() {
    const publishModeState = this.props.publishModeState;

    const diffMode = publishModeState === (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR ? (_constants || _load_constants()).DiffMode.PUBLISH_MODE : (_constants || _load_constants()).DiffMode.BROWSE_MODE;
    this.props.diffModel.setViewMode(diffMode);
  }
};
exports.default = DiffPublishView;
module.exports = exports['default'];