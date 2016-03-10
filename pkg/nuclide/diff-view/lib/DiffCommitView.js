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

var _uiAtomTextEditor = require('../../ui/atom-text-editor');

var _uiAtomTextEditor2 = _interopRequireDefault(_uiAtomTextEditor);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _constants = require('./constants');

var _reactForAtom = require('react-for-atom');

var DiffCommitView = (function (_React$Component) {
  _inherits(DiffCommitView, _React$Component);

  function DiffCommitView(props) {
    _classCallCheck(this, DiffCommitView);

    _get(Object.getPrototypeOf(DiffCommitView.prototype), 'constructor', this).call(this, props);
    this._onClickCommit = this._onClickCommit.bind(this);
  }

  _createClass(DiffCommitView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._setCommitMessage();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.props.commitMessage !== prevProps.commitMessage) {
        this._setCommitMessage();
      }
    }
  }, {
    key: '_setCommitMessage',
    value: function _setCommitMessage() {
      this.refs['message'].getTextBuffer().setText(this.props.commitMessage || '');
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var actionOrMessage = undefined;
      var _props = this.props;
      var commitMode = _props.commitMode;
      var commitModeState = _props.commitModeState;

      var isLoading = commitModeState !== _constants.CommitModeState.READY;

      if (commitModeState === _constants.CommitModeState.READY) {
        actionOrMessage = _reactForAtom.React.createElement(
          'button',
          { className: 'btn btn-sm btn-success pull-right',
            onClick: this._onClickCommit },
          commitMode,
          ' to HEAD'
        );
      } else {
        var loadingMessage = undefined;
        switch (commitModeState) {
          case _constants.CommitModeState.AWAITING_COMMIT:
            loadingMessage = 'Committing...';
            break;
          case _constants.CommitModeState.LOADING_COMMIT_MESSAGE:
            loadingMessage = 'Loading...';
            break;
          default:
            loadingMessage = 'Unknown Commit State!';
            break;
        }

        actionOrMessage = _reactForAtom.React.createElement(
          'span',
          { className: 'pull-right' },
          _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-tiny inline-block' }),
          _reactForAtom.React.createElement(
            'span',
            { className: 'inline-block' },
            loadingMessage
          )
        );
      }

      var commitModes = Object.keys(_constants.CommitMode).map(function (modeId) {
        var modeValue = _constants.CommitMode[modeId];
        var className = (0, _classnames2['default'])({
          'btn': true,
          'btn-sm': true,
          'selected': modeValue === commitMode
        });
        return _reactForAtom.React.createElement(
          'button',
          {
            className: className,
            key: modeValue,
            disabled: isLoading,
            onClick: function () {
              return _this._onChangeCommitMode(modeValue);
            } },
          modeValue
        );
      });

      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-mode' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          _reactForAtom.React.createElement(_uiAtomTextEditor2['default'], {
            ref: 'message',
            gutterHidden: true,
            readOnly: isLoading
          })
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'btn-group btn-group-sm inline-block' },
            commitModes
          ),
          actionOrMessage
        )
      );
    }
  }, {
    key: '_onClickCommit',
    value: function _onClickCommit() {
      this.props.diffModel.commit(this.refs['message'].getTextBuffer().getText());
    }
  }, {
    key: '_onChangeCommitMode',
    value: function _onChangeCommitMode(commitMode) {
      this.props.diffModel.setCommitMode(commitMode);
    }
  }]);

  return DiffCommitView;
})(_reactForAtom.React.Component);

