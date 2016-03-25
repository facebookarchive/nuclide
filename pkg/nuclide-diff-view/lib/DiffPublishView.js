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

var _nuclideUiAtomTextEditor = require('../../nuclide-ui-atom-text-editor');

var _nuclideUiAtomTextEditor2 = _interopRequireDefault(_nuclideUiAtomTextEditor);

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
          _reactForAtom.React.createElement(_nuclideUiAtomTextEditor2['default'], {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZQdWJsaXNoVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBZXFCLCtCQUErQjs7Ozt1Q0FDekIsbUNBQW1DOzs7OzBCQUN2QyxZQUFZOzs7O3lCQUNTLGFBQWE7OzRCQUNyQyxnQkFBZ0I7O0lBTTlCLGdCQUFnQjtZQUFoQixnQkFBZ0I7O1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzsrQkFBaEIsZ0JBQWdCOzs7ZUFBaEIsZ0JBQWdCOztXQUdkLGtCQUFpQjs0QkFDYyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7VUFBL0MsSUFBSSxtQkFBSixJQUFJO1VBQUUsS0FBSyxtQkFBTCxLQUFLO1VBQUUsV0FBVyxtQkFBWCxXQUFXOztBQUMvQixVQUFNLE9BQU8sR0FBTSxJQUFJLFVBQUssS0FBSyxBQUFFLENBQUM7QUFDcEMsVUFBTSxRQUFRLEdBQUcsbUNBQVMsdUNBQXVDLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRS9FLGFBQU8sQUFBQyxRQUFRLElBQUksSUFBSSxHQUNwQiwrQ0FBUSxHQUVSOztVQUFHLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxBQUFDLEVBQUMsS0FBSyxFQUFFLE9BQU8sQUFBQztRQUNuQyxRQUFRLENBQUMsRUFBRTtPQUNWLEFBQ0wsQ0FBQztLQUNMOzs7U0FmRyxnQkFBZ0I7R0FBUyxvQkFBTSxTQUFTOztJQTBCeEMsZUFBZTtZQUFmLGVBQWU7O0FBR1IsV0FIUCxlQUFlLENBR1AsS0FBWSxFQUFFOzBCQUh0QixlQUFlOztBQUlqQiwrQkFKRSxlQUFlLDZDQUlYLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMvRDs7ZUFORyxlQUFlOztXQVFGLDZCQUFTO0FBQ3hCLFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUN4Qjs7O1dBRWlCLDRCQUFDLFNBQWdCLEVBQVE7QUFDekMsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUMsT0FBTyxFQUFFO0FBQzVDLFlBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztPQUN4QjtLQUNGOzs7V0FFbUIsZ0NBQVM7Ozs7QUFFM0IsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7OztBQUcxQyxhQUFPLENBQUMsUUFBUSxDQUFDLFlBQU07QUFDckIsY0FBSyxLQUFLLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ2pELENBQUMsQ0FBQztLQUNKOzs7V0FFYywyQkFBUztBQUN0QixVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztLQUN4RTs7O1dBRWMsMkJBQVM7QUFDdEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7S0FDN0Q7OztXQUVpQiw4QkFBVztBQUMzQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkQ7OztXQUVLLGtCQUFpQjttQkFDaUMsSUFBSSxDQUFDLEtBQUs7VUFBekQsZ0JBQWdCLFVBQWhCLGdCQUFnQjtVQUFFLFdBQVcsVUFBWCxXQUFXO1VBQUUsWUFBWSxVQUFaLFlBQVk7O0FBRWxELFVBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsVUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3hCLG9CQUFZLEdBQUcsa0NBQUMsZ0JBQWdCLElBQUMsUUFBUSxFQUFFLFlBQVksQUFBQyxHQUFHLENBQUM7T0FDN0Q7O0FBRUQsVUFBSSxNQUFNLFlBQUEsQ0FBQztBQUNYLFVBQUksY0FBYyxZQUFBLENBQUM7QUFDbkIsY0FBUSxnQkFBZ0I7QUFDdEIsYUFBSyw0QkFBaUIsS0FBSztBQUN6QixnQkFBTSxHQUFHLEtBQUssQ0FBQztBQUNmLGNBQUksV0FBVyxLQUFLLHVCQUFZLE1BQU0sRUFBRTtBQUN0QywwQkFBYyxHQUFHLDhCQUE4QixDQUFDO1dBQ2pELE1BQU07QUFDTCwwQkFBYyxHQUFHLDZCQUE2QixDQUFDO1dBQ2hEO0FBQ0QsZ0JBQU07QUFBQSxBQUNSLGFBQUssNEJBQWlCLHVCQUF1QjtBQUMzQyxnQkFBTSxHQUFHLElBQUksQ0FBQztBQUNkLHdCQUFjLEdBQUcsWUFBWSxDQUFDO0FBQzlCLGdCQUFNO0FBQUEsQUFDUixhQUFLLDRCQUFpQixnQkFBZ0I7QUFDcEMsZ0JBQU0sR0FBRyxJQUFJLENBQUM7QUFDZCx3QkFBYyxHQUFHLGVBQWUsQ0FBQztBQUNqQyxnQkFBTTtBQUFBLE9BQ1Q7O0FBRUQsVUFBTSxhQUFhLEdBQ2pCOzs7QUFDRSxtQkFBUyxFQUFFLDZCQUFXLHdCQUF3QixFQUFFLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBQyxDQUFDLEFBQUM7QUFDMUUsaUJBQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDO0FBQzlCLGtCQUFRLEVBQUUsTUFBTSxBQUFDO1FBQ2hCLGNBQWM7T0FDUixBQUNWLENBQUM7O0FBRUYsYUFDRTs7VUFBSyxTQUFTLEVBQUMsbUJBQW1CO1FBQ2hDOztZQUFLLFNBQVMsRUFBQyx3QkFBd0I7VUFDckM7QUFDRSxlQUFHLEVBQUMsU0FBUztBQUNiLG9CQUFRLEVBQUUsTUFBTSxBQUFDO0FBQ2pCLHdCQUFZLEVBQUUsSUFBSSxBQUFDO1lBQ25CO1NBQ0U7UUFDTjs7WUFBSyxTQUFTLEVBQUMsNERBQTREO1VBQ3pFOztjQUFLLFNBQVMsRUFBQyxnQ0FBZ0M7WUFDNUMsWUFBWTtXQUNUO1VBQ047O2NBQUssU0FBUyxFQUFDLGlDQUFpQztZQUM3QyxhQUFhO1dBQ1Y7U0FDRjtPQUNGLENBQ047S0FDSDs7O1NBakdHLGVBQWU7R0FBUyxvQkFBTSxTQUFTOztBQW9HN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGlmZlB1Ymxpc2hWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZSc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7UHVibGlzaE1vZGVUeXBlLCBQdWJsaXNoTW9kZVN0YXRlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCBhcmNhbmlzdCBmcm9tICcuLi8uLi9udWNsaWRlLWFyY2FuaXN0LWNsaWVudCc7XG5pbXBvcnQgQXRvbVRleHRFZGl0b3IgZnJvbSAnLi4vLi4vbnVjbGlkZS11aS1hdG9tLXRleHQtZWRpdG9yJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtQdWJsaXNoTW9kZSwgUHVibGlzaE1vZGVTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIERpZmZSZXZpc2lvblZpZXdQcm9wcyA9IHtcbiAgcmV2aXNpb246IFJldmlzaW9uSW5mbztcbn07XG5cbmNsYXNzIERpZmZSZXZpc2lvblZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlmZlJldmlzaW9uVmlld1Byb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtoYXNoLCB0aXRsZSwgZGVzY3JpcHRpb259ID0gdGhpcy5wcm9wcy5yZXZpc2lvbjtcbiAgICBjb25zdCB0b29sdGlwID0gYCR7aGFzaH06ICR7dGl0bGV9YDtcbiAgICBjb25zdCByZXZpc2lvbiA9IGFyY2FuaXN0LmdldFBoYWJyaWNhdG9yUmV2aXNpb25Gcm9tQ29tbWl0TWVzc2FnZShkZXNjcmlwdGlvbik7XG5cbiAgICByZXR1cm4gKHJldmlzaW9uID09IG51bGwpXG4gICAgICA/IDxzcGFuIC8+XG4gICAgICA6IChcbiAgICAgICAgPGEgaHJlZj17cmV2aXNpb24udXJsfSB0aXRsZT17dG9vbHRpcH0+XG4gICAgICAgICAge3JldmlzaW9uLmlkfVxuICAgICAgICA8L2E+XG4gICAgICApO1xuICB9XG59XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG1lc3NhZ2U6ID9zdHJpbmc7XG4gIHB1Ymxpc2hNb2RlOiBQdWJsaXNoTW9kZVR5cGU7XG4gIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGVUeXBlO1xuICBoZWFkUmV2aXNpb246ID9SZXZpc2lvbkluZm87XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbmNsYXNzIERpZmZQdWJsaXNoVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2tQdWJsaXNoID0gdGhpcy5fb25DbGlja1B1Ymxpc2guYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3NldFB1Ymxpc2hUZXh0KCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLm1lc3NhZ2UgIT09IHByZXZQcm9wcy5tZXNzYWdlKSB7XG4gICAgICB0aGlzLl9zZXRQdWJsaXNoVGV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIC8vIFNhdmUgdGhlIGxhdGVzdCBlZGl0ZWQgcHVibGlzaCBtZXNzYWdlIGZvciBsYXlvdXQgc3dpdGNoZXMuXG4gICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2dldFB1Ymxpc2hNZXNzYWdlKCk7XG4gICAgLy8gTGV0IHRoZSBjb21wb25lbnQgdW5tb3VudCBiZWZvcmUgcHJvcGFnYXRpbmcgdGhlIGZpbmFsIG1lc3NhZ2UgY2hhbmdlIHRvIHRoZSBtb2RlbCxcbiAgICAvLyBTbyB0aGUgc3Vic2VxdWVudCBjaGFuZ2UgZXZlbnQgYXZvaWRzIHJlLXJlbmRlcmluZyB0aGlzIGNvbXBvbmVudC5cbiAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHtcbiAgICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFB1Ymxpc2hNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgX3NldFB1Ymxpc2hUZXh0KCk6IHZvaWQge1xuICAgIHRoaXMucmVmc1snbWVzc2FnZSddLmdldFRleHRCdWZmZXIoKS5zZXRUZXh0KHRoaXMucHJvcHMubWVzc2FnZSB8fCAnJyk7XG4gIH1cblxuICBfb25DbGlja1B1Ymxpc2goKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwucHVibGlzaERpZmYodGhpcy5fZ2V0UHVibGlzaE1lc3NhZ2UoKSk7XG4gIH1cblxuICBfZ2V0UHVibGlzaE1lc3NhZ2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLmdldFRleHQoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtwdWJsaXNoTW9kZVN0YXRlLCBwdWJsaXNoTW9kZSwgaGVhZFJldmlzaW9ufSA9IHRoaXMucHJvcHM7XG5cbiAgICBsZXQgcmV2aXNpb25WaWV3O1xuICAgIGlmIChoZWFkUmV2aXNpb24gIT0gbnVsbCkge1xuICAgICAgcmV2aXNpb25WaWV3ID0gPERpZmZSZXZpc2lvblZpZXcgcmV2aXNpb249e2hlYWRSZXZpc2lvbn0gLz47XG4gICAgfVxuXG4gICAgbGV0IGlzQnVzeTtcbiAgICBsZXQgcHVibGlzaE1lc3NhZ2U7XG4gICAgc3dpdGNoIChwdWJsaXNoTW9kZVN0YXRlKSB7XG4gICAgICBjYXNlIFB1Ymxpc2hNb2RlU3RhdGUuUkVBRFk6XG4gICAgICAgIGlzQnVzeSA9IGZhbHNlO1xuICAgICAgICBpZiAocHVibGlzaE1vZGUgPT09IFB1Ymxpc2hNb2RlLkNSRUFURSkge1xuICAgICAgICAgIHB1Ymxpc2hNZXNzYWdlID0gJ1B1Ymxpc2ggUGhhYnJpY2F0b3IgUmV2aXNpb24nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHB1Ymxpc2hNZXNzYWdlID0gJ1VwZGF0ZSBQaGFicmljYXRvciBSZXZpc2lvbic7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFB1Ymxpc2hNb2RlU3RhdGUuTE9BRElOR19QVUJMSVNIX01FU1NBR0U6XG4gICAgICAgIGlzQnVzeSA9IHRydWU7XG4gICAgICAgIHB1Ymxpc2hNZXNzYWdlID0gJ0xvYWRpbmcuLi4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUHVibGlzaE1vZGVTdGF0ZS5BV0FJVElOR19QVUJMSVNIOlxuICAgICAgICBpc0J1c3kgPSB0cnVlO1xuICAgICAgICBwdWJsaXNoTWVzc2FnZSA9ICdQdWJsaXNoaW5nLi4uJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGlzaEJ1dHRvbiA9IChcbiAgICAgIDxidXR0b25cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKCdidG4gYnRuLXNtIGJ0bi1zdWNjZXNzJywgeydidG4tcHJvZ3Jlc3MnOiBpc0J1c3l9KX1cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja1B1Ymxpc2h9XG4gICAgICAgIGRpc2FibGVkPXtpc0J1c3l9PlxuICAgICAgICB7cHVibGlzaE1lc3NhZ2V9XG4gICAgICA8L2J1dHRvbj5cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLW1vZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZXNzYWdlLWVkaXRvci13cmFwcGVyXCI+XG4gICAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgICByZWY9XCJtZXNzYWdlXCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXtpc0J1c3l9XG4gICAgICAgICAgICBndXR0ZXJIaWRkZW49e3RydWV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhciBudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLWJvdHRvbVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci1sZWZ0XCI+XG4gICAgICAgICAgICB7cmV2aXNpb25WaWV3fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci1yaWdodFwiPlxuICAgICAgICAgICAge3B1Ymxpc2hCdXR0b259XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpZmZQdWJsaXNoVmlldztcbiJdfQ==