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

var _constants = require('./constants');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _notifications = require('./notifications');

var _reactForAtom = require('react-for-atom');

var DiffCommitView = (function (_React$Component) {
  _inherits(DiffCommitView, _React$Component);

  function DiffCommitView(props) {
    _classCallCheck(this, DiffCommitView);

    _get(Object.getPrototypeOf(DiffCommitView.prototype), 'constructor', this).call(this, props);
    var commitMode = _constants.CommitMode.COMMIT;
    this.state = {
      commitMode: commitMode,
      commitMessage: null,
      loading: true
    };
    this._onClickCommit = this._onClickCommit.bind(this);
  }

  _createClass(DiffCommitView, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this._loadCommitMessage(this.state.commitMode);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var loadingIndicator = null;
      var commitButton = null;
      var _state = this.state;
      var commitMode = _state.commitMode;
      var loading = _state.loading;

      if (loading) {
        loadingIndicator = _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-tiny inline-block' });
      } else {
        commitButton = _reactForAtom.React.createElement(
          'button',
          { className: 'btn btn-success commit-button',
            onClick: this._onClickCommit },
          commitMode,
          ' to HEAD'
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
            onClick: function () {
              return _this._onChangeCommitMode(modeValue);
            } },
          modeValue
        );
      });
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-commit-view' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          _reactForAtom.React.createElement(_uiAtomTextEditor2['default'], {
            ref: 'message',
            readOnly: this.state.loading,
            gutterHidden: true
          })
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'tool-panel' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'btn-group inline-block' },
            commitModes
          ),
          loadingIndicator,
          commitButton
        )
      );
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.refs['message'].getTextBuffer().setText(this.state.commitMessage || '');
    }
  }, {
    key: '_onClickCommit',
    value: function _onClickCommit() {
      // TODO(most): real commit/amend logic.
    }
  }, {
    key: '_onChangeCommitMode',
    value: function _onChangeCommitMode(commitMode) {
      if (commitMode === this.state.commitMode) {
        return;
      }
      this.setState({ commitMode: commitMode, loading: true, commitMessage: null });
      this._loadCommitMessage(commitMode);
    }
  }, {
    key: '_loadCommitMessage',
    value: function _loadCommitMessage(commitMode) {
      var _this2 = this;

      var diffModel = this.props.diffModel;

      var commitMessagePromise = commitMode === _constants.CommitMode.COMMIT ? diffModel.getActiveRepositoryTemplateCommitMessage() : diffModel.getActiveRepositoryLatestCommitMessage();
      commitMessagePromise.then(function (commitMessage) {
        _this2.setState({ commitMode: commitMode, loading: false, commitMessage: commitMessage });
      }, function (error) {
        _this2.setState({ commitMode: commitMode, loading: false, commitMessage: null });
        (0, _notifications.notifyInternalError)(error);
      });
    }
  }]);

  return DiffCommitView;
})(_reactForAtom.React.Component);

