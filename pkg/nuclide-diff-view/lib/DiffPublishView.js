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
//# sourceMappingURL=data:application/json;base64,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d0JBQWMsR0FBRywyQkFBMkIsQ0FBQztBQUM3QyxnQkFBTTtBQUFBLE9BQ1Q7O0FBRUQsVUFBTSxhQUFhLEdBQ2pCOzs7QUFDRSxtQkFBUyxFQUFFLDZCQUFXLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBQyxDQUFDLEFBQUM7QUFDaEQsY0FBSSxFQUFFLGdDQUFZLEtBQUssQUFBQztBQUN4QixvQkFBVSxFQUFFLGdDQUFZLE9BQU8sQUFBQztBQUNoQyxpQkFBTyxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7QUFDOUIsa0JBQVEsRUFBRSxNQUFNLEFBQUM7UUFDaEIsY0FBYztPQUNSLEFBQ1YsQ0FBQzs7QUFFRixhQUNFOztVQUFLLFNBQVMsRUFBQyxtQkFBbUI7UUFDaEM7O1lBQUssU0FBUyxFQUFDLHdCQUF3QjtVQUNwQyxZQUFZO1NBQ1Q7UUFDTjs7WUFBUyxRQUFRLEVBQUMsUUFBUTtVQUN4Qjs7O1lBQ0csWUFBWTtXQUNEO1VBQ2Q7OztZQUNHLGFBQWE7V0FDRDtTQUNQO09BQ04sQ0FDTjtLQUNIOzs7U0EzSkcsZUFBZTtHQUFTLG9CQUFNLFNBQVM7O0FBOEo3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWZmUHVibGlzaFZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtQdWJsaXNoTW9kZVR5cGUsIFB1Ymxpc2hNb2RlU3RhdGVUeXBlfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IGFyY2FuaXN0IGZyb20gJy4uLy4uL251Y2xpZGUtYXJjYW5pc3QtY2xpZW50JztcbmltcG9ydCB7QXRvbVRleHRFZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21UZXh0RWRpdG9yJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtQdWJsaXNoTW9kZSwgUHVibGlzaE1vZGVTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBCdXR0b25TaXplcyxcbiAgQnV0dG9uVHlwZXMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5pbXBvcnQge1Rvb2xiYXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXInO1xuaW1wb3J0IHtUb29sYmFyTGVmdH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhckxlZnQnO1xuaW1wb3J0IHtUb29sYmFyUmlnaHR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJSaWdodCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFRleHRCdWZmZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtEaXNwb3NhYmxlU3Vic2NyaXB0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG50eXBlIERpZmZSZXZpc2lvblZpZXdQcm9wcyA9IHtcbiAgcmV2aXNpb246IFJldmlzaW9uSW5mbztcbn07XG5cbmNsYXNzIERpZmZSZXZpc2lvblZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlmZlJldmlzaW9uVmlld1Byb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB7aGFzaCwgdGl0bGUsIGRlc2NyaXB0aW9ufSA9IHRoaXMucHJvcHMucmV2aXNpb247XG4gICAgY29uc3QgdG9vbHRpcCA9IGAke2hhc2h9OiAke3RpdGxlfWA7XG4gICAgY29uc3QgcmV2aXNpb24gPSBhcmNhbmlzdC5nZXRQaGFicmljYXRvclJldmlzaW9uRnJvbUNvbW1pdE1lc3NhZ2UoZGVzY3JpcHRpb24pO1xuXG4gICAgcmV0dXJuIChyZXZpc2lvbiA9PSBudWxsKVxuICAgICAgPyA8c3BhbiAvPlxuICAgICAgOiAoXG4gICAgICAgIDxhIGhyZWY9e3JldmlzaW9uLnVybH0gdGl0bGU9e3Rvb2x0aXB9PlxuICAgICAgICAgIHtyZXZpc2lvbi5pZH1cbiAgICAgICAgPC9hPlxuICAgICAgKTtcbiAgfVxufVxuXG50eXBlIFByb3BzID0ge1xuICBtZXNzYWdlOiA/c3RyaW5nO1xuICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGVUeXBlO1xuICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlVHlwZTtcbiAgaGVhZFJldmlzaW9uOiA/UmV2aXNpb25JbmZvO1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG59O1xuXG5jbGFzcyBEaWZmUHVibGlzaFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIF90ZXh0QnVmZmVyOiBUZXh0QnVmZmVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAodGhpczogYW55KS5fb25DbGlja1B1Ymxpc2ggPSB0aGlzLl9vbkNsaWNrUHVibGlzaC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3RleHRCdWZmZXIgPSBuZXcgVGV4dEJ1ZmZlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbihcbiAgICAgICAgdGhpcy5wcm9wcy5kaWZmTW9kZWxcbiAgICAgICAgICAuZ2V0UHVibGlzaFVwZGF0ZXMoKVxuICAgICAgICAgIC5zdWJzY3JpYmUodGhpcy5fb25QdWJsaXNoVXBkYXRlLmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgICB0aGlzLl9zZXRQdWJsaXNoVGV4dCgpO1xuICB9XG5cbiAgX29uUHVibGlzaFVwZGF0ZShtZXNzYWdlOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl90ZXh0QnVmZmVyLmFwcGVuZChtZXNzYWdlLnRleHQpO1xuICAgIGNvbnN0IHVwZGF0ZXNFZGl0b3IgPSB0aGlzLnJlZnNbJ3B1Ymxpc2hVcGRhdGVzJ107XG4gICAgaWYgKHVwZGF0ZXNFZGl0b3IgIT0gbnVsbCkge1xuICAgICAgdXBkYXRlc0VkaXRvci5nZXRFbGVtZW50KCkuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLm1lc3NhZ2UgIT09IHByZXZQcm9wcy5tZXNzYWdlKSB7XG4gICAgICB0aGlzLl9zZXRQdWJsaXNoVGV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIC8vIFNhdmUgdGhlIGxhdGVzdCBlZGl0ZWQgcHVibGlzaCBtZXNzYWdlIGZvciBsYXlvdXQgc3dpdGNoZXMuXG4gICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2dldFB1Ymxpc2hNZXNzYWdlKCk7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgIC8vIExldCB0aGUgY29tcG9uZW50IHVubW91bnQgYmVmb3JlIHByb3BhZ2F0aW5nIHRoZSBmaW5hbCBtZXNzYWdlIGNoYW5nZSB0byB0aGUgbW9kZWwsXG4gICAgLy8gU28gdGhlIHN1YnNlcXVlbnQgY2hhbmdlIGV2ZW50IGF2b2lkcyByZS1yZW5kZXJpbmcgdGhpcyBjb21wb25lbnQuXG4gICAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB7XG4gICAgICBkaWZmTW9kZWwuc2V0UHVibGlzaE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0UHVibGlzaFRleHQoKTogdm9pZCB7XG4gICAgY29uc3QgbWVzc2FnZUVkaXRvciA9IHRoaXMucmVmc1snbWVzc2FnZSddO1xuICAgIGlmIChtZXNzYWdlRWRpdG9yICE9IG51bGwpIHtcbiAgICAgIG1lc3NhZ2VFZGl0b3IuZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5tZXNzYWdlIHx8ICcnKTtcbiAgICB9XG4gIH1cblxuICBfb25DbGlja1B1Ymxpc2goKTogdm9pZCB7XG4gICAgdGhpcy5fdGV4dEJ1ZmZlci5zZXRUZXh0KCcnKTtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5wdWJsaXNoRGlmZih0aGlzLl9nZXRQdWJsaXNoTWVzc2FnZSgpKTtcbiAgfVxuXG4gIF9nZXRQdWJsaXNoTWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1lc3NhZ2VFZGl0b3IgPSB0aGlzLnJlZnNbJ21lc3NhZ2UnXTtcbiAgICBpZiAobWVzc2FnZUVkaXRvciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gbWVzc2FnZUVkaXRvci5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5tZXNzYWdlIHx8ICcnO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB7cHVibGlzaE1vZGVTdGF0ZSwgcHVibGlzaE1vZGUsIGhlYWRSZXZpc2lvbn0gPSB0aGlzLnByb3BzO1xuXG4gICAgbGV0IHJldmlzaW9uVmlldztcbiAgICBpZiAoaGVhZFJldmlzaW9uICE9IG51bGwpIHtcbiAgICAgIHJldmlzaW9uVmlldyA9IDxEaWZmUmV2aXNpb25WaWV3IHJldmlzaW9uPXtoZWFkUmV2aXNpb259IC8+O1xuICAgIH1cblxuICAgIGxldCBpc0J1c3k7XG4gICAgbGV0IHB1Ymxpc2hNZXNzYWdlO1xuICAgIGxldCBzdGF0dXNFZGl0b3IgPSBudWxsO1xuXG4gICAgY29uc3QgZ2V0U3RyZWFtU3RhdHVzRWRpdG9yID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgcmVmPVwicHVibGlzaFVwZGF0ZXNcIlxuICAgICAgICAgIHRleHRCdWZmZXI9e3RoaXMuX3RleHRCdWZmZXJ9XG4gICAgICAgICAgcmVhZE9ubHk9e3RydWV9XG4gICAgICAgICAgc3luY1RleHRDb250ZW50cz17ZmFsc2V9XG4gICAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0UHVibGlzaE1lc3NhZ2VFZGl0b3IgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICByZWY9XCJtZXNzYWdlXCJcbiAgICAgICAgICByZWFkT25seT17aXNCdXN5fVxuICAgICAgICAgIHN5bmNUZXh0Q29udGVudHM9e2ZhbHNlfVxuICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfTtcblxuICAgIHN3aXRjaCAocHVibGlzaE1vZGVTdGF0ZSkge1xuICAgICAgY2FzZSBQdWJsaXNoTW9kZVN0YXRlLlJFQURZOlxuICAgICAgICBpc0J1c3kgPSBmYWxzZTtcbiAgICAgICAgaWYgKHB1Ymxpc2hNb2RlID09PSBQdWJsaXNoTW9kZS5DUkVBVEUpIHtcbiAgICAgICAgICBwdWJsaXNoTWVzc2FnZSA9ICdQdWJsaXNoIFBoYWJyaWNhdG9yIFJldmlzaW9uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwdWJsaXNoTWVzc2FnZSA9ICdVcGRhdGUgUGhhYnJpY2F0b3IgUmV2aXNpb24nO1xuICAgICAgICB9XG4gICAgICAgIHN0YXR1c0VkaXRvciA9IGdldFB1Ymxpc2hNZXNzYWdlRWRpdG9yKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQdWJsaXNoTW9kZVN0YXRlLkxPQURJTkdfUFVCTElTSF9NRVNTQUdFOlxuICAgICAgICBpc0J1c3kgPSB0cnVlO1xuICAgICAgICBwdWJsaXNoTWVzc2FnZSA9ICdMb2FkaW5nLi4uJztcbiAgICAgICAgc3RhdHVzRWRpdG9yID0gZ2V0UHVibGlzaE1lc3NhZ2VFZGl0b3IoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFB1Ymxpc2hNb2RlU3RhdGUuQVdBSVRJTkdfUFVCTElTSDpcbiAgICAgICAgaXNCdXN5ID0gdHJ1ZTtcbiAgICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnUHVibGlzaGluZy4uLic7XG4gICAgICAgIHN0YXR1c0VkaXRvciA9IGdldFN0cmVhbVN0YXR1c0VkaXRvcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUHVibGlzaE1vZGVTdGF0ZS5QVUJMSVNIX0VSUk9SOlxuICAgICAgICBpc0J1c3kgPSBmYWxzZTtcbiAgICAgICAgc3RhdHVzRWRpdG9yID0gZ2V0U3RyZWFtU3RhdHVzRWRpdG9yKCk7XG4gICAgICAgIHB1Ymxpc2hNZXNzYWdlID0gJ0ZpeGVkPyAtIFJldHJ5IFB1Ymxpc2hpbmcnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaXNoQnV0dG9uID0gKFxuICAgICAgPEJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoeydidG4tcHJvZ3Jlc3MnOiBpc0J1c3l9KX1cbiAgICAgICAgc2l6ZT17QnV0dG9uU2l6ZXMuU01BTEx9XG4gICAgICAgIGJ1dHRvblR5cGU9e0J1dHRvblR5cGVzLlNVQ0NFU1N9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2tQdWJsaXNofVxuICAgICAgICBkaXNhYmxlZD17aXNCdXN5fT5cbiAgICAgICAge3B1Ymxpc2hNZXNzYWdlfVxuICAgICAgPC9CdXR0b24+XG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi1tb2RlXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWVzc2FnZS1lZGl0b3Itd3JhcHBlclwiPlxuICAgICAgICAgIHtzdGF0dXNFZGl0b3J9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8VG9vbGJhciBsb2NhdGlvbj1cImJvdHRvbVwiPlxuICAgICAgICAgIDxUb29sYmFyTGVmdD5cbiAgICAgICAgICAgIHtyZXZpc2lvblZpZXd9XG4gICAgICAgICAgPC9Ub29sYmFyTGVmdD5cbiAgICAgICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICAgICAge3B1Ymxpc2hCdXR0b259XG4gICAgICAgICAgPC9Ub29sYmFyUmlnaHQ+XG4gICAgICAgIDwvVG9vbGJhcj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmUHVibGlzaFZpZXc7XG4iXX0=