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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _reactForAtom = require('react-for-atom');

var _constants = require('./constants');

var DiffPublishView = (function (_React$Component) {
  _inherits(DiffPublishView, _React$Component);

  function DiffPublishView(props) {
    _classCallCheck(this, DiffPublishView);

    _get(Object.getPrototypeOf(DiffPublishView.prototype), 'constructor', this).call(this, props);
    this._onClickPublish = this._onClickPublish.bind(this);
  }

  _createClass(DiffPublishView, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var publishModeState = _props.publishModeState;
      var publishMode = _props.publishMode;
      var headRevision = _props.headRevision;

      var isBusy = publishModeState !== _constants.PublishModeState.READY;

      var revisionView = null;
      var publishMessage = null;
      var loadingIndicator = null;
      var progressIndicator = null;

      if (publishMode === _constants.PublishMode.CREATE) {
        publishMessage = 'Publish Phabricator Revision';
      } else {
        publishMessage = 'Update Phabricator Revision';
        if (headRevision != null) {
          revisionView = _reactForAtom.React.createElement(DiffRevisionView, { revision: headRevision });
        }
      }

      var publishButton = _reactForAtom.React.createElement(
        'button',
        { className: 'btn btn-sm btn-success pull-right',
          onClick: this._onClickPublish,
          disabled: isBusy },
        publishMessage
      );
      switch (publishModeState) {
        case _constants.PublishModeState.LOADING_PUBLISH_MESSAGE:
          loadingIndicator = _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-tiny inline-block' });
          break;
        case _constants.PublishModeState.AWAITING_PUBLISH:
          progressIndicator = _reactForAtom.React.createElement('progress', { className: 'inline-block' });
          break;
      }
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
          { className: 'padded' },
          loadingIndicator,
          progressIndicator,
          revisionView,
          publishButton
        )
      );
    }
  }, {
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
  }]);

  return DiffPublishView;
})(_reactForAtom.React.Component);

// TODO(most): Use @mareksapota's utility when done.
var DIFF_REVISION_REGEX = /Differential Revision: (.*)/;
function getUrlFromMessage(message) {
  var diffMatch = DIFF_REVISION_REGEX.exec(message);
  (0, _assert2['default'])(diffMatch != null, 'Diff View: Revision must have a valid message');
  return diffMatch[1];
}

var DiffRevisionView = (function (_React$Component2) {
  _inherits(DiffRevisionView, _React$Component2);

  function DiffRevisionView(props) {
    _classCallCheck(this, DiffRevisionView);

    _get(Object.getPrototypeOf(DiffRevisionView.prototype), 'constructor', this).call(this, props);
    this._onClickDiff = this._onClickDiff.bind(this);
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
      return _reactForAtom.React.createElement(
        'a',
        { href: url, title: tooltip, onClick: this._onClickDiff },
        url
      );
    }
  }, {
    key: '_onClickDiff',
    value: function _onClickDiff() {
      var url = getUrlFromMessage(this.props.revision.description);
      require('shell').openExternal(url);
    }
  }]);

  return DiffRevisionView;
})(_reactForAtom.React.Component);

