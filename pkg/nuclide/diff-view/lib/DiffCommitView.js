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

var _uiCheckbox = require('../../ui/checkbox');

var _uiCheckbox2 = _interopRequireDefault(_uiCheckbox);

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
          _reactForAtom.React.createElement(_uiAtomTextEditor2['default'], {
            ref: 'message',
            gutterHidden: true,
            readOnly: isLoading
          })
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-diff-view-toolbar nuclide-diff-view-toolbar-bottom' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'nuclide-diff-view-toolbar-left' },
            _reactForAtom.React.createElement(_uiCheckbox2['default'], {
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
      this.props.diffModel.commit(this.refs['message'].getTextBuffer().getText());
    }
  }, {
    key: '_onToggleAmend',
    value: function _onToggleAmend(isChecked) {
      this.props.diffModel.setCommitMode(isChecked ? _constants.CommitMode.AMEND : _constants.CommitMode.COMMIT);
    }
  }]);

  return DiffCommitView;
})(_reactForAtom.React.Component);

module.exports = DiffCommitView;
//# sourceMappingURL=data:application/json;base64,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QUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQzdFOzs7V0FFYSx3QkFBQyxTQUFrQixFQUFRO0FBQ3ZDLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQ3hDLHNCQUFXLEtBQUssR0FDaEIsc0JBQVcsTUFBTSxDQUNwQixDQUFDO0tBQ0g7OztTQXZGRyxjQUFjO0dBQVMsb0JBQU0sU0FBUzs7QUEwRjVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6IkRpZmZDb21taXRWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbW1pdE1vZGVTdGF0ZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuXG5pbXBvcnQgQXRvbVRleHRFZGl0b3IgZnJvbSAnLi4vLi4vdWkvYXRvbS10ZXh0LWVkaXRvcic7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7Q29tbWl0TW9kZSwgQ29tbWl0TW9kZVN0YXRlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgTnVjbGlkZUNoZWNrYm94IGZyb20gJy4uLy4uL3VpL2NoZWNrYm94JztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xuICBjb21taXRNb2RlOiBzdHJpbmc7XG4gIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlVHlwZTtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuY2xhc3MgRGlmZkNvbW1pdFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrQ29tbWl0ID0gdGhpcy5fb25DbGlja0NvbW1pdC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblRvZ2dsZUFtZW5kID0gdGhpcy5fb25Ub2dnbGVBbWVuZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0Q29tbWl0TWVzc2FnZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLmNvbW1pdE1lc3NhZ2UgIT09IHByZXZQcm9wcy5jb21taXRNZXNzYWdlKSB7XG4gICAgICB0aGlzLl9zZXRDb21taXRNZXNzYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldENvbW1pdE1lc3NhZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5jb21taXRNZXNzYWdlIHx8ICcnKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtjb21taXRNb2RlU3RhdGV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBpc0xvYWRpbmcgPSBjb21taXRNb2RlU3RhdGUgIT09IENvbW1pdE1vZGVTdGF0ZS5SRUFEWTtcblxuICAgIGxldCBtZXNzYWdlO1xuICAgIGlmIChpc0xvYWRpbmcpIHtcbiAgICAgIHN3aXRjaCAoY29tbWl0TW9kZVN0YXRlKSB7XG4gICAgICAgIGNhc2UgQ29tbWl0TW9kZVN0YXRlLkFXQUlUSU5HX0NPTU1JVDpcbiAgICAgICAgICBtZXNzYWdlID0gJ0NvbW1pdHRpbmcuLi4nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIENvbW1pdE1vZGVTdGF0ZS5MT0FESU5HX0NPTU1JVF9NRVNTQUdFOlxuICAgICAgICAgIG1lc3NhZ2UgPSAnTG9hZGluZy4uLic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbWVzc2FnZSA9ICdVbmtub3duIENvbW1pdCBTdGF0ZSEnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlID0gJ0NvbW1pdCc7XG4gICAgfVxuXG4gICAgY29uc3QgYnRuQ2xhc3NuYW1lID0gY2xhc3NuYW1lcygnYnRuIGJ0bi1zbSBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0Jywge1xuICAgICAgJ2J0bi1wcm9ncmVzcyc6IGlzTG9hZGluZyxcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtbW9kZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtZWRpdG9yLXdyYXBwZXJcIj5cbiAgICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICAgIHJlZj1cIm1lc3NhZ2VcIlxuICAgICAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICAgICAgcmVhZE9ubHk9e2lzTG9hZGluZ31cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyIG51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXItYm90dG9tXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICAgIDxOdWNsaWRlQ2hlY2tib3hcbiAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5jb21taXRNb2RlID09PSBDb21taXRNb2RlLkFNRU5EfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17aXNMb2FkaW5nfVxuICAgICAgICAgICAgICBsYWJlbD1cIkFtZW5kXCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uVG9nZ2xlQW1lbmR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci1yaWdodFwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2J0bkNsYXNzbmFtZX1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2lzTG9hZGluZ31cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja0NvbW1pdH0+XG4gICAgICAgICAgICAgIHttZXNzYWdlfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrQ29tbWl0KCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLmNvbW1pdCh0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpKTtcbiAgfVxuXG4gIF9vblRvZ2dsZUFtZW5kKGlzQ2hlY2tlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldENvbW1pdE1vZGUoaXNDaGVja2VkXG4gICAgICA/IENvbW1pdE1vZGUuQU1FTkRcbiAgICAgIDogQ29tbWl0TW9kZS5DT01NSVRcbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZkNvbW1pdFZpZXc7XG4iXX0=