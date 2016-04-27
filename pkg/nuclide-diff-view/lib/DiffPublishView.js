var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideArcanistClient = require('../../nuclide-arcanist-client');

var _nuclideArcanistClient2 = _interopRequireDefault(_nuclideArcanistClient);

var _nuclideUiLibAtomTextEditor = require('../../nuclide-ui/lib/AtomTextEditor');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _constants = require('./constants');

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarLeft = require('../../nuclide-ui/lib/ToolbarLeft');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

var _atom = require('atom');

var _nuclideCommons = require('../../nuclide-commons');

var DiffRevisionView = (function (_React$Component) {
  _inherits(DiffRevisionView, _React$Component);

  function DiffRevisionView() {
    _classCallCheck(this, DiffRevisionView);

    _get(Object.getPrototypeOf(DiffRevisionView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiffRevisionView, [{
    key: 'render',
    value: function render() {
      var _props$revision = this.props.revision;
      var hash = _props$revision.hash;
      var title = _props$revision.title;
      var description = _props$revision.description;

      var tooltip = hash + ': ' + title;
      var revision = _nuclideArcanistClient2['default'].getPhabricatorRevisionFromCommitMessage(description);

      return revision == null ? _reactForAtom.React.createElement('span', null) : _reactForAtom.React.createElement(
        'a',
        { href: revision.url, title: tooltip },
        revision.id
      );
    }
  }]);

  return DiffRevisionView;
})(_reactForAtom.React.Component);

var DiffPublishView = (function (_React$Component2) {
  _inherits(DiffPublishView, _React$Component2);

  function DiffPublishView() {
    _classCallCheck(this, DiffPublishView);

    _get(Object.getPrototypeOf(DiffPublishView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiffPublishView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._onClickPublish = this._onClickPublish.bind(this);
      this._textBuffer = new _atom.TextBuffer();
      this._subscriptions = new _atom.CompositeDisposable();

      this._subscriptions.add(new _nuclideCommons.DisposableSubscription(this.props.diffModel.getPublishUpdates().subscribe(this._onPublishUpdate.bind(this))));
      this._setPublishText();
    }
  }, {
    key: '_onPublishUpdate',
    value: function _onPublishUpdate(message) {
      this._textBuffer.append(message.text);
      var updatesEditor = this.refs['publishUpdates'];
      if (updatesEditor != null) {
        updatesEditor.getElement().scrollToBottom();
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.props.message !== prevProps.message) {
        this._setPublishText();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
      // Save the latest edited publish message for layout switches.
      var message = this._getPublishMessage();
      var diffModel = this.props.diffModel;

      // Let the component unmount before propagating the final message change to the model,
      // So the subsequent change event avoids re-rendering this component.
      process.nextTick(function () {
        diffModel.setPublishMessage(message);
      });
    }
  }, {
    key: '_setPublishText',
    value: function _setPublishText() {
      var messageEditor = this.refs['message'];
      if (messageEditor != null) {
        messageEditor.getTextBuffer().setText(this.props.message || '');
      }
    }
  }, {
    key: '_onClickPublish',
    value: function _onClickPublish() {
      this._textBuffer.setText('');
      this.props.diffModel.publishDiff(this._getPublishMessage());
    }
  }, {
    key: '_getPublishMessage',
    value: function _getPublishMessage() {
      var messageEditor = this.refs['message'];
      if (messageEditor != null) {
        return messageEditor.getTextBuffer().getText();
      } else {
        return this.props.message || '';
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var _props = this.props;
      var publishModeState = _props.publishModeState;
      var publishMode = _props.publishMode;
      var headRevision = _props.headRevision;

      var revisionView = undefined;
      if (headRevision != null) {
        revisionView = _reactForAtom.React.createElement(DiffRevisionView, { revision: headRevision });
      }

      var isBusy = undefined;
      var publishMessage = undefined;
      var statusEditor = null;

      var getStreamStatusEditor = function getStreamStatusEditor() {
        return _reactForAtom.React.createElement(_nuclideUiLibAtomTextEditor.AtomTextEditor, {
          ref: 'publishUpdates',
          textBuffer: _this._textBuffer,
          readOnly: true,
          syncTextContents: false,
          gutterHidden: true
        });
      };

      var getPublishMessageEditor = function getPublishMessageEditor() {
        return _reactForAtom.React.createElement(_nuclideUiLibAtomTextEditor.AtomTextEditor, {
          ref: 'message',
          readOnly: isBusy,
          syncTextContents: false,
          gutterHidden: true
        });
      };

      switch (publishModeState) {
        case _constants.PublishModeState.READY:
          isBusy = false;
          if (publishMode === _constants.PublishMode.CREATE) {
            publishMessage = 'Publish Phabricator Revision';
          } else {
            publishMessage = 'Update Phabricator Revision';
          }
          statusEditor = getPublishMessageEditor();
          break;
        case _constants.PublishModeState.LOADING_PUBLISH_MESSAGE:
          isBusy = true;
          publishMessage = 'Loading...';
          statusEditor = getPublishMessageEditor();
          break;
        case _constants.PublishModeState.AWAITING_PUBLISH:
          isBusy = true;
          publishMessage = 'Publishing...';
          statusEditor = getStreamStatusEditor();
          break;
        case _constants.PublishModeState.PUBLISH_ERROR:
          isBusy = false;
          statusEditor = getStreamStatusEditor();
          publishMessage = 'Fixed? - Retry Publishing';
          break;
      }

      var publishButton = _reactForAtom.React.createElement(
        _nuclideUiLibButton.Button,
        {
          className: (0, _classnames2['default'])({ 'btn-progress': isBusy }),
          size: _nuclideUiLibButton.ButtonSizes.SMALL,
          buttonType: _nuclideUiLibButton.ButtonTypes.SUCCESS,
          onClick: this._onClickPublish,
          disabled: isBusy },
        publishMessage
      );

      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-mode' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          statusEditor
        ),
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbar.Toolbar,
          { location: 'bottom' },
          _reactForAtom.React.createElement(
            _nuclideUiLibToolbarLeft.ToolbarLeft,
            null,
            revisionView
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibToolbarRight.ToolbarRight,
            null,
            publishButton
          )
        )
      );
    }
  }]);

  return DiffPublishView;
})(_reactForAtom.React.Component);

module.exports = DiffPublishView;