module.exports = DiffPublishView;
//# sourceMappingURL=data:application/json;base64,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O0FBQ3BDLFVBQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzNDLGFBQ0U7O1VBQUcsSUFBSSxFQUFFLEdBQUcsQUFBQyxFQUFDLEtBQUssRUFBRSxPQUFPLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQUFBQztRQUN0RCxHQUFHO09BQ0YsQ0FDSjtLQUNIOzs7V0FFVyx3QkFBUztBQUNuQixVQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMvRCxhQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BDOzs7U0F0QkcsZ0JBQWdCO0dBQVMsb0JBQU0sU0FBUzs7QUF5QjlDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRpZmZQdWJsaXNoVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBBdG9tVGV4dEVkaXRvciBmcm9tICcuLi8uLi91aS9hdG9tLXRleHQtZWRpdG9yJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtQdWJsaXNoTW9kZVR5cGUsIFB1Ymxpc2hNb2RlU3RhdGVUeXBlfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtQdWJsaXNoTW9kZSwgUHVibGlzaE1vZGVTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG50eXBlIFByb3BzID0ge1xuICBtZXNzYWdlOiA/c3RyaW5nO1xuICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGVUeXBlO1xuICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlVHlwZTtcbiAgaGVhZFJldmlzaW9uOiA/UmV2aXNpb25JbmZvO1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG59O1xuXG5jbGFzcyBEaWZmUHVibGlzaFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrUHVibGlzaCA9IHRoaXMuX29uQ2xpY2tQdWJsaXNoLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7cHVibGlzaE1vZGVTdGF0ZSwgcHVibGlzaE1vZGUsIGhlYWRSZXZpc2lvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGlzQnVzeSA9IHB1Ymxpc2hNb2RlU3RhdGUgIT09IFB1Ymxpc2hNb2RlU3RhdGUuUkVBRFk7XG5cbiAgICBsZXQgcmV2aXNpb25WaWV3ID0gbnVsbDtcbiAgICBsZXQgcHVibGlzaE1lc3NhZ2UgPSBudWxsO1xuICAgIGxldCBsb2FkaW5nSW5kaWNhdG9yID0gbnVsbDtcbiAgICBsZXQgcHJvZ3Jlc3NJbmRpY2F0b3IgPSBudWxsO1xuXG4gICAgaWYgKHB1Ymxpc2hNb2RlID09PSBQdWJsaXNoTW9kZS5DUkVBVEUpIHtcbiAgICAgIHB1Ymxpc2hNZXNzYWdlID0gJ1B1Ymxpc2ggUGhhYnJpY2F0b3IgUmV2aXNpb24nO1xuICAgIH0gZWxzZSB7XG4gICAgICBwdWJsaXNoTWVzc2FnZSA9ICdVcGRhdGUgUGhhYnJpY2F0b3IgUmV2aXNpb24nO1xuICAgICAgaWYgKGhlYWRSZXZpc2lvbiAhPSBudWxsKSB7XG4gICAgICAgIHJldmlzaW9uVmlldyA9IDxEaWZmUmV2aXNpb25WaWV3IHJldmlzaW9uPXtoZWFkUmV2aXNpb259IC8+O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHB1Ymxpc2hCdXR0b24gPSAoXG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tc20gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodFwiXG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2tQdWJsaXNofVxuICAgICAgICBkaXNhYmxlZD17aXNCdXN5fT5cbiAgICAgICAge3B1Ymxpc2hNZXNzYWdlfVxuICAgICAgPC9idXR0b24+XG4gICAgKTtcbiAgICBzd2l0Y2ggKHB1Ymxpc2hNb2RlU3RhdGUpIHtcbiAgICAgIGNhc2UgUHVibGlzaE1vZGVTdGF0ZS5MT0FESU5HX1BVQkxJU0hfTUVTU0FHRTpcbiAgICAgICAgbG9hZGluZ0luZGljYXRvciA9IDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmcgbG9hZGluZy1zcGlubmVyLXRpbnkgaW5saW5lLWJsb2NrXCI+PC9zcGFuPjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFB1Ymxpc2hNb2RlU3RhdGUuQVdBSVRJTkdfUFVCTElTSDpcbiAgICAgICAgcHJvZ3Jlc3NJbmRpY2F0b3IgPSA8cHJvZ3Jlc3MgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+PC9wcm9ncmVzcz47XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtbW9kZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtZWRpdG9yLXdyYXBwZXJcIj5cbiAgICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICAgIHJlZj1cIm1lc3NhZ2VcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e2lzQnVzeX1cbiAgICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWRcIj5cbiAgICAgICAgICB7bG9hZGluZ0luZGljYXRvcn1cbiAgICAgICAgICB7cHJvZ3Jlc3NJbmRpY2F0b3J9XG4gICAgICAgICAge3JldmlzaW9uVmlld31cbiAgICAgICAgICB7cHVibGlzaEJ1dHRvbn1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0UHVibGlzaFRleHQoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMubWVzc2FnZSAhPT0gcHJldlByb3BzLm1lc3NhZ2UpIHtcbiAgICAgIHRoaXMuX3NldFB1Ymxpc2hUZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgLy8gU2F2ZSB0aGUgbGF0ZXN0IGVkaXRlZCBwdWJsaXNoIG1lc3NhZ2UgZm9yIGxheW91dCBzd2l0Y2hlcy5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fZ2V0UHVibGlzaE1lc3NhZ2UoKTtcbiAgICAvLyBMZXQgdGhlIGNvbXBvbmVudCB1bm1vdW50IGJlZm9yZSBwcm9wYWdhdGluZyB0aGUgZmluYWwgbWVzc2FnZSBjaGFuZ2UgdG8gdGhlIG1vZGVsLFxuICAgIC8vIFNvIHRoZSBzdWJzZXF1ZW50IGNoYW5nZSBldmVudCBhdm9pZHMgcmUtcmVuZGVyaW5nIHRoaXMgY29tcG9uZW50LlxuICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0UHVibGlzaE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0UHVibGlzaFRleHQoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5tZXNzYWdlIHx8ICcnKTtcbiAgfVxuXG4gIF9vbkNsaWNrUHVibGlzaCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5wdWJsaXNoRGlmZih0aGlzLl9nZXRQdWJsaXNoTWVzc2FnZSgpKTtcbiAgfVxuXG4gIF9nZXRQdWJsaXNoTWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpO1xuICB9XG59XG5cbnR5cGUgRGlmZlJldmlzaW9uVmlld1Byb3BzID0ge1xuICByZXZpc2lvbjogUmV2aXNpb25JbmZvO1xufTtcblxuLy8gVE9ETyhtb3N0KTogVXNlIEBtYXJla3NhcG90YSdzIHV0aWxpdHkgd2hlbiBkb25lLlxuY29uc3QgRElGRl9SRVZJU0lPTl9SRUdFWCA9IC9EaWZmZXJlbnRpYWwgUmV2aXNpb246ICguKikvO1xuZnVuY3Rpb24gZ2V0VXJsRnJvbU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZGlmZk1hdGNoID0gRElGRl9SRVZJU0lPTl9SRUdFWC5leGVjKG1lc3NhZ2UpO1xuICBpbnZhcmlhbnQoZGlmZk1hdGNoICE9IG51bGwsICdEaWZmIFZpZXc6IFJldmlzaW9uIG11c3QgaGF2ZSBhIHZhbGlkIG1lc3NhZ2UnKTtcbiAgcmV0dXJuIGRpZmZNYXRjaFsxXTtcblxufVxuXG5jbGFzcyBEaWZmUmV2aXNpb25WaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IERpZmZSZXZpc2lvblZpZXdQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogRGlmZlJldmlzaW9uVmlld1Byb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrRGlmZiA9IHRoaXMuX29uQ2xpY2tEaWZmLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7aGFzaCwgdGl0bGUsIGRlc2NyaXB0aW9ufSA9IHRoaXMucHJvcHMucmV2aXNpb247XG4gICAgY29uc3QgdG9vbHRpcCA9IGAke2hhc2h9OiAke3RpdGxlfWA7XG4gICAgY29uc3QgdXJsID0gZ2V0VXJsRnJvbU1lc3NhZ2UoZGVzY3JpcHRpb24pO1xuICAgIHJldHVybiAoXG4gICAgICA8YSBocmVmPXt1cmx9IHRpdGxlPXt0b29sdGlwfSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrRGlmZn0+XG4gICAgICAgIHt1cmx9XG4gICAgICA8L2E+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrRGlmZigpOiB2b2lkIHtcbiAgICBjb25zdCB1cmwgPSBnZXRVcmxGcm9tTWVzc2FnZSh0aGlzLnByb3BzLnJldmlzaW9uLmRlc2NyaXB0aW9uKTtcbiAgICByZXF1aXJlKCdzaGVsbCcpLm9wZW5FeHRlcm5hbCh1cmwpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlB1Ymxpc2hWaWV3O1xuIl19