module.exports = DiffCommitView;
//# sourceMappingURL=data:application/json;base64,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Qyx3QkFBd0I7VUFDckM7QUFDRSxlQUFHLEVBQUMsU0FBUztBQUNiLHdCQUFZLEVBQUUsSUFBSSxBQUFDO0FBQ25CLG9CQUFRLEVBQUUsU0FBUyxBQUFDO1lBQ3BCO1NBQ0U7UUFDTjs7WUFBSyxTQUFTLEVBQUMsUUFBUTtVQUNyQjs7Y0FBSyxTQUFTLEVBQUMscUNBQXFDO1lBQ2pELFdBQVc7V0FDUjtVQUNMLGVBQWU7U0FDWjtPQUNGLENBQ047S0FDSDs7O1dBRWEsMEJBQVM7QUFDckIsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUM3RTs7O1dBRWtCLDZCQUFDLFVBQTBCLEVBQVE7QUFDcEQsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ2hEOzs7U0F0R0csY0FBYztHQUFTLG9CQUFNLFNBQVM7O0FBeUc1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJEaWZmQ29tbWl0Vmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDb21taXRNb2RlVHlwZSwgQ29tbWl0TW9kZVN0YXRlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5cbmltcG9ydCBBdG9tVGV4dEVkaXRvciBmcm9tICcuLi8uLi91aS9hdG9tLXRleHQtZWRpdG9yJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtDb21taXRNb2RlLCBDb21taXRNb2RlU3RhdGV9IGZyb20gJy4vY29uc3RhbnRzJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xuICBjb21taXRNb2RlOiBzdHJpbmc7XG4gIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlVHlwZTtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuY2xhc3MgRGlmZkNvbW1pdFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrQ29tbWl0ID0gdGhpcy5fb25DbGlja0NvbW1pdC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0Q29tbWl0TWVzc2FnZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLmNvbW1pdE1lc3NhZ2UgIT09IHByZXZQcm9wcy5jb21taXRNZXNzYWdlKSB7XG4gICAgICB0aGlzLl9zZXRDb21taXRNZXNzYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldENvbW1pdE1lc3NhZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5jb21taXRNZXNzYWdlIHx8ICcnKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCBhY3Rpb25Pck1lc3NhZ2U7XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0TW9kZSxcbiAgICAgIGNvbW1pdE1vZGVTdGF0ZSxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBpc0xvYWRpbmcgPSBjb21taXRNb2RlU3RhdGUgIT09IENvbW1pdE1vZGVTdGF0ZS5SRUFEWTtcblxuICAgIGlmIChjb21taXRNb2RlU3RhdGUgPT09IENvbW1pdE1vZGVTdGF0ZS5SRUFEWSkge1xuICAgICAgYWN0aW9uT3JNZXNzYWdlID0gKFxuICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tc20gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodFwiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja0NvbW1pdH0+XG4gICAgICAgICAge2NvbW1pdE1vZGV9IHRvIEhFQURcbiAgICAgICAgPC9idXR0b24+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbG9hZGluZ01lc3NhZ2U7XG4gICAgICBzd2l0Y2ggKGNvbW1pdE1vZGVTdGF0ZSkge1xuICAgICAgICBjYXNlIENvbW1pdE1vZGVTdGF0ZS5BV0FJVElOR19DT01NSVQ6XG4gICAgICAgICAgbG9hZGluZ01lc3NhZ2UgPSAnQ29tbWl0dGluZy4uLic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQ29tbWl0TW9kZVN0YXRlLkxPQURJTkdfQ09NTUlUX01FU1NBR0U6XG4gICAgICAgICAgbG9hZGluZ01lc3NhZ2UgPSAnTG9hZGluZy4uLic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbG9hZGluZ01lc3NhZ2UgPSAnVW5rbm93biBDb21taXQgU3RhdGUhJztcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgYWN0aW9uT3JNZXNzYWdlID0gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2tcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+e2xvYWRpbmdNZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21taXRNb2RlcyA9IE9iamVjdC5rZXlzKENvbW1pdE1vZGUpLm1hcChtb2RlSWQgPT4ge1xuICAgICAgY29uc3QgbW9kZVZhbHVlID0gQ29tbWl0TW9kZVttb2RlSWRdO1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyh7XG4gICAgICAgICdidG4nOiB0cnVlLFxuICAgICAgICAnYnRuLXNtJzogdHJ1ZSxcbiAgICAgICAgJ3NlbGVjdGVkJzogbW9kZVZhbHVlID09PSBjb21taXRNb2RlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAga2V5PXttb2RlVmFsdWV9XG4gICAgICAgICAgZGlzYWJsZWQ9e2lzTG9hZGluZ31cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLl9vbkNoYW5nZUNvbW1pdE1vZGUobW9kZVZhbHVlKX0+XG4gICAgICAgICAge21vZGVWYWx1ZX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLW1vZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZXNzYWdlLWVkaXRvci13cmFwcGVyXCI+XG4gICAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgICByZWY9XCJtZXNzYWdlXCJcbiAgICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgICAgIHJlYWRPbmx5PXtpc0xvYWRpbmd9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgYnRuLWdyb3VwLXNtIGlubGluZS1ibG9ja1wiPlxuICAgICAgICAgICAge2NvbW1pdE1vZGVzfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHthY3Rpb25Pck1lc3NhZ2V9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrQ29tbWl0KCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLmNvbW1pdCh0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpKTtcbiAgfVxuXG4gIF9vbkNoYW5nZUNvbW1pdE1vZGUoY29tbWl0TW9kZTogQ29tbWl0TW9kZVR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRDb21taXRNb2RlKGNvbW1pdE1vZGUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZkNvbW1pdFZpZXc7XG4iXX0=