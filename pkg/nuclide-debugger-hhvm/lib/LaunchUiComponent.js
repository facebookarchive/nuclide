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

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonGroup = require('../../nuclide-ui/lib/ButtonGroup');

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
          _nuclideUiLibButtonGroup.ButtonGroup,
          { className: 'padded text-right' },
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            { onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            {
              buttonType: _nuclideUiLibButton.ButtonTypes.PRIMARY,
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
//# sourceMappingURL=data:application/json;base64,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UUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xFOzs7V0FFaUIsOEJBQVM7QUFDekIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsdUJBQXVCLENBQ3hCLENBQUM7S0FDSDs7O1dBRXVCLG9DQUFTO0FBQy9CLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLHVDQUF1QyxDQUN4QyxDQUFDO0tBQ0g7OztTQTNFVSxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkxhdW5jaFVpQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtBdG9tSW5wdXR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21JbnB1dCc7XG5pbXBvcnQge0xhdW5jaFByb2Nlc3NJbmZvfSBmcm9tICcuL0xhdW5jaFByb2Nlc3NJbmZvJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQnV0dG9uVHlwZXMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5pbXBvcnQge1xuICBCdXR0b25Hcm91cCxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQnV0dG9uR3JvdXAnO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxudHlwZSBQcm9wc1R5cGUgPSB7XG4gIHRhcmdldFVyaTogTnVjbGlkZVVyaTtcbn07XG5leHBvcnQgY2xhc3MgTGF1bmNoVWlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHNUeXBlLCB2b2lkPiB7XG4gIHByb3BzOiBQcm9wc1R5cGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzVHlwZSkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fZ2V0QWN0aXZlRmlsZVBhdGggPSB0aGlzLl9nZXRBY3RpdmVGaWxlUGF0aC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDYW5jZWxCdXR0b25DbGljayA9IHRoaXMuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUxhdW5jaEJ1dHRvbkNsaWNrID0gdGhpcy5faGFuZGxlTGF1bmNoQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9ja1wiPlxuICAgICAgICA8bGFiZWw+Q29tbWFuZDogPC9sYWJlbD5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIHJlZj1cInNjcmlwdFBhdGhcIlxuICAgICAgICAgIHRhYkluZGV4PVwiMTFcIlxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIi9wYXRoL3RvL215L3NjcmlwdC5waHAgYXJnMSBhcmcyXCJcbiAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuX2dldEFjdGl2ZUZpbGVQYXRoKCl9XG4gICAgICAgIC8+XG4gICAgICAgIDxCdXR0b25Hcm91cCBjbGFzc05hbWU9XCJwYWRkZWQgdGV4dC1yaWdodFwiPlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17dGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2t9PlxuICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgYnV0dG9uVHlwZT17QnV0dG9uVHlwZXMuUFJJTUFSWX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUxhdW5jaEJ1dHRvbkNsaWNrfT5cbiAgICAgICAgICAgIExhdW5jaFxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0J1dHRvbkdyb3VwPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVMYXVuY2hCdXR0b25DbGljaygpOiB2b2lkIHtcbiAgICBjb25zdCBzY3JpcHRQYXRoID0gdGhpcy5yZWZzWydzY3JpcHRQYXRoJ10uZ2V0VGV4dCgpLnRyaW0oKTtcbiAgICBjb25zdCBwcm9jZXNzSW5mbyA9IG5ldyBMYXVuY2hQcm9jZXNzSW5mbyh0aGlzLnByb3BzLnRhcmdldFVyaSwgc2NyaXB0UGF0aCk7XG4gICAgcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLWh1Yi1wbHVzJylcbiAgICAgIC5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKVxuICAgICAgLnRoZW4oZGVidWdnZXJTZXJ2aWNlID0+IGRlYnVnZ2VyU2VydmljZS5zdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbykpO1xuICAgIHRoaXMuX3Nob3dEZWJ1Z2dlclBhbmVsKCk7XG4gICAgdGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2soKTtcbiAgfVxuXG4gIF9nZXRBY3RpdmVGaWxlUGF0aCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGZpbGVVcmkgPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgaWYgKGZpbGVVcmkgIT0gbnVsbCAmJiB0aGlzLl9pc1ZhbGlkU2NyaXB0VXJpKGZpbGVVcmkpKSB7XG4gICAgICAgIHJldHVybiByZW1vdGVVcmkuZ2V0UGF0aChmaWxlVXJpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgX2lzVmFsaWRTY3JpcHRVcmkodXJpOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgaWYgKCFyZW1vdGVVcmkuaXNSZW1vdGUodXJpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBzY3JpcHRQYXRoID0gcmVtb3RlVXJpLmdldFBhdGgodXJpKTtcbiAgICByZXR1cm4gc2NyaXB0UGF0aC5lbmRzV2l0aCgnLnBocCcpIHx8IHNjcmlwdFBhdGguZW5kc1dpdGgoJy5oaCcpO1xuICB9XG5cbiAgX3Nob3dEZWJ1Z2dlclBhbmVsKCk6IHZvaWQge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c2hvdydcbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrKCk6IHZvaWQge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlLWxhdW5jaC1hdHRhY2gnXG4gICAgKTtcbiAgfVxufVxuIl19