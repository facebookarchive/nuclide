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

var _nuclideUiLibAtomTextEditor = require('../../nuclide-ui/lib/AtomTextEditor');

var _nuclideUiLibCheckbox = require('../../nuclide-ui/lib/Checkbox');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _constants = require('./constants');

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarLeft = require('../../nuclide-ui/lib/ToolbarLeft');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

var DiffCommitView = (function (_React$Component) {
  _inherits(DiffCommitView, _React$Component);

  function DiffCommitView(props) {
    _classCallCheck(this, DiffCommitView);

    _get(Object.getPrototypeOf(DiffCommitView.prototype), 'constructor', this).call(this, props);
    this._onClickCommit = this._onClickCommit.bind(this);
    this._onToggleAmend = this._onToggleAmend.bind(this);
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
      var commitModeState = this.props.commitModeState;

      var isLoading = commitModeState !== _constants.CommitModeState.READY;

      var message = undefined;
      if (isLoading) {
        switch (commitModeState) {
          case _constants.CommitModeState.AWAITING_COMMIT:
            message = 'Committing...';
            break;
          case _constants.CommitModeState.LOADING_COMMIT_MESSAGE:
            message = 'Loading...';
            break;
          default:
            message = 'Unknown Commit State!';
            break;
        }
      } else {
        message = 'Commit';
      }

      var btnClassname = (0, _classnames2['default'])('btn btn-sm btn-success pull-right', {
        'btn-progress': isLoading
      });
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-mode' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          _reactForAtom.React.createElement(_nuclideUiLibAtomTextEditor.AtomTextEditor, {
            gutterHidden: true,
            path: '.HG_COMMIT_EDITMSG',
            readOnly: isLoading,
            ref: 'message'
          })
        ),
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbar.Toolbar,
          { location: 'bottom' },
          _reactForAtom.React.createElement(
            _nuclideUiLibToolbarLeft.ToolbarLeft,
            null,
            _reactForAtom.React.createElement(_nuclideUiLibCheckbox.Checkbox, {
              checked: this.props.commitMode === _constants.CommitMode.AMEND,
              disabled: isLoading,
              label: 'Amend',
              onChange: this._onToggleAmend
            })
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibToolbarRight.ToolbarRight,
            null,
            _reactForAtom.React.createElement(
              'button',
              {
                className: btnClassname,
                disabled: isLoading,
                onClick: this._onClickCommit },
              message
            )
          )
        )
      );
    }
  }, {
    key: '_onClickCommit',
    value: function _onClickCommit() {
      this.props.diffModel.commit(this._getCommitMessage());
    }
  }, {
    key: '_getCommitMessage',
    value: function _getCommitMessage() {
      return this.refs['message'].getTextBuffer().getText();
    }
  }, {
    key: '_onToggleAmend',
    value: function _onToggleAmend(isChecked) {
      this.props.diffModel.setCommitMode(isChecked ? _constants.CommitMode.AMEND : _constants.CommitMode.COMMIT);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // Save the latest edited commit message for layout switches.
      var message = this._getCommitMessage();
      var diffModel = this.props.diffModel;

      // Let the component unmount before propagating the final message change to the model,
      // So the subsequent change event avoids re-rendering this component.
      process.nextTick(function () {
        diffModel.setCommitMessage(message);
      });
    }
  }]);

  return DiffCommitView;
})(_reactForAtom.React.Component);

