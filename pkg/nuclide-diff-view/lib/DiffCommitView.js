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

var _nuclideUiAtomTextEditor = require('../../nuclide-ui-atom-text-editor');

var _nuclideUiAtomTextEditor2 = _interopRequireDefault(_nuclideUiAtomTextEditor);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _constants = require('./constants');

var _nuclideUiCheckbox = require('../../nuclide-ui-checkbox');

var _nuclideUiCheckbox2 = _interopRequireDefault(_nuclideUiCheckbox);

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
          _reactForAtom.React.createElement(_nuclideUiAtomTextEditor2['default'], {
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
            _reactForAtom.React.createElement(_nuclideUiCheckbox2['default'], {
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
//# sourceMappingURL=data:application/json;base64,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UztBQUNyQixVQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQzdFOzs7V0FFYSx3QkFBQyxTQUFrQixFQUFRO0FBQ3ZDLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQ3hDLHNCQUFXLEtBQUssR0FDaEIsc0JBQVcsTUFBTSxDQUNwQixDQUFDO0tBQ0g7OztTQXhGRyxjQUFjO0dBQVMsb0JBQU0sU0FBUzs7QUEyRjVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6IkRpZmZDb21taXRWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbW1pdE1vZGVTdGF0ZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuXG5pbXBvcnQgQXRvbVRleHRFZGl0b3IgZnJvbSAnLi4vLi4vbnVjbGlkZS11aS1hdG9tLXRleHQtZWRpdG9yJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtDb21taXRNb2RlLCBDb21taXRNb2RlU3RhdGV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCBOdWNsaWRlQ2hlY2tib3ggZnJvbSAnLi4vLi4vbnVjbGlkZS11aS1jaGVja2JveCc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgY29tbWl0TWVzc2FnZTogP3N0cmluZztcbiAgY29tbWl0TW9kZTogc3RyaW5nO1xuICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZVR5cGU7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbmNsYXNzIERpZmZDb21taXRWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DbGlja0NvbW1pdCA9IHRoaXMuX29uQ2xpY2tDb21taXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Ub2dnbGVBbWVuZCA9IHRoaXMuX29uVG9nZ2xlQW1lbmQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3NldENvbW1pdE1lc3NhZ2UoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzLCBwcmV2U3RhdGU6IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jb21taXRNZXNzYWdlICE9PSBwcmV2UHJvcHMuY29tbWl0TWVzc2FnZSkge1xuICAgICAgdGhpcy5fc2V0Q29tbWl0TWVzc2FnZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRDb21taXRNZXNzYWdlKCk6IHZvaWQge1xuICAgIHRoaXMucmVmc1snbWVzc2FnZSddLmdldFRleHRCdWZmZXIoKS5zZXRUZXh0KHRoaXMucHJvcHMuY29tbWl0TWVzc2FnZSB8fCAnJyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7Y29tbWl0TW9kZVN0YXRlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgaXNMb2FkaW5nID0gY29tbWl0TW9kZVN0YXRlICE9PSBDb21taXRNb2RlU3RhdGUuUkVBRFk7XG5cbiAgICBsZXQgbWVzc2FnZTtcbiAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICBzd2l0Y2ggKGNvbW1pdE1vZGVTdGF0ZSkge1xuICAgICAgICBjYXNlIENvbW1pdE1vZGVTdGF0ZS5BV0FJVElOR19DT01NSVQ6XG4gICAgICAgICAgbWVzc2FnZSA9ICdDb21taXR0aW5nLi4uJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBDb21taXRNb2RlU3RhdGUuTE9BRElOR19DT01NSVRfTUVTU0FHRTpcbiAgICAgICAgICBtZXNzYWdlID0gJ0xvYWRpbmcuLi4nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG1lc3NhZ2UgPSAnVW5rbm93biBDb21taXQgU3RhdGUhJztcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZSA9ICdDb21taXQnO1xuICAgIH1cblxuICAgIGNvbnN0IGJ0bkNsYXNzbmFtZSA9IGNsYXNzbmFtZXMoJ2J0biBidG4tc20gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodCcsIHtcbiAgICAgICdidG4tcHJvZ3Jlc3MnOiBpc0xvYWRpbmcsXG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLW1vZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZXNzYWdlLWVkaXRvci13cmFwcGVyXCI+XG4gICAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgICBndXR0ZXJIaWRkZW49e3RydWV9XG4gICAgICAgICAgICBwYXRoPVwiLkhHX0NPTU1JVF9FRElUTVNHXCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXtpc0xvYWRpbmd9XG4gICAgICAgICAgICByZWY9XCJtZXNzYWdlXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyIG51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXItYm90dG9tXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICAgIDxOdWNsaWRlQ2hlY2tib3hcbiAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5jb21taXRNb2RlID09PSBDb21taXRNb2RlLkFNRU5EfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17aXNMb2FkaW5nfVxuICAgICAgICAgICAgICBsYWJlbD1cIkFtZW5kXCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uVG9nZ2xlQW1lbmR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci1yaWdodFwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2J0bkNsYXNzbmFtZX1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2lzTG9hZGluZ31cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja0NvbW1pdH0+XG4gICAgICAgICAgICAgIHttZXNzYWdlfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrQ29tbWl0KCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLmNvbW1pdCh0aGlzLnJlZnNbJ21lc3NhZ2UnXS5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpKTtcbiAgfVxuXG4gIF9vblRvZ2dsZUFtZW5kKGlzQ2hlY2tlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldENvbW1pdE1vZGUoaXNDaGVja2VkXG4gICAgICA/IENvbW1pdE1vZGUuQU1FTkRcbiAgICAgIDogQ29tbWl0TW9kZS5DT01NSVRcbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZkNvbW1pdFZpZXc7XG4iXX0=