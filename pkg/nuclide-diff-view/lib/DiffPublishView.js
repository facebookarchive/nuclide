Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideArcanistRpcLibUtils;

function _load_nuclideArcanistRpcLibUtils() {
  return _nuclideArcanistRpcLibUtils = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _nuclideUiAtomTextEditor;

function _load_nuclideUiAtomTextEditor() {
  return _nuclideUiAtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _nuclideUiAtomInput;

function _load_nuclideUiAtomInput() {
  return _nuclideUiAtomInput = require('../../nuclide-ui/AtomInput');
}

var _nuclideUiCheckbox;

function _load_nuclideUiCheckbox() {
  return _nuclideUiCheckbox = require('../../nuclide-ui/Checkbox');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiToolbar;

function _load_nuclideUiToolbar() {
  return _nuclideUiToolbar = require('../../nuclide-ui/Toolbar');
}

var _nuclideUiToolbarLeft;

function _load_nuclideUiToolbarLeft() {
  return _nuclideUiToolbarLeft = require('../../nuclide-ui/ToolbarLeft');
}

var _nuclideUiToolbarRight;

function _load_nuclideUiToolbarRight() {
  return _nuclideUiToolbarRight = require('../../nuclide-ui/ToolbarRight');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var DiffRevisionView = (function (_React$Component) {
  _inherits(DiffRevisionView, _React$Component);

  function DiffRevisionView() {
    _classCallCheck(this, DiffRevisionView);

    _get(Object.getPrototypeOf(DiffRevisionView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiffRevisionView, [{
    key: 'render',
    value: function render() {
      var commitMessage = this.props.commitMessage;

      var commitTitle = commitMessage.split(/\n/)[0];
      var revision = (0, (_nuclideArcanistRpcLibUtils || _load_nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(commitMessage);

      return revision == null ? (_reactForAtom || _load_reactForAtom()).React.createElement('span', null) : (_reactForAtom || _load_reactForAtom()).React.createElement(
        'a',
        { href: revision.url, title: commitTitle },
        revision.name
      );
    }
  }]);

  return DiffRevisionView;
})((_reactForAtom || _load_reactForAtom()).React.Component);

var DiffPublishView = (function (_React$Component2) {
  _inherits(DiffPublishView, _React$Component2);

  function DiffPublishView(props) {
    _classCallCheck(this, DiffPublishView);

    _get(Object.getPrototypeOf(DiffPublishView.prototype), 'constructor', this).call(this, props);
    this._onClickBack = this._onClickBack.bind(this);
    this.__onClickPublish = this.__onClickPublish.bind(this);
    this._onTogglePrepare = this._onTogglePrepare.bind(this);
    this.state = {
      hasLintError: false,
      isPrepareMode: false
    };
  }

  _createClass(DiffPublishView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._textBuffer = new (_atom || _load_atom()).TextBuffer();
      this._subscriptions = new (_atom || _load_atom()).CompositeDisposable();

      this._subscriptions.add(new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this.props.diffModel.getPublishUpdates().subscribe(this._onPublishUpdate.bind(this))));
      this.__populatePublishText();
    }
  }, {
    key: '_onPublishUpdate',
    value: function _onPublishUpdate(message) {
      var level = message.level;
      var text = message.text;

      // If its a error log with lint we show the lint excuse input
      if (level === 'error' && text.includes('Usage Exception: Lint')) {
        this.setState({ hasLintError: true });
      }
      this._textBuffer.append(text);
      var updatesEditor = this.refs.publishUpdates;
      if (updatesEditor != null) {
        updatesEditor.getElement().scrollToBottom();
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.props.message !== prevProps.message || this.props.publishModeState !== prevProps.publishModeState) {
        this.__populatePublishText();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }, {
    key: '__populatePublishText',
    value: function __populatePublishText() {
      var messageEditor = this.refs.message;
      if (messageEditor != null) {
        messageEditor.getTextBuffer().setText(this.props.message || '');
      }
    }
  }, {
    key: '__onClickPublish',
    value: function __onClickPublish() {
      this._textBuffer.setText('');
      this.setState({ hasLintError: false });

      var isPrepareChecked = this.state.isPrepareMode;

      var lintExcuse = undefined;
      if (this.refs.excuse != null) {
        lintExcuse = this.refs.excuse.getText();
      }
      this.props.diffModel.publishDiff(this.__getPublishMessage() || '', isPrepareChecked, lintExcuse);
    }
  }, {
    key: '__getPublishMessage',
    value: function __getPublishMessage() {
      var messageEditor = this.refs.message;
      if (messageEditor != null) {
        return messageEditor.getTextBuffer().getText();
      } else {
        return this.props.message;
      }
    }
  }, {
    key: '__getStatusEditor',
    value: function __getStatusEditor() {
      var _this = this;

      var publishModeState = this.props.publishModeState;

      var isBusy = undefined;
      var statusEditor = undefined;

      var getStreamStatusEditor = function getStreamStatusEditor() {
        return (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomTextEditor || _load_nuclideUiAtomTextEditor()).AtomTextEditor, {
          ref: 'publishUpdates',
          textBuffer: _this._textBuffer,
          readOnly: true,
          syncTextContents: false,
          gutterHidden: true
        });
      };

      var getPublishMessageEditor = function getPublishMessageEditor() {
        return (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomTextEditor || _load_nuclideUiAtomTextEditor()).AtomTextEditor, {
          ref: 'message',
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
  }, {
    key: '__getExcuseInput',
    value: function __getExcuseInput() {
      if (this.state.hasLintError === true) {
        return (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
          className: 'nuclide-diff-view-lint-excuse',
          placeholderText: 'Lint excuse',
          ref: 'excuse',
          size: 'lg'
        });
      }

      return null;
    }
  }, {
    key: '_getToolbar',
    value: function _getToolbar() {
      var _props = this.props;
      var publishModeState = _props.publishModeState;
      var publishMode = _props.publishMode;
      var headCommitMessage = _props.headCommitMessage;

      var revisionView = undefined;
      if (headCommitMessage != null) {
        revisionView = (_reactForAtom || _load_reactForAtom()).React.createElement(DiffRevisionView, { commitMessage: headCommitMessage });
      }
      var isBusy = undefined;
      var publishMessage = undefined;
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

      var publishButton = (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiButton || _load_nuclideUiButton()).Button,
        {
          className: (0, (_classnames || _load_classnames()).default)({ 'btn-progress': isBusy }),
          size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
          buttonType: (_nuclideUiButton || _load_nuclideUiButton()).ButtonTypes.SUCCESS,
          onClick: this.__onClickPublish,
          disabled: isBusy },
        publishMessage
      );

      var prepareOptionElement = undefined;
      if (publishMode === (_constants || _load_constants()).PublishMode.CREATE) {
        prepareOptionElement = (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
          checked: this.state.isPrepareMode,
          className: 'padded',
          label: 'Prepare',
          tabIndex: '-1',
          onChange: this._onTogglePrepare
        });
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'publish-toolbar-wrapper' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiToolbar || _load_nuclideUiToolbar()).Toolbar,
          { location: 'bottom' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiToolbarLeft || _load_nuclideUiToolbarLeft()).ToolbarLeft,
            { className: 'nuclide-diff-view-publish-toolbar-left' },
            revisionView,
            prepareOptionElement,
            this.__getExcuseInput()
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiToolbarRight || _load_nuclideUiToolbarRight()).ToolbarRight,
            null,
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButton || _load_nuclideUiButton()).Button,
              {
                size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
                onClick: this._onClickBack },
              'Back'
            ),
            publishButton
          )
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-mode' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          this.__getStatusEditor()
        ),
        this._getToolbar()
      );
    }
  }, {
    key: '_onTogglePrepare',
    value: function _onTogglePrepare(isChecked) {
      this.setState({ isPrepareMode: isChecked });
    }
  }, {
    key: '_onClickBack',
    value: function _onClickBack() {
      var publishModeState = this.props.publishModeState;

      var diffMode = publishModeState === (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR ? (_constants || _load_constants()).DiffMode.PUBLISH_MODE : (_constants || _load_constants()).DiffMode.BROWSE_MODE;
      this.props.diffModel.setViewMode(diffMode);
    }
  }]);

  return DiffPublishView;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = DiffPublishView;
module.exports = exports.default;