module.exports = DiffCommitView;
//# sourceMappingURL=data:application/json;base64,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QixVQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztLQUN2RDs7O1dBRWdCLDZCQUFXO0FBQzFCLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN2RDs7O1dBRWEsd0JBQUMsU0FBa0IsRUFBUTtBQUN2QyxVQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUN4QyxzQkFBVyxLQUFLLEdBQ2hCLHNCQUFXLE1BQU0sQ0FDcEIsQ0FBQztLQUNIOzs7V0FFbUIsZ0NBQVM7O0FBRTNCLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1VBQ2xDLFNBQVMsR0FBSSxJQUFJLENBQUMsS0FBSyxDQUF2QixTQUFTOzs7O0FBR2hCLGFBQU8sQ0FBQyxRQUFRLENBQUMsWUFBTTtBQUNyQixpQkFBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3JDLENBQUMsQ0FBQztLQUNKOzs7U0F2R0csY0FBYztHQUFTLG9CQUFNLFNBQVM7O0FBMEc1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJEaWZmQ29tbWl0Vmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDb21taXRNb2RlU3RhdGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcblxuaW1wb3J0IHtBdG9tVGV4dEVkaXRvcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbVRleHRFZGl0b3InO1xuaW1wb3J0IHtDaGVja2JveH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQ2hlY2tib3gnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge0NvbW1pdE1vZGUsIENvbW1pdE1vZGVTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtUb29sYmFyfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyJztcbmltcG9ydCB7VG9vbGJhckxlZnR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJMZWZ0JztcbmltcG9ydCB7VG9vbGJhclJpZ2h0fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyUmlnaHQnO1xuXG50eXBlIFByb3BzID0ge1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xuICBjb21taXRNb2RlOiBzdHJpbmc7XG4gIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlVHlwZTtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuY2xhc3MgRGlmZkNvbW1pdFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrQ29tbWl0ID0gdGhpcy5fb25DbGlja0NvbW1pdC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblRvZ2dsZUFtZW5kID0gdGhpcy5fb25Ub2dnbGVBbWVuZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0Q29tbWl0TWVzc2FnZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLmNvbW1pdE1lc3NhZ2UgIT09IHByZXZQcm9wcy5jb21taXRNZXNzYWdlKSB7XG4gICAgICB0aGlzLl9zZXRDb21taXRNZXNzYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldENvbW1pdE1lc3NhZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5jb21taXRNZXNzYWdlIHx8ICcnKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtjb21taXRNb2RlU3RhdGV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBpc0xvYWRpbmcgPSBjb21taXRNb2RlU3RhdGUgIT09IENvbW1pdE1vZGVTdGF0ZS5SRUFEWTtcblxuICAgIGxldCBtZXNzYWdlO1xuICAgIGlmIChpc0xvYWRpbmcpIHtcbiAgICAgIHN3aXRjaCAoY29tbWl0TW9kZVN0YXRlKSB7XG4gICAgICAgIGNhc2UgQ29tbWl0TW9kZVN0YXRlLkFXQUlUSU5HX0NPTU1JVDpcbiAgICAgICAgICBtZXNzYWdlID0gJ0NvbW1pdHRpbmcuLi4nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIENvbW1pdE1vZGVTdGF0ZS5MT0FESU5HX0NPTU1JVF9NRVNTQUdFOlxuICAgICAgICAgIG1lc3NhZ2UgPSAnTG9hZGluZy4uLic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbWVzc2FnZSA9ICdVbmtub3duIENvbW1pdCBTdGF0ZSEnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlID0gJ0NvbW1pdCc7XG4gICAgfVxuXG4gICAgY29uc3QgYnRuQ2xhc3NuYW1lID0gY2xhc3NuYW1lcygnYnRuIGJ0bi1zbSBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0Jywge1xuICAgICAgJ2J0bi1wcm9ncmVzcyc6IGlzTG9hZGluZyxcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtbW9kZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtZWRpdG9yLXdyYXBwZXJcIj5cbiAgICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgICAgIHBhdGg9XCIuSEdfQ09NTUlUX0VESVRNU0dcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e2lzTG9hZGluZ31cbiAgICAgICAgICAgIHJlZj1cIm1lc3NhZ2VcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8VG9vbGJhciBsb2NhdGlvbj1cImJvdHRvbVwiPlxuICAgICAgICAgIDxUb29sYmFyTGVmdD5cbiAgICAgICAgICAgIDxDaGVja2JveFxuICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmNvbW1pdE1vZGUgPT09IENvbW1pdE1vZGUuQU1FTkR9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtpc0xvYWRpbmd9XG4gICAgICAgICAgICAgIGxhYmVsPVwiQW1lbmRcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25Ub2dnbGVBbWVuZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Ub29sYmFyTGVmdD5cbiAgICAgICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2J0bkNsYXNzbmFtZX1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2lzTG9hZGluZ31cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja0NvbW1pdH0+XG4gICAgICAgICAgICAgIHttZXNzYWdlfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9Ub29sYmFyUmlnaHQ+XG4gICAgICAgIDwvVG9vbGJhcj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfb25DbGlja0NvbW1pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5jb21taXQodGhpcy5fZ2V0Q29tbWl0TWVzc2FnZSgpKTtcbiAgfVxuXG4gIF9nZXRDb21taXRNZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snbWVzc2FnZSddLmdldFRleHRCdWZmZXIoKS5nZXRUZXh0KCk7XG4gIH1cblxuICBfb25Ub2dnbGVBbWVuZChpc0NoZWNrZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRDb21taXRNb2RlKGlzQ2hlY2tlZFxuICAgICAgPyBDb21taXRNb2RlLkFNRU5EXG4gICAgICA6IENvbW1pdE1vZGUuQ09NTUlUXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIC8vIFNhdmUgdGhlIGxhdGVzdCBlZGl0ZWQgY29tbWl0IG1lc3NhZ2UgZm9yIGxheW91dCBzd2l0Y2hlcy5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fZ2V0Q29tbWl0TWVzc2FnZSgpO1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICAvLyBMZXQgdGhlIGNvbXBvbmVudCB1bm1vdW50IGJlZm9yZSBwcm9wYWdhdGluZyB0aGUgZmluYWwgbWVzc2FnZSBjaGFuZ2UgdG8gdGhlIG1vZGVsLFxuICAgIC8vIFNvIHRoZSBzdWJzZXF1ZW50IGNoYW5nZSBldmVudCBhdm9pZHMgcmUtcmVuZGVyaW5nIHRoaXMgY29tcG9uZW50LlxuICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgZGlmZk1vZGVsLnNldENvbW1pdE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmQ29tbWl0VmlldztcbiJdfQ==