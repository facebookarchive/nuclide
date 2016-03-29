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

var _nuclideUiLibNuclideCheckbox = require('../../nuclide-ui/lib/NuclideCheckbox');

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
          'div',
          { className: 'nuclide-diff-view-toolbar nuclide-diff-view-toolbar-bottom' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'nuclide-diff-view-toolbar-left' },
            _reactForAtom.React.createElement(_nuclideUiLibNuclideCheckbox.NuclideCheckbox, {
              checked: this.props.commitMode === _constants.CommitMode.AMEND,
              disabled: isLoading,
              label: 'Amend',
              onChange: this._onToggleAmend
            })
          ),
          _reactForAtom.React.createElement(
            'div',
            { className: 'nuclide-diff-view-toolbar-right' },
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
//# sourceMappingURL=data:application/json;base64,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Q3JCLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZEOzs7V0FFZ0IsNkJBQVc7QUFDMUIsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZEOzs7V0FFYSx3QkFBQyxTQUFrQixFQUFRO0FBQ3ZDLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQ3hDLHNCQUFXLEtBQUssR0FDaEIsc0JBQVcsTUFBTSxDQUNwQixDQUFDO0tBQ0g7OztXQUVtQixnQ0FBUzs7QUFFM0IsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7VUFDbEMsU0FBUyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQXZCLFNBQVM7Ozs7QUFHaEIsYUFBTyxDQUFDLFFBQVEsQ0FBQyxZQUFNO0FBQ3JCLGlCQUFTLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDckMsQ0FBQyxDQUFDO0tBQ0o7OztTQXZHRyxjQUFjO0dBQVMsb0JBQU0sU0FBUzs7QUEwRzVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6IkRpZmZDb21taXRWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbW1pdE1vZGVTdGF0ZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuXG5pbXBvcnQge0F0b21UZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tVGV4dEVkaXRvcic7XG5pbXBvcnQge051Y2xpZGVDaGVja2JveH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvTnVjbGlkZUNoZWNrYm94JztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtDb21taXRNb2RlLCBDb21taXRNb2RlU3RhdGV9IGZyb20gJy4vY29uc3RhbnRzJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xuICBjb21taXRNb2RlOiBzdHJpbmc7XG4gIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlVHlwZTtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuY2xhc3MgRGlmZkNvbW1pdFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrQ29tbWl0ID0gdGhpcy5fb25DbGlja0NvbW1pdC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblRvZ2dsZUFtZW5kID0gdGhpcy5fb25Ub2dnbGVBbWVuZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0Q29tbWl0TWVzc2FnZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLmNvbW1pdE1lc3NhZ2UgIT09IHByZXZQcm9wcy5jb21taXRNZXNzYWdlKSB7XG4gICAgICB0aGlzLl9zZXRDb21taXRNZXNzYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldENvbW1pdE1lc3NhZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5jb21taXRNZXNzYWdlIHx8ICcnKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtjb21taXRNb2RlU3RhdGV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBpc0xvYWRpbmcgPSBjb21taXRNb2RlU3RhdGUgIT09IENvbW1pdE1vZGVTdGF0ZS5SRUFEWTtcblxuICAgIGxldCBtZXNzYWdlO1xuICAgIGlmIChpc0xvYWRpbmcpIHtcbiAgICAgIHN3aXRjaCAoY29tbWl0TW9kZVN0YXRlKSB7XG4gICAgICAgIGNhc2UgQ29tbWl0TW9kZVN0YXRlLkFXQUlUSU5HX0NPTU1JVDpcbiAgICAgICAgICBtZXNzYWdlID0gJ0NvbW1pdHRpbmcuLi4nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIENvbW1pdE1vZGVTdGF0ZS5MT0FESU5HX0NPTU1JVF9NRVNTQUdFOlxuICAgICAgICAgIG1lc3NhZ2UgPSAnTG9hZGluZy4uLic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbWVzc2FnZSA9ICdVbmtub3duIENvbW1pdCBTdGF0ZSEnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlID0gJ0NvbW1pdCc7XG4gICAgfVxuXG4gICAgY29uc3QgYnRuQ2xhc3NuYW1lID0gY2xhc3NuYW1lcygnYnRuIGJ0bi1zbSBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0Jywge1xuICAgICAgJ2J0bi1wcm9ncmVzcyc6IGlzTG9hZGluZyxcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtbW9kZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtZWRpdG9yLXdyYXBwZXJcIj5cbiAgICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgICAgIHBhdGg9XCIuSEdfQ09NTUlUX0VESVRNU0dcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e2lzTG9hZGluZ31cbiAgICAgICAgICAgIHJlZj1cIm1lc3NhZ2VcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXIgbnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci1ib3R0b21cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXItbGVmdFwiPlxuICAgICAgICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmNvbW1pdE1vZGUgPT09IENvbW1pdE1vZGUuQU1FTkR9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtpc0xvYWRpbmd9XG4gICAgICAgICAgICAgIGxhYmVsPVwiQW1lbmRcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25Ub2dnbGVBbWVuZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLXJpZ2h0XCI+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YnRuQ2xhc3NuYW1lfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17aXNMb2FkaW5nfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrQ29tbWl0fT5cbiAgICAgICAgICAgICAge21lc3NhZ2V9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX29uQ2xpY2tDb21taXQoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuY29tbWl0KHRoaXMuX2dldENvbW1pdE1lc3NhZ2UoKSk7XG4gIH1cblxuICBfZ2V0Q29tbWl0TWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpO1xuICB9XG5cbiAgX29uVG9nZ2xlQW1lbmQoaXNDaGVja2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0Q29tbWl0TW9kZShpc0NoZWNrZWRcbiAgICAgID8gQ29tbWl0TW9kZS5BTUVORFxuICAgICAgOiBDb21taXRNb2RlLkNPTU1JVFxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAvLyBTYXZlIHRoZSBsYXRlc3QgZWRpdGVkIGNvbW1pdCBtZXNzYWdlIGZvciBsYXlvdXQgc3dpdGNoZXMuXG4gICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2dldENvbW1pdE1lc3NhZ2UoKTtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgLy8gTGV0IHRoZSBjb21wb25lbnQgdW5tb3VudCBiZWZvcmUgcHJvcGFnYXRpbmcgdGhlIGZpbmFsIG1lc3NhZ2UgY2hhbmdlIHRvIHRoZSBtb2RlbCxcbiAgICAvLyBTbyB0aGUgc3Vic2VxdWVudCBjaGFuZ2UgZXZlbnQgYXZvaWRzIHJlLXJlbmRlcmluZyB0aGlzIGNvbXBvbmVudC5cbiAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHtcbiAgICAgIGRpZmZNb2RlbC5zZXRDb21taXRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZkNvbW1pdFZpZXc7XG4iXX0=