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

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarLeft = require('../../nuclide-ui/lib/ToolbarLeft');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

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

  function DiffPublishView(props) {
    _classCallCheck(this, DiffPublishView);

    _get(Object.getPrototypeOf(DiffPublishView.prototype), 'constructor', this).call(this, props);
    this._onClickPublish = this._onClickPublish.bind(this);
  }

  _createClass(DiffPublishView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._setPublishText();
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
      this.refs['message'].getTextBuffer().setText(this.props.message || '');
    }
  }, {
    key: '_onClickPublish',
    value: function _onClickPublish() {
      this.props.diffModel.publishDiff(this._getPublishMessage());
    }
  }, {
    key: '_getPublishMessage',
    value: function _getPublishMessage() {
      return this.refs['message'].getTextBuffer().getText();
    }
  }, {
    key: 'render',
    value: function render() {
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
      switch (publishModeState) {
        case _constants.PublishModeState.READY:
          isBusy = false;
          if (publishMode === _constants.PublishMode.CREATE) {
            publishMessage = 'Publish Phabricator Revision';
          } else {
            publishMessage = 'Update Phabricator Revision';
          }
          break;
        case _constants.PublishModeState.LOADING_PUBLISH_MESSAGE:
          isBusy = true;
          publishMessage = 'Loading...';
          break;
        case _constants.PublishModeState.AWAITING_PUBLISH:
          isBusy = true;
          publishMessage = 'Publishing...';
          break;
      }

      var publishButton = _reactForAtom.React.createElement(
        'button',
        {
          className: (0, _classnames2['default'])('btn btn-sm btn-success', { 'btn-progress': isBusy }),
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
          _reactForAtom.React.createElement(_nuclideUiLibAtomTextEditor.AtomTextEditor, {
            ref: 'message',
            readOnly: isBusy,
            gutterHidden: true
          })
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
//# sourceMappingURL=data:application/json;base64,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O0FBcUc3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWZmUHVibGlzaFZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtQdWJsaXNoTW9kZVR5cGUsIFB1Ymxpc2hNb2RlU3RhdGVUeXBlfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IGFyY2FuaXN0IGZyb20gJy4uLy4uL251Y2xpZGUtYXJjYW5pc3QtY2xpZW50JztcbmltcG9ydCB7QXRvbVRleHRFZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21UZXh0RWRpdG9yJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtQdWJsaXNoTW9kZSwgUHVibGlzaE1vZGVTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtUb29sYmFyfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyJztcbmltcG9ydCB7VG9vbGJhckxlZnR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJMZWZ0JztcbmltcG9ydCB7VG9vbGJhclJpZ2h0fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyUmlnaHQnO1xuXG50eXBlIERpZmZSZXZpc2lvblZpZXdQcm9wcyA9IHtcbiAgcmV2aXNpb246IFJldmlzaW9uSW5mbztcbn07XG5cbmNsYXNzIERpZmZSZXZpc2lvblZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlmZlJldmlzaW9uVmlld1Byb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtoYXNoLCB0aXRsZSwgZGVzY3JpcHRpb259ID0gdGhpcy5wcm9wcy5yZXZpc2lvbjtcbiAgICBjb25zdCB0b29sdGlwID0gYCR7aGFzaH06ICR7dGl0bGV9YDtcbiAgICBjb25zdCByZXZpc2lvbiA9IGFyY2FuaXN0LmdldFBoYWJyaWNhdG9yUmV2aXNpb25Gcm9tQ29tbWl0TWVzc2FnZShkZXNjcmlwdGlvbik7XG5cbiAgICByZXR1cm4gKHJldmlzaW9uID09IG51bGwpXG4gICAgICA/IDxzcGFuIC8+XG4gICAgICA6IChcbiAgICAgICAgPGEgaHJlZj17cmV2aXNpb24udXJsfSB0aXRsZT17dG9vbHRpcH0+XG4gICAgICAgICAge3JldmlzaW9uLmlkfVxuICAgICAgICA8L2E+XG4gICAgICApO1xuICB9XG59XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG1lc3NhZ2U6ID9zdHJpbmc7XG4gIHB1Ymxpc2hNb2RlOiBQdWJsaXNoTW9kZVR5cGU7XG4gIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGVUeXBlO1xuICBoZWFkUmV2aXNpb246ID9SZXZpc2lvbkluZm87XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbmNsYXNzIERpZmZQdWJsaXNoVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2tQdWJsaXNoID0gdGhpcy5fb25DbGlja1B1Ymxpc2guYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3NldFB1Ymxpc2hUZXh0KCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLm1lc3NhZ2UgIT09IHByZXZQcm9wcy5tZXNzYWdlKSB7XG4gICAgICB0aGlzLl9zZXRQdWJsaXNoVGV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIC8vIFNhdmUgdGhlIGxhdGVzdCBlZGl0ZWQgcHVibGlzaCBtZXNzYWdlIGZvciBsYXlvdXQgc3dpdGNoZXMuXG4gICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2dldFB1Ymxpc2hNZXNzYWdlKCk7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgIC8vIExldCB0aGUgY29tcG9uZW50IHVubW91bnQgYmVmb3JlIHByb3BhZ2F0aW5nIHRoZSBmaW5hbCBtZXNzYWdlIGNoYW5nZSB0byB0aGUgbW9kZWwsXG4gICAgLy8gU28gdGhlIHN1YnNlcXVlbnQgY2hhbmdlIGV2ZW50IGF2b2lkcyByZS1yZW5kZXJpbmcgdGhpcyBjb21wb25lbnQuXG4gICAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB7XG4gICAgICBkaWZmTW9kZWwuc2V0UHVibGlzaE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0UHVibGlzaFRleHQoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5tZXNzYWdlIHx8ICcnKTtcbiAgfVxuXG4gIF9vbkNsaWNrUHVibGlzaCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5wdWJsaXNoRGlmZih0aGlzLl9nZXRQdWJsaXNoTWVzc2FnZSgpKTtcbiAgfVxuXG4gIF9nZXRQdWJsaXNoTWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge3B1Ymxpc2hNb2RlU3RhdGUsIHB1Ymxpc2hNb2RlLCBoZWFkUmV2aXNpb259ID0gdGhpcy5wcm9wcztcblxuICAgIGxldCByZXZpc2lvblZpZXc7XG4gICAgaWYgKGhlYWRSZXZpc2lvbiAhPSBudWxsKSB7XG4gICAgICByZXZpc2lvblZpZXcgPSA8RGlmZlJldmlzaW9uVmlldyByZXZpc2lvbj17aGVhZFJldmlzaW9ufSAvPjtcbiAgICB9XG5cbiAgICBsZXQgaXNCdXN5O1xuICAgIGxldCBwdWJsaXNoTWVzc2FnZTtcbiAgICBzd2l0Y2ggKHB1Ymxpc2hNb2RlU3RhdGUpIHtcbiAgICAgIGNhc2UgUHVibGlzaE1vZGVTdGF0ZS5SRUFEWTpcbiAgICAgICAgaXNCdXN5ID0gZmFsc2U7XG4gICAgICAgIGlmIChwdWJsaXNoTW9kZSA9PT0gUHVibGlzaE1vZGUuQ1JFQVRFKSB7XG4gICAgICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnUHVibGlzaCBQaGFicmljYXRvciBSZXZpc2lvbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnVXBkYXRlIFBoYWJyaWNhdG9yIFJldmlzaW9uJztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUHVibGlzaE1vZGVTdGF0ZS5MT0FESU5HX1BVQkxJU0hfTUVTU0FHRTpcbiAgICAgICAgaXNCdXN5ID0gdHJ1ZTtcbiAgICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnTG9hZGluZy4uLic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQdWJsaXNoTW9kZVN0YXRlLkFXQUlUSU5HX1BVQkxJU0g6XG4gICAgICAgIGlzQnVzeSA9IHRydWU7XG4gICAgICAgIHB1Ymxpc2hNZXNzYWdlID0gJ1B1Ymxpc2hpbmcuLi4nO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaXNoQnV0dG9uID0gKFxuICAgICAgPGJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoJ2J0biBidG4tc20gYnRuLXN1Y2Nlc3MnLCB7J2J0bi1wcm9ncmVzcyc6IGlzQnVzeX0pfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrUHVibGlzaH1cbiAgICAgICAgZGlzYWJsZWQ9e2lzQnVzeX0+XG4gICAgICAgIHtwdWJsaXNoTWVzc2FnZX1cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtbW9kZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtZWRpdG9yLXdyYXBwZXJcIj5cbiAgICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICAgIHJlZj1cIm1lc3NhZ2VcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e2lzQnVzeX1cbiAgICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPFRvb2xiYXIgbG9jYXRpb249XCJib3R0b21cIj5cbiAgICAgICAgICA8VG9vbGJhckxlZnQ+XG4gICAgICAgICAgICB7cmV2aXNpb25WaWV3fVxuICAgICAgICAgIDwvVG9vbGJhckxlZnQ+XG4gICAgICAgICAgPFRvb2xiYXJSaWdodD5cbiAgICAgICAgICAgIHtwdWJsaXNoQnV0dG9ufVxuICAgICAgICAgIDwvVG9vbGJhclJpZ2h0PlxuICAgICAgICA8L1Rvb2xiYXI+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlB1Ymxpc2hWaWV3O1xuIl19