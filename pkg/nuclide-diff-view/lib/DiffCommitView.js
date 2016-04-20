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

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

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

      var btnClassname = (0, _classnames2['default'])('pull-right', {
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
              _nuclideUiLibButton.Button,
              {
                className: btnClassname,
                size: _nuclideUiLibButton.ButtonSizes.SMALL,
                buttonType: _nuclideUiLibButton.ButtonTypes.SUCCESS,
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
//# sourceMappingURL=data:application/json;base64,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LElBQUksQ0FBQyxjQUFjLEFBQUM7Y0FDNUIsT0FBTzthQUNEO1dBQ0k7U0FDUDtPQUNOLENBQ047S0FDSDs7O1dBRWEsMEJBQVM7QUFDckIsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7S0FDdkQ7OztXQUVnQiw2QkFBVztBQUMxQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkQ7OztXQUVhLHdCQUFDLFNBQWtCLEVBQVE7QUFDdkMsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FDeEMsc0JBQVcsS0FBSyxHQUNoQixzQkFBVyxNQUFNLENBQ3BCLENBQUM7S0FDSDs7O1dBRW1CLGdDQUFTOztBQUUzQixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztVQUNsQyxTQUFTLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBdkIsU0FBUzs7OztBQUdoQixhQUFPLENBQUMsUUFBUSxDQUFDLFlBQU07QUFDckIsaUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNyQyxDQUFDLENBQUM7S0FDSjs7O1NBekdHLGNBQWM7R0FBUyxvQkFBTSxTQUFTOztBQTRHNUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoiRGlmZkNvbW1pdFZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q29tbWl0TW9kZVN0YXRlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5cbmltcG9ydCB7QXRvbVRleHRFZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21UZXh0RWRpdG9yJztcbmltcG9ydCB7Q2hlY2tib3h9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0NoZWNrYm94JztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtDb21taXRNb2RlLCBDb21taXRNb2RlU3RhdGV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQnV0dG9uU2l6ZXMsXG4gIEJ1dHRvblR5cGVzLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuaW1wb3J0IHtUb29sYmFyfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyJztcbmltcG9ydCB7VG9vbGJhckxlZnR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJMZWZ0JztcbmltcG9ydCB7VG9vbGJhclJpZ2h0fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyUmlnaHQnO1xuXG50eXBlIFByb3BzID0ge1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xuICBjb21taXRNb2RlOiBzdHJpbmc7XG4gIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlVHlwZTtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuY2xhc3MgRGlmZkNvbW1pdFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrQ29tbWl0ID0gdGhpcy5fb25DbGlja0NvbW1pdC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblRvZ2dsZUFtZW5kID0gdGhpcy5fb25Ub2dnbGVBbWVuZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0Q29tbWl0TWVzc2FnZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLmNvbW1pdE1lc3NhZ2UgIT09IHByZXZQcm9wcy5jb21taXRNZXNzYWdlKSB7XG4gICAgICB0aGlzLl9zZXRDb21taXRNZXNzYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldENvbW1pdE1lc3NhZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZzWydtZXNzYWdlJ10uZ2V0VGV4dEJ1ZmZlcigpLnNldFRleHQodGhpcy5wcm9wcy5jb21taXRNZXNzYWdlIHx8ICcnKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB7Y29tbWl0TW9kZVN0YXRlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgaXNMb2FkaW5nID0gY29tbWl0TW9kZVN0YXRlICE9PSBDb21taXRNb2RlU3RhdGUuUkVBRFk7XG5cbiAgICBsZXQgbWVzc2FnZTtcbiAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICBzd2l0Y2ggKGNvbW1pdE1vZGVTdGF0ZSkge1xuICAgICAgICBjYXNlIENvbW1pdE1vZGVTdGF0ZS5BV0FJVElOR19DT01NSVQ6XG4gICAgICAgICAgbWVzc2FnZSA9ICdDb21taXR0aW5nLi4uJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBDb21taXRNb2RlU3RhdGUuTE9BRElOR19DT01NSVRfTUVTU0FHRTpcbiAgICAgICAgICBtZXNzYWdlID0gJ0xvYWRpbmcuLi4nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG1lc3NhZ2UgPSAnVW5rbm93biBDb21taXQgU3RhdGUhJztcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZSA9ICdDb21taXQnO1xuICAgIH1cblxuICAgIGNvbnN0IGJ0bkNsYXNzbmFtZSA9IGNsYXNzbmFtZXMoJ3B1bGwtcmlnaHQnLCB7XG4gICAgICAnYnRuLXByb2dyZXNzJzogaXNMb2FkaW5nLFxuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi1tb2RlXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWVzc2FnZS1lZGl0b3Itd3JhcHBlclwiPlxuICAgICAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICAgICAgcGF0aD1cIi5IR19DT01NSVRfRURJVE1TR1wiXG4gICAgICAgICAgICByZWFkT25seT17aXNMb2FkaW5nfVxuICAgICAgICAgICAgcmVmPVwibWVzc2FnZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxUb29sYmFyIGxvY2F0aW9uPVwiYm90dG9tXCI+XG4gICAgICAgICAgPFRvb2xiYXJMZWZ0PlxuICAgICAgICAgICAgPENoZWNrYm94XG4gICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMuY29tbWl0TW9kZSA9PT0gQ29tbWl0TW9kZS5BTUVORH1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2lzTG9hZGluZ31cbiAgICAgICAgICAgICAgbGFiZWw9XCJBbWVuZFwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblRvZ2dsZUFtZW5kfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L1Rvb2xiYXJMZWZ0PlxuICAgICAgICAgIDxUb29sYmFyUmlnaHQ+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YnRuQ2xhc3NuYW1lfVxuICAgICAgICAgICAgICBzaXplPXtCdXR0b25TaXplcy5TTUFMTH1cbiAgICAgICAgICAgICAgYnV0dG9uVHlwZT17QnV0dG9uVHlwZXMuU1VDQ0VTU31cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2lzTG9hZGluZ31cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja0NvbW1pdH0+XG4gICAgICAgICAgICAgIHttZXNzYWdlfVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9Ub29sYmFyUmlnaHQ+XG4gICAgICAgIDwvVG9vbGJhcj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfb25DbGlja0NvbW1pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5jb21taXQodGhpcy5fZ2V0Q29tbWl0TWVzc2FnZSgpKTtcbiAgfVxuXG4gIF9nZXRDb21taXRNZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snbWVzc2FnZSddLmdldFRleHRCdWZmZXIoKS5nZXRUZXh0KCk7XG4gIH1cblxuICBfb25Ub2dnbGVBbWVuZChpc0NoZWNrZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRDb21taXRNb2RlKGlzQ2hlY2tlZFxuICAgICAgPyBDb21taXRNb2RlLkFNRU5EXG4gICAgICA6IENvbW1pdE1vZGUuQ09NTUlUXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIC8vIFNhdmUgdGhlIGxhdGVzdCBlZGl0ZWQgY29tbWl0IG1lc3NhZ2UgZm9yIGxheW91dCBzd2l0Y2hlcy5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fZ2V0Q29tbWl0TWVzc2FnZSgpO1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICAvLyBMZXQgdGhlIGNvbXBvbmVudCB1bm1vdW50IGJlZm9yZSBwcm9wYWdhdGluZyB0aGUgZmluYWwgbWVzc2FnZSBjaGFuZ2UgdG8gdGhlIG1vZGVsLFxuICAgIC8vIFNvIHRoZSBzdWJzZXF1ZW50IGNoYW5nZSBldmVudCBhdm9pZHMgcmUtcmVuZGVyaW5nIHRoaXMgY29tcG9uZW50LlxuICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgZGlmZk1vZGVsLnNldENvbW1pdE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmQ29tbWl0VmlldztcbiJdfQ==