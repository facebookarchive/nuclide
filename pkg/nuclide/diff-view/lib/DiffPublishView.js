var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _uiAtomTextEditor = require('../../ui/atom-text-editor');

var _uiAtomTextEditor2 = _interopRequireDefault(_uiAtomTextEditor);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactForAtom = require('react-for-atom');

var _constants = require('./constants');

// TODO(most): Use @mareksapota's utility when done.
var DIFF_REVISION_REGEX = /Differential Revision: (.*)/;
function getUrlFromMessage(message) {
  var diffMatch = DIFF_REVISION_REGEX.exec(message);
  return diffMatch == null ? null : diffMatch[1];
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
      var _props$revision = this.props.revision;
      var hash = _props$revision.hash;
      var title = _props$revision.title;
      var description = _props$revision.description;

      var tooltip = hash + ': ' + title;
      var url = getUrlFromMessage(description);

      return url == null ? _reactForAtom.React.createElement('span', null) : _reactForAtom.React.createElement(
        'a',
        { href: url, title: tooltip },
        url
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
      var _this = this;

      // Save the latest edited publish message for layout switches.
      var message = this._getPublishMessage();
      // Let the component unmount before propagating the final message change to the model,
      // So the subsequent change event avoids re-rendering this component.
      process.nextTick(function () {
        _this.props.diffModel.setPublishMessage(message);
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
          _reactForAtom.React.createElement(_uiAtomTextEditor2['default'], {
            ref: 'message',
            readOnly: isBusy,
            gutterHidden: true
          })
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-diff-view-toolbar nuclide-diff-view-toolbar-bottom' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'nuclide-diff-view-toolbar-left' },
            revisionView
          ),
          _reactForAtom.React.createElement(
            'div',
            { className: 'nuclide-diff-view-toolbar-right' },
            publishButton
          )
        )
      );
    }
  }]);

  return DiffPublishView;
})(_reactForAtom.React.Component);

