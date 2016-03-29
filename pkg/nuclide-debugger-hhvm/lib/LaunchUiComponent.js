Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

var _LaunchProcessInfo = require('./LaunchProcessInfo');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var LaunchUiComponent = (function (_React$Component) {
  _inherits(LaunchUiComponent, _React$Component);

  function LaunchUiComponent(props) {
    _classCallCheck(this, LaunchUiComponent);

    _get(Object.getPrototypeOf(LaunchUiComponent.prototype), 'constructor', this).call(this, props);
    this._getActiveFilePath = this._getActiveFilePath.bind(this);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleLaunchButtonClick = this._handleLaunchButtonClick.bind(this);
  }

  _createClass(LaunchUiComponent, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Command: '
        ),
        _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
          ref: 'scriptPath',
          tabIndex: '11',
          placeholderText: '/path/to/my/script.php arg1 arg2',
          initialValue: this._getActiveFilePath()
        }),
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded text-right' },
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn', onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn btn-primary',
              onClick: this._handleLaunchButtonClick },
            'Launch'
          )
        )
      );
    }
  }, {
    key: '_handleLaunchButtonClick',
    value: function _handleLaunchButtonClick() {
      var scriptPath = this.refs['scriptPath'].getText().trim();
      var processInfo = new _LaunchProcessInfo.LaunchProcessInfo(this.props.targetUri, scriptPath);
      require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote').then(function (debuggerService) {
        return debuggerService.startDebugging(processInfo);
      });
      this._showDebuggerPanel();
      this._handleCancelButtonClick();
    }
  }, {
    key: '_getActiveFilePath',
    value: function _getActiveFilePath() {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        var fileUri = editor.getPath();
        if (fileUri != null && this._isValidScriptUri(fileUri)) {
          return _nuclideRemoteUri2['default'].getPath(fileUri);
        }
      }
      return '';
    }
  }, {
    key: '_isValidScriptUri',
    value: function _isValidScriptUri(uri) {
      if (!_nuclideRemoteUri2['default'].isRemote(uri)) {
        return false;
      }
      var scriptPath = _nuclideRemoteUri2['default'].getPath(uri);
      return scriptPath.endsWith('.php') || scriptPath.endsWith('.hh');
    }
  }, {
    key: '_showDebuggerPanel',
    value: function _showDebuggerPanel() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
    }
  }, {
    key: '_handleCancelButtonClick',
    value: function _handleCancelButtonClick() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
    }
  }]);

  return LaunchUiComponent;
})(_reactForAtom.React.Component);

exports.LaunchUiComponent = LaunchUiComponent;
//# sourceMappingURL=data:application/json;base64,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LENBQUM7S0FDbEU7OztXQUVpQiw4QkFBUztBQUN6QixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUNsQyx1QkFBdUIsQ0FDeEIsQ0FBQztLQUNIOzs7V0FFdUIsb0NBQVM7QUFDL0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsdUNBQXVDLENBQ3hDLENBQUM7S0FDSDs7O1NBM0VVLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiTGF1bmNoVWlDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0F0b21JbnB1dH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbUlucHV0JztcbmltcG9ydCB7TGF1bmNoUHJvY2Vzc0luZm99IGZyb20gJy4vTGF1bmNoUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbnR5cGUgUHJvcHNUeXBlID0ge1xuICB0YXJnZXRVcmk6IE51Y2xpZGVVcmk7XG59XG5leHBvcnQgY2xhc3MgTGF1bmNoVWlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHNUeXBlLCB2b2lkPiB7XG4gIHByb3BzOiBQcm9wc1R5cGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzVHlwZSkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fZ2V0QWN0aXZlRmlsZVBhdGggPSB0aGlzLl9nZXRBY3RpdmVGaWxlUGF0aC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDYW5jZWxCdXR0b25DbGljayA9IHRoaXMuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUxhdW5jaEJ1dHRvbkNsaWNrID0gdGhpcy5faGFuZGxlTGF1bmNoQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgIDxsYWJlbD5Db21tYW5kOiA8L2xhYmVsPlxuICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgcmVmPVwic2NyaXB0UGF0aFwiXG4gICAgICAgICAgdGFiSW5kZXg9XCIxMVwiXG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiL3BhdGgvdG8vbXkvc2NyaXB0LnBocCBhcmcxIGFyZzJcIlxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5fZ2V0QWN0aXZlRmlsZVBhdGgoKX1cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWQgdGV4dC1yaWdodFwiPlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2t9PlxuICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVMYXVuY2hCdXR0b25DbGlja30+XG4gICAgICAgICAgICBMYXVuY2hcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUxhdW5jaEJ1dHRvbkNsaWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IHNjcmlwdFBhdGggPSB0aGlzLnJlZnNbJ3NjcmlwdFBhdGgnXS5nZXRUZXh0KCkudHJpbSgpO1xuICAgIGNvbnN0IHByb2Nlc3NJbmZvID0gbmV3IExhdW5jaFByb2Nlc3NJbmZvKHRoaXMucHJvcHMudGFyZ2V0VXJpLCBzY3JpcHRQYXRoKTtcbiAgICByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXNlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpXG4gICAgICAudGhlbihkZWJ1Z2dlclNlcnZpY2UgPT4gZGVidWdnZXJTZXJ2aWNlLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKSk7XG4gICAgdGhpcy5fc2hvd0RlYnVnZ2VyUGFuZWwoKTtcbiAgICB0aGlzLl9oYW5kbGVDYW5jZWxCdXR0b25DbGljaygpO1xuICB9XG5cbiAgX2dldEFjdGl2ZUZpbGVQYXRoKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IgIT0gbnVsbCkge1xuICAgICAgY29uc3QgZmlsZVVyaSA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICBpZiAoZmlsZVVyaSAhPSBudWxsICYmIHRoaXMuX2lzVmFsaWRTY3JpcHRVcmkoZmlsZVVyaSkpIHtcbiAgICAgICAgcmV0dXJuIHJlbW90ZVVyaS5nZXRQYXRoKGZpbGVVcmkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBfaXNWYWxpZFNjcmlwdFVyaSh1cmk6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIXJlbW90ZVVyaS5pc1JlbW90ZSh1cmkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHNjcmlwdFBhdGggPSByZW1vdGVVcmkuZ2V0UGF0aCh1cmkpO1xuICAgIHJldHVybiBzY3JpcHRQYXRoLmVuZHNXaXRoKCcucGhwJykgfHwgc2NyaXB0UGF0aC5lbmRzV2l0aCgnLmhoJyk7XG4gIH1cblxuICBfc2hvd0RlYnVnZ2VyUGFuZWwoKTogdm9pZCB7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93J1xuICAgICk7XG4gIH1cblxuICBfaGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2soKTogdm9pZCB7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUtbGF1bmNoLWF0dGFjaCdcbiAgICApO1xuICB9XG59XG4iXX0=