module.exports = DiffCommitView;
//# sourceMappingURL=data:application/json;base64,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QUFFO0FBQ3hDLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxVQUFVLEVBQVYsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7QUFDaEUsVUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3JDOzs7V0FFaUIsNEJBQUMsVUFBMEIsRUFBUTs7O1VBQzVDLFNBQVMsR0FBSSxJQUFJLENBQUMsS0FBSyxDQUF2QixTQUFTOztBQUNoQixVQUFNLG9CQUFvQixHQUFHLFVBQVUsS0FBSyxzQkFBVyxNQUFNLEdBQ3pELFNBQVMsQ0FBQyx3Q0FBd0MsRUFBRSxHQUNwRCxTQUFTLENBQUMsc0NBQXNDLEVBQUUsQ0FBQztBQUN2RCwwQkFBb0IsQ0FBQyxJQUFJLENBQ3ZCLFVBQUEsYUFBYSxFQUFJO0FBQ2YsZUFBSyxRQUFRLENBQUMsRUFBQyxVQUFVLEVBQVYsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFiLGFBQWEsRUFBQyxDQUFDLENBQUM7T0FDNUQsRUFDRCxVQUFBLEtBQUssRUFBSTtBQUNQLGVBQUssUUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFWLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQ2pFLGdEQUFvQixLQUFLLENBQUMsQ0FBQztPQUM1QixDQUNGLENBQUM7S0FDSDs7O1NBckdHLGNBQWM7R0FBUyxvQkFBTSxTQUFTOztBQXdHNUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoiRGlmZkNvbW1pdFZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q29tbWl0TW9kZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuXG5pbXBvcnQgQXRvbVRleHRFZGl0b3IgZnJvbSAnLi4vLi4vdWkvYXRvbS10ZXh0LWVkaXRvcic7XG5pbXBvcnQge0NvbW1pdE1vZGV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtub3RpZnlJbnRlcm5hbEVycm9yfSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbnR5cGUgU3RhdGUgPSB7XG4gIGNvbW1pdE1vZGU6IENvbW1pdE1vZGVUeXBlO1xuICBsb2FkaW5nOiBib29sZWFuO1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xufTtcblxuY2xhc3MgRGlmZkNvbW1pdFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc3QgY29tbWl0TW9kZSA9IENvbW1pdE1vZGUuQ09NTUlUO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjb21taXRNb2RlLFxuICAgICAgY29tbWl0TWVzc2FnZTogbnVsbCxcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fb25DbGlja0NvbW1pdCA9IHRoaXMuX29uQ2xpY2tDb21taXQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2FkQ29tbWl0TWVzc2FnZSh0aGlzLnN0YXRlLmNvbW1pdE1vZGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgbGV0IGxvYWRpbmdJbmRpY2F0b3IgPSBudWxsO1xuICAgIGxldCBjb21taXRCdXR0b24gPSBudWxsO1xuICAgIGNvbnN0IHtjb21taXRNb2RlLCBsb2FkaW5nfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGxvYWRpbmcpIHtcbiAgICAgIGxvYWRpbmdJbmRpY2F0b3IgPSAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmcgbG9hZGluZy1zcGlubmVyLXRpbnkgaW5saW5lLWJsb2NrXCI+PC9zcGFuPlxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tbWl0QnV0dG9uID0gKFxuICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tc3VjY2VzcyBjb21taXQtYnV0dG9uXCJcbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrQ29tbWl0fT5cbiAgICAgICAgICB7Y29tbWl0TW9kZX0gdG8gSEVBRFxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1pdE1vZGVzID0gT2JqZWN0LmtleXMoQ29tbWl0TW9kZSkubWFwKG1vZGVJZCA9PiB7XG4gICAgICBjb25zdCBtb2RlVmFsdWUgPSBDb21taXRNb2RlW21vZGVJZF07XG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICAgJ2J0bic6IHRydWUsXG4gICAgICAgICdidG4tc20nOiB0cnVlLFxuICAgICAgICAnc2VsZWN0ZWQnOiBtb2RlVmFsdWUgPT09IGNvbW1pdE1vZGUsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICBrZXk9e21vZGVWYWx1ZX1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLl9vbkNoYW5nZUNvbW1pdE1vZGUobW9kZVZhbHVlKX0+XG4gICAgICAgICAge21vZGVWYWx1ZX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi1jb21taXQtdmlld1wiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtZWRpdG9yLXdyYXBwZXJcIj5cbiAgICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICAgIHJlZj1cIm1lc3NhZ2VcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e3RoaXMuc3RhdGUubG9hZGluZ31cbiAgICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b29sLXBhbmVsXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgICB7Y29tbWl0TW9kZXN9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge2xvYWRpbmdJbmRpY2F0b3J9XG4gICAgICAgICAge2NvbW1pdEJ1dHRvbn1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMucmVmc1snbWVzc2FnZSddLmdldFRleHRCdWZmZXIoKS5zZXRUZXh0KHRoaXMuc3RhdGUuY29tbWl0TWVzc2FnZSB8fCAnJyk7XG4gIH1cblxuICBfb25DbGlja0NvbW1pdCgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKG1vc3QpOiByZWFsIGNvbW1pdC9hbWVuZCBsb2dpYy5cbiAgfVxuXG4gIF9vbkNoYW5nZUNvbW1pdE1vZGUoY29tbWl0TW9kZTogQ29tbWl0TW9kZVR5cGUpOiB2b2lkIHtcbiAgICBpZiAoY29tbWl0TW9kZSA9PT0gdGhpcy5zdGF0ZS5jb21taXRNb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe2NvbW1pdE1vZGUsIGxvYWRpbmc6IHRydWUsIGNvbW1pdE1lc3NhZ2U6IG51bGx9KTtcbiAgICB0aGlzLl9sb2FkQ29tbWl0TWVzc2FnZShjb21taXRNb2RlKTtcbiAgfVxuXG4gIF9sb2FkQ29tbWl0TWVzc2FnZShjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZSk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBjb21taXRNZXNzYWdlUHJvbWlzZSA9IGNvbW1pdE1vZGUgPT09IENvbW1pdE1vZGUuQ09NTUlUXG4gICAgICA/IGRpZmZNb2RlbC5nZXRBY3RpdmVSZXBvc2l0b3J5VGVtcGxhdGVDb21taXRNZXNzYWdlKClcbiAgICAgIDogZGlmZk1vZGVsLmdldEFjdGl2ZVJlcG9zaXRvcnlMYXRlc3RDb21taXRNZXNzYWdlKCk7XG4gICAgY29tbWl0TWVzc2FnZVByb21pc2UudGhlbihcbiAgICAgIGNvbW1pdE1lc3NhZ2UgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb21taXRNb2RlLCBsb2FkaW5nOiBmYWxzZSwgY29tbWl0TWVzc2FnZX0pO1xuICAgICAgfSxcbiAgICAgIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29tbWl0TW9kZSwgbG9hZGluZzogZmFsc2UsIGNvbW1pdE1lc3NhZ2U6IG51bGx9KTtcbiAgICAgICAgbm90aWZ5SW50ZXJuYWxFcnJvcihlcnJvcik7XG4gICAgICB9LFxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmQ29tbWl0VmlldztcbiJdfQ==