module.exports = DiffPublishView;
//# sourceMappingURL=data:application/json;base64,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Q3pFOztjQUFLLFNBQVMsRUFBQyxnQ0FBZ0M7WUFDNUMsWUFBWTtXQUNUO1VBQ047O2NBQUssU0FBUyxFQUFDLGlDQUFpQztZQUM3QyxhQUFhO1dBQ1Y7U0FDRjtPQUNGLENBQ047S0FDSDs7O1NBakdHLGVBQWU7R0FBUyxvQkFBTSxTQUFTOztBQW9HN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGlmZlB1Ymxpc2hWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEF0b21UZXh0RWRpdG9yIGZyb20gJy4uLy4uL3VpL2F0b20tdGV4dC1lZGl0b3InO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge1B1Ymxpc2hNb2RlVHlwZSwgUHVibGlzaE1vZGVTdGF0ZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7UHVibGlzaE1vZGUsIFB1Ymxpc2hNb2RlU3RhdGV9IGZyb20gJy4vY29uc3RhbnRzJztcblxudHlwZSBEaWZmUmV2aXNpb25WaWV3UHJvcHMgPSB7XG4gIHJldmlzaW9uOiBSZXZpc2lvbkluZm87XG59O1xuXG4vLyBUT0RPKG1vc3QpOiBVc2UgQG1hcmVrc2Fwb3RhJ3MgdXRpbGl0eSB3aGVuIGRvbmUuXG5jb25zdCBESUZGX1JFVklTSU9OX1JFR0VYID0gL0RpZmZlcmVudGlhbCBSZXZpc2lvbjogKC4qKS87XG5mdW5jdGlvbiBnZXRVcmxGcm9tTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiA/c3RyaW5nIHtcbiAgY29uc3QgZGlmZk1hdGNoID0gRElGRl9SRVZJU0lPTl9SRUdFWC5leGVjKG1lc3NhZ2UpO1xuICByZXR1cm4gKGRpZmZNYXRjaCA9PSBudWxsKSA/IG51bGwgOiBkaWZmTWF0Y2hbMV07XG59XG5cbmNsYXNzIERpZmZSZXZpc2lvblZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlmZlJldmlzaW9uVmlld1Byb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtoYXNoLCB0aXRsZSwgZGVzY3JpcHRpb259ID0gdGhpcy5wcm9wcy5yZXZpc2lvbjtcbiAgICBjb25zdCB0b29sdGlwID0gYCR7aGFzaH06ICR7dGl0bGV9YDtcbiAgICBjb25zdCB1cmwgPSBnZXRVcmxGcm9tTWVzc2FnZShkZXNjcmlwdGlvbik7XG5cbiAgICByZXR1cm4gKHVybCA9PSBudWxsKVxuICAgICAgPyA8c3BhbiAvPlxuICAgICAgOiAoXG4gICAgICAgIDxhIGhyZWY9e3VybH0gdGl0bGU9e3Rvb2x0aXB9PlxuICAgICAgICAgIHt1cmx9XG4gICAgICAgIDwvYT5cbiAgICAgICk7XG4gIH1cbn1cblxudHlwZSBQcm9wcyA9IHtcbiAgbWVzc2FnZTogP3N0cmluZztcbiAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlVHlwZTtcbiAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZVR5cGU7XG4gIGhlYWRSZXZpc2lvbjogP1JldmlzaW9uSW5mbztcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuY2xhc3MgRGlmZlB1Ymxpc2hWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DbGlja1B1Ymxpc2ggPSB0aGlzLl9vbkNsaWNrUHVibGlzaC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0UHVibGlzaFRleHQoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMubWVzc2FnZSAhPT0gcHJldlByb3BzLm1lc3NhZ2UpIHtcbiAgICAgIHRoaXMuX3NldFB1Ymxpc2hUZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgLy8gU2F2ZSB0aGUgbGF0ZXN0IGVkaXRlZCBwdWJsaXNoIG1lc3NhZ2UgZm9yIGxheW91dCBzd2l0Y2hlcy5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fZ2V0UHVibGlzaE1lc3NhZ2UoKTtcbiAgICAvLyBMZXQgdGhlIGNvbXBvbmVudCB1bm1vdW50IGJlZm9yZSBwcm9wYWdhdGluZyB0aGUgZmluYWwgbWVzc2FnZSBjaGFuZ2UgdG8gdGhlIG1vZGVsLFxuICAgIC8vIFNvIHRoZSBzdWJzZXF1ZW50IGNoYW5nZSBldmVudCBhdm9pZHMgcmUtcmVuZGVyaW5nIHRoaXMgY29tcG9uZW50LlxuICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0UHVibGlzaE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0UHVibGlzaFRleHQoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5tZXNzYWdlIHx8ICcnKTtcbiAgfVxuXG4gIF9vbkNsaWNrUHVibGlzaCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5wdWJsaXNoRGlmZih0aGlzLl9nZXRQdWJsaXNoTWVzc2FnZSgpKTtcbiAgfVxuXG4gIF9nZXRQdWJsaXNoTWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge3B1Ymxpc2hNb2RlU3RhdGUsIHB1Ymxpc2hNb2RlLCBoZWFkUmV2aXNpb259ID0gdGhpcy5wcm9wcztcblxuICAgIGxldCByZXZpc2lvblZpZXc7XG4gICAgaWYgKGhlYWRSZXZpc2lvbiAhPSBudWxsKSB7XG4gICAgICByZXZpc2lvblZpZXcgPSA8RGlmZlJldmlzaW9uVmlldyByZXZpc2lvbj17aGVhZFJldmlzaW9ufSAvPjtcbiAgICB9XG5cbiAgICBsZXQgaXNCdXN5O1xuICAgIGxldCBwdWJsaXNoTWVzc2FnZTtcbiAgICBzd2l0Y2ggKHB1Ymxpc2hNb2RlU3RhdGUpIHtcbiAgICAgIGNhc2UgUHVibGlzaE1vZGVTdGF0ZS5SRUFEWTpcbiAgICAgICAgaXNCdXN5ID0gZmFsc2U7XG4gICAgICAgIGlmIChwdWJsaXNoTW9kZSA9PT0gUHVibGlzaE1vZGUuQ1JFQVRFKSB7XG4gICAgICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnUHVibGlzaCBQaGFicmljYXRvciBSZXZpc2lvbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnVXBkYXRlIFBoYWJyaWNhdG9yIFJldmlzaW9uJztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUHVibGlzaE1vZGVTdGF0ZS5MT0FESU5HX1BVQkxJU0hfTUVTU0FHRTpcbiAgICAgICAgaXNCdXN5ID0gdHJ1ZTtcbiAgICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnTG9hZGluZy4uLic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQdWJsaXNoTW9kZVN0YXRlLkFXQUlUSU5HX1BVQkxJU0g6XG4gICAgICAgIGlzQnVzeSA9IHRydWU7XG4gICAgICAgIHB1Ymxpc2hNZXNzYWdlID0gJ1B1Ymxpc2hpbmcuLi4nO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaXNoQnV0dG9uID0gKFxuICAgICAgPGJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoJ2J0biBidG4tc20gYnRuLXN1Y2Nlc3MnLCB7J2J0bi1wcm9ncmVzcyc6IGlzQnVzeX0pfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrUHVibGlzaH1cbiAgICAgICAgZGlzYWJsZWQ9e2lzQnVzeX0+XG4gICAgICAgIHtwdWJsaXNoTWVzc2FnZX1cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtbW9kZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtZWRpdG9yLXdyYXBwZXJcIj5cbiAgICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICAgIHJlZj1cIm1lc3NhZ2VcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e2lzQnVzeX1cbiAgICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyIG51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXItYm90dG9tXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICAgIHtyZXZpc2lvblZpZXd9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLXJpZ2h0XCI+XG4gICAgICAgICAgICB7cHVibGlzaEJ1dHRvbn1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlB1Ymxpc2hWaWV3O1xuIl19