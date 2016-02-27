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
      var isPublishing = _props.isPublishing;
      var isLoading = _props.isLoading;
      var publishMode = _props.publishMode;
      var headRevision = _props.headRevision;

      var isBusy = isPublishing || isLoading;

      var revisionView = null;
      var publishMessage = null;
      var loadingIndicator = null;
      var progressIndicator = null;

      if (publishMode === _constants.PublishMode.CREATE) {
        publishMessage = 'Publish Phabricator Revision';
      } else {
        publishMessage = 'Update Phabricator Revision';
        (0, _assert2['default'])(headRevision != null, 'Diff View: Updated Revision can not be null');
        revisionView = _reactForAtom.React.createElement(DiffRevisionView, { revision: headRevision });
      }

      var publishButton = _reactForAtom.React.createElement(
        'button',
        { className: 'btn btn-sm btn-success pull-right',
          onClick: this._onClickPublish,
          disabled: isBusy },
        publishMessage
      );
      if (isLoading) {
        loadingIndicator = _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-tiny inline-block' });
      }
      if (isPublishing) {
        progressIndicator = _reactForAtom.React.createElement('progress', { className: 'inline-block' });
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
      var oldReadOnly = prevProps.isLoading || prevProps.isPublishing;
      var newReadOnly = this.props.isLoading || this.props.isPublishing;
      // Since changing readOnly destroys the text editor / buffer.
      // This should be fixed in AtomTextEditor.
      if (this.props.message !== prevProps.message || oldReadOnly !== newReadOnly) {
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
      this.refs['message'].getTextBuffer().setText(this.props.message);
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
//# sourceMappingURL=data:application/json;base64,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QUFDLFFBQVE7VUFBL0MsSUFBSSxtQkFBSixJQUFJO1VBQUUsS0FBSyxtQkFBTCxLQUFLO1VBQUUsV0FBVyxtQkFBWCxXQUFXOztBQUMvQixVQUFNLE9BQU8sR0FBTSxJQUFJLFVBQUssS0FBSyxBQUFFLENBQUM7QUFDcEMsVUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDM0MsYUFDRTs7VUFBRyxJQUFJLEVBQUUsR0FBRyxBQUFDLEVBQUMsS0FBSyxFQUFFLE9BQU8sQUFBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxBQUFDO1FBQ3RELEdBQUc7T0FDRixDQUNKO0tBQ0g7OztXQUVXLHdCQUFTO0FBQ25CLFVBQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQy9ELGFBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEM7OztTQXRCRyxnQkFBZ0I7R0FBUyxvQkFBTSxTQUFTOztBQXlCOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGlmZlB1Ymxpc2hWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEF0b21UZXh0RWRpdG9yIGZyb20gJy4uLy4uL3VpL2F0b20tdGV4dC1lZGl0b3InO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge1B1Ymxpc2hNb2RlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7UHVibGlzaE1vZGV9IGZyb20gJy4vY29uc3RhbnRzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBpc1B1Ymxpc2hpbmc6IGJvb2xlYW47XG4gIGlzTG9hZGluZzogYm9vbGVhbjtcbiAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlVHlwZTtcbiAgaGVhZFJldmlzaW9uOiA/UmV2aXNpb25JbmZvO1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG59O1xuXG5jbGFzcyBEaWZmUHVibGlzaFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrUHVibGlzaCA9IHRoaXMuX29uQ2xpY2tQdWJsaXNoLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7aXNQdWJsaXNoaW5nLCBpc0xvYWRpbmcsIHB1Ymxpc2hNb2RlLCBoZWFkUmV2aXNpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBpc0J1c3kgPSBpc1B1Ymxpc2hpbmcgfHwgaXNMb2FkaW5nO1xuXG4gICAgbGV0IHJldmlzaW9uVmlldyA9IG51bGw7XG4gICAgbGV0IHB1Ymxpc2hNZXNzYWdlID0gbnVsbDtcbiAgICBsZXQgbG9hZGluZ0luZGljYXRvciA9IG51bGw7XG4gICAgbGV0IHByb2dyZXNzSW5kaWNhdG9yID0gbnVsbDtcblxuICAgIGlmIChwdWJsaXNoTW9kZSA9PT0gUHVibGlzaE1vZGUuQ1JFQVRFKSB7XG4gICAgICBwdWJsaXNoTWVzc2FnZSA9ICdQdWJsaXNoIFBoYWJyaWNhdG9yIFJldmlzaW9uJztcbiAgICB9IGVsc2Uge1xuICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnVXBkYXRlIFBoYWJyaWNhdG9yIFJldmlzaW9uJztcbiAgICAgIGludmFyaWFudChoZWFkUmV2aXNpb24gIT0gbnVsbCwgJ0RpZmYgVmlldzogVXBkYXRlZCBSZXZpc2lvbiBjYW4gbm90IGJlIG51bGwnKTtcbiAgICAgIHJldmlzaW9uVmlldyA9IDxEaWZmUmV2aXNpb25WaWV3IHJldmlzaW9uPXtoZWFkUmV2aXNpb259IC8+O1xuICAgIH1cblxuICAgIGNvbnN0IHB1Ymxpc2hCdXR0b24gPSAoXG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tc20gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodFwiXG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2tQdWJsaXNofVxuICAgICAgICBkaXNhYmxlZD17aXNCdXN5fT5cbiAgICAgICAge3B1Ymxpc2hNZXNzYWdlfVxuICAgICAgPC9idXR0b24+XG4gICAgKTtcbiAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICBsb2FkaW5nSW5kaWNhdG9yID0gPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2tcIj48L3NwYW4+O1xuICAgIH1cbiAgICBpZiAoaXNQdWJsaXNoaW5nKSB7XG4gICAgICBwcm9ncmVzc0luZGljYXRvciA9IDxwcm9ncmVzcyBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj48L3Byb2dyZXNzPjtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLW1vZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZXNzYWdlLWVkaXRvci13cmFwcGVyXCI+XG4gICAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgICByZWY9XCJtZXNzYWdlXCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXtpc0J1c3l9XG4gICAgICAgICAgICBndXR0ZXJIaWRkZW49e3RydWV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgICAge2xvYWRpbmdJbmRpY2F0b3J9XG4gICAgICAgICAge3Byb2dyZXNzSW5kaWNhdG9yfVxuICAgICAgICAgIHtyZXZpc2lvblZpZXd9XG4gICAgICAgICAge3B1Ymxpc2hCdXR0b259XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3NldFB1Ymxpc2hUZXh0KCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFJlYWRPbmx5ID0gcHJldlByb3BzLmlzTG9hZGluZyB8fCBwcmV2UHJvcHMuaXNQdWJsaXNoaW5nO1xuICAgIGNvbnN0IG5ld1JlYWRPbmx5ID0gdGhpcy5wcm9wcy5pc0xvYWRpbmcgfHwgdGhpcy5wcm9wcy5pc1B1Ymxpc2hpbmc7XG4gICAgLy8gU2luY2UgY2hhbmdpbmcgcmVhZE9ubHkgZGVzdHJveXMgdGhlIHRleHQgZWRpdG9yIC8gYnVmZmVyLlxuICAgIC8vIFRoaXMgc2hvdWxkIGJlIGZpeGVkIGluIEF0b21UZXh0RWRpdG9yLlxuICAgIGlmICh0aGlzLnByb3BzLm1lc3NhZ2UgIT09IHByZXZQcm9wcy5tZXNzYWdlIHx8IG9sZFJlYWRPbmx5ICE9PSBuZXdSZWFkT25seSkge1xuICAgICAgdGhpcy5fc2V0UHVibGlzaFRleHQoKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAvLyBTYXZlIHRoZSBsYXRlc3QgZWRpdGVkIHB1Ymxpc2ggbWVzc2FnZSBmb3IgbGF5b3V0IHN3aXRjaGVzLlxuICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9nZXRQdWJsaXNoTWVzc2FnZSgpO1xuICAgIC8vIExldCB0aGUgY29tcG9uZW50IHVubW91bnQgYmVmb3JlIHByb3BhZ2F0aW5nIHRoZSBmaW5hbCBtZXNzYWdlIGNoYW5nZSB0byB0aGUgbW9kZWwsXG4gICAgLy8gU28gdGhlIHN1YnNlcXVlbnQgY2hhbmdlIGV2ZW50IGF2b2lkcyByZS1yZW5kZXJpbmcgdGhpcyBjb21wb25lbnQuXG4gICAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB7XG4gICAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRQdWJsaXNoTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZXRQdWJsaXNoVGV4dCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuc2V0VGV4dCh0aGlzLnByb3BzLm1lc3NhZ2UpO1xuICB9XG5cbiAgX29uQ2xpY2tQdWJsaXNoKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnB1Ymxpc2hEaWZmKHRoaXMuX2dldFB1Ymxpc2hNZXNzYWdlKCkpO1xuICB9XG5cbiAgX2dldFB1Ymxpc2hNZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snbWVzc2FnZSddLmdldFRleHRCdWZmZXIoKS5nZXRUZXh0KCk7XG4gIH1cbn1cblxudHlwZSBEaWZmUmV2aXNpb25WaWV3UHJvcHMgPSB7XG4gIHJldmlzaW9uOiBSZXZpc2lvbkluZm87XG59O1xuXG4vLyBUT0RPKG1vc3QpOiBVc2UgQG1hcmVrc2Fwb3RhJ3MgdXRpbGl0eSB3aGVuIGRvbmUuXG5jb25zdCBESUZGX1JFVklTSU9OX1JFR0VYID0gL0RpZmZlcmVudGlhbCBSZXZpc2lvbjogKC4qKS87XG5mdW5jdGlvbiBnZXRVcmxGcm9tTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBkaWZmTWF0Y2ggPSBESUZGX1JFVklTSU9OX1JFR0VYLmV4ZWMobWVzc2FnZSk7XG4gIGludmFyaWFudChkaWZmTWF0Y2ggIT0gbnVsbCwgJ0RpZmYgVmlldzogUmV2aXNpb24gbXVzdCBoYXZlIGEgdmFsaWQgbWVzc2FnZScpO1xuICByZXR1cm4gZGlmZk1hdGNoWzFdO1xuXG59XG5cbmNsYXNzIERpZmZSZXZpc2lvblZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlmZlJldmlzaW9uVmlld1Byb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBEaWZmUmV2aXNpb25WaWV3UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2tEaWZmID0gdGhpcy5fb25DbGlja0RpZmYuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtoYXNoLCB0aXRsZSwgZGVzY3JpcHRpb259ID0gdGhpcy5wcm9wcy5yZXZpc2lvbjtcbiAgICBjb25zdCB0b29sdGlwID0gYCR7aGFzaH06ICR7dGl0bGV9YDtcbiAgICBjb25zdCB1cmwgPSBnZXRVcmxGcm9tTWVzc2FnZShkZXNjcmlwdGlvbik7XG4gICAgcmV0dXJuIChcbiAgICAgIDxhIGhyZWY9e3VybH0gdGl0bGU9e3Rvb2x0aXB9IG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2tEaWZmfT5cbiAgICAgICAge3VybH1cbiAgICAgIDwvYT5cbiAgICApO1xuICB9XG5cbiAgX29uQ2xpY2tEaWZmKCk6IHZvaWQge1xuICAgIGNvbnN0IHVybCA9IGdldFVybEZyb21NZXNzYWdlKHRoaXMucHJvcHMucmV2aXNpb24uZGVzY3JpcHRpb24pO1xuICAgIHJlcXVpcmUoJ3NoZWxsJykub3BlbkV4dGVybmFsKHVybCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmUHVibGlzaFZpZXc7XG4iXX0=