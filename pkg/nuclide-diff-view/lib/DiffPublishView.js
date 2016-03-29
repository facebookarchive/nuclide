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
//# sourceMappingURL=data:application/json;base64,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Uzs7QUFxRzdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRpZmZQdWJsaXNoVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge1B1Ymxpc2hNb2RlVHlwZSwgUHVibGlzaE1vZGVTdGF0ZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgYXJjYW5pc3QgZnJvbSAnLi4vLi4vbnVjbGlkZS1hcmNhbmlzdC1jbGllbnQnO1xuaW1wb3J0IHtBdG9tVGV4dEVkaXRvcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbVRleHRFZGl0b3InO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge1B1Ymxpc2hNb2RlLCBQdWJsaXNoTW9kZVN0YXRlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgRGlmZlJldmlzaW9uVmlld1Byb3BzID0ge1xuICByZXZpc2lvbjogUmV2aXNpb25JbmZvO1xufTtcblxuY2xhc3MgRGlmZlJldmlzaW9uVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBEaWZmUmV2aXNpb25WaWV3UHJvcHM7XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge2hhc2gsIHRpdGxlLCBkZXNjcmlwdGlvbn0gPSB0aGlzLnByb3BzLnJldmlzaW9uO1xuICAgIGNvbnN0IHRvb2x0aXAgPSBgJHtoYXNofTogJHt0aXRsZX1gO1xuICAgIGNvbnN0IHJldmlzaW9uID0gYXJjYW5pc3QuZ2V0UGhhYnJpY2F0b3JSZXZpc2lvbkZyb21Db21taXRNZXNzYWdlKGRlc2NyaXB0aW9uKTtcblxuICAgIHJldHVybiAocmV2aXNpb24gPT0gbnVsbClcbiAgICAgID8gPHNwYW4gLz5cbiAgICAgIDogKFxuICAgICAgICA8YSBocmVmPXtyZXZpc2lvbi51cmx9IHRpdGxlPXt0b29sdGlwfT5cbiAgICAgICAgICB7cmV2aXNpb24uaWR9XG4gICAgICAgIDwvYT5cbiAgICAgICk7XG4gIH1cbn1cblxudHlwZSBQcm9wcyA9IHtcbiAgbWVzc2FnZTogP3N0cmluZztcbiAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlVHlwZTtcbiAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZVR5cGU7XG4gIGhlYWRSZXZpc2lvbjogP1JldmlzaW9uSW5mbztcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuY2xhc3MgRGlmZlB1Ymxpc2hWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DbGlja1B1Ymxpc2ggPSB0aGlzLl9vbkNsaWNrUHVibGlzaC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0UHVibGlzaFRleHQoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMubWVzc2FnZSAhPT0gcHJldlByb3BzLm1lc3NhZ2UpIHtcbiAgICAgIHRoaXMuX3NldFB1Ymxpc2hUZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgLy8gU2F2ZSB0aGUgbGF0ZXN0IGVkaXRlZCBwdWJsaXNoIG1lc3NhZ2UgZm9yIGxheW91dCBzd2l0Y2hlcy5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fZ2V0UHVibGlzaE1lc3NhZ2UoKTtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgLy8gTGV0IHRoZSBjb21wb25lbnQgdW5tb3VudCBiZWZvcmUgcHJvcGFnYXRpbmcgdGhlIGZpbmFsIG1lc3NhZ2UgY2hhbmdlIHRvIHRoZSBtb2RlbCxcbiAgICAvLyBTbyB0aGUgc3Vic2VxdWVudCBjaGFuZ2UgZXZlbnQgYXZvaWRzIHJlLXJlbmRlcmluZyB0aGlzIGNvbXBvbmVudC5cbiAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHtcbiAgICAgIGRpZmZNb2RlbC5zZXRQdWJsaXNoTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZXRQdWJsaXNoVGV4dCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuc2V0VGV4dCh0aGlzLnByb3BzLm1lc3NhZ2UgfHwgJycpO1xuICB9XG5cbiAgX29uQ2xpY2tQdWJsaXNoKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnB1Ymxpc2hEaWZmKHRoaXMuX2dldFB1Ymxpc2hNZXNzYWdlKCkpO1xuICB9XG5cbiAgX2dldFB1Ymxpc2hNZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snbWVzc2FnZSddLmdldFRleHRCdWZmZXIoKS5nZXRUZXh0KCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7cHVibGlzaE1vZGVTdGF0ZSwgcHVibGlzaE1vZGUsIGhlYWRSZXZpc2lvbn0gPSB0aGlzLnByb3BzO1xuXG4gICAgbGV0IHJldmlzaW9uVmlldztcbiAgICBpZiAoaGVhZFJldmlzaW9uICE9IG51bGwpIHtcbiAgICAgIHJldmlzaW9uVmlldyA9IDxEaWZmUmV2aXNpb25WaWV3IHJldmlzaW9uPXtoZWFkUmV2aXNpb259IC8+O1xuICAgIH1cblxuICAgIGxldCBpc0J1c3k7XG4gICAgbGV0IHB1Ymxpc2hNZXNzYWdlO1xuICAgIHN3aXRjaCAocHVibGlzaE1vZGVTdGF0ZSkge1xuICAgICAgY2FzZSBQdWJsaXNoTW9kZVN0YXRlLlJFQURZOlxuICAgICAgICBpc0J1c3kgPSBmYWxzZTtcbiAgICAgICAgaWYgKHB1Ymxpc2hNb2RlID09PSBQdWJsaXNoTW9kZS5DUkVBVEUpIHtcbiAgICAgICAgICBwdWJsaXNoTWVzc2FnZSA9ICdQdWJsaXNoIFBoYWJyaWNhdG9yIFJldmlzaW9uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwdWJsaXNoTWVzc2FnZSA9ICdVcGRhdGUgUGhhYnJpY2F0b3IgUmV2aXNpb24nO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQdWJsaXNoTW9kZVN0YXRlLkxPQURJTkdfUFVCTElTSF9NRVNTQUdFOlxuICAgICAgICBpc0J1c3kgPSB0cnVlO1xuICAgICAgICBwdWJsaXNoTWVzc2FnZSA9ICdMb2FkaW5nLi4uJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFB1Ymxpc2hNb2RlU3RhdGUuQVdBSVRJTkdfUFVCTElTSDpcbiAgICAgICAgaXNCdXN5ID0gdHJ1ZTtcbiAgICAgICAgcHVibGlzaE1lc3NhZ2UgPSAnUHVibGlzaGluZy4uLic7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHB1Ymxpc2hCdXR0b24gPSAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnYnRuIGJ0bi1zbSBidG4tc3VjY2VzcycsIHsnYnRuLXByb2dyZXNzJzogaXNCdXN5fSl9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2tQdWJsaXNofVxuICAgICAgICBkaXNhYmxlZD17aXNCdXN5fT5cbiAgICAgICAge3B1Ymxpc2hNZXNzYWdlfVxuICAgICAgPC9idXR0b24+XG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi1tb2RlXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWVzc2FnZS1lZGl0b3Itd3JhcHBlclwiPlxuICAgICAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICAgICAgcmVmPVwibWVzc2FnZVwiXG4gICAgICAgICAgICByZWFkT25seT17aXNCdXN5fVxuICAgICAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXIgbnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci1ib3R0b21cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXItbGVmdFwiPlxuICAgICAgICAgICAge3JldmlzaW9uVmlld31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXItcmlnaHRcIj5cbiAgICAgICAgICAgIHtwdWJsaXNoQnV0dG9ufVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmUHVibGlzaFZpZXc7XG4iXX0=