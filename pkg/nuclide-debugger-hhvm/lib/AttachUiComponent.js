Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

var _AttachProcessInfo = require('./AttachProcessInfo');

var AttachUiComponent = (function (_React$Component) {
  _inherits(AttachUiComponent, _React$Component);

  function AttachUiComponent(props) {
    _classCallCheck(this, AttachUiComponent);

    _get(Object.getPrototypeOf(AttachUiComponent.prototype), 'constructor', this).call(this, props);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
  }

  _createClass(AttachUiComponent, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
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
              onClick: this._handleAttachButtonClick },
            'Attach'
          )
        )
      );
    }
  }, {
    key: '_handleAttachButtonClick',
    value: function _handleAttachButtonClick() {
      // Start a debug session with the user-supplied information.
      var processInfo = new _AttachProcessInfo.AttachProcessInfo(this.props.targetUri);
      require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote').then(function (debuggerService) {
        return debuggerService.startDebugging(processInfo);
      });
      this._showDebuggerPanel();
      this._handleCancelButtonClick();
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

  return AttachUiComponent;
})(_reactForAtom.React.Component);

exports.AttachUiComponent = AttachUiComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFVpQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O2lDQUNKLHFCQUFxQjs7SUFPeEMsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsS0FBZ0IsRUFBRTswQkFIbkIsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLHdCQUF3QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEYsQUFBQyxRQUFJLENBQU8sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNqRjs7ZUFQVSxpQkFBaUI7O1dBU3RCLGtCQUFpQjtBQUNyQixhQUNFOztVQUFLLFNBQVMsRUFBQyxPQUFPO1FBQ3BCOztZQUFLLFNBQVMsRUFBQyxtQkFBbUI7VUFDaEM7O2NBQVEsU0FBUyxFQUFDLEtBQUssRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixBQUFDOztXQUV0RDtVQUNUOzs7QUFDSSx1QkFBUyxFQUFDLGlCQUFpQjtBQUMzQixxQkFBTyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQUFBQzs7V0FFbEM7U0FDTDtPQUNGLENBQ047S0FDSDs7O1dBRXVCLG9DQUFTOztBQUUvQixVQUFNLFdBQVcsR0FBRyx5Q0FBc0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoRSxhQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FDdEMsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FDL0MsSUFBSSxDQUFDLFVBQUEsZUFBZTtlQUFJLGVBQWUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ3hFLFVBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzFCLFVBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0tBQ2pDOzs7V0FFaUIsOEJBQVM7QUFDekIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsdUJBQXVCLENBQ3hCLENBQUM7S0FDSDs7O1dBRXVCLG9DQUFTO0FBQy9CLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLHVDQUF1QyxDQUN4QyxDQUFDO0tBQ0g7OztTQWhEVSxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkF0dGFjaFVpQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtBdHRhY2hQcm9jZXNzSW5mb30gZnJvbSAnLi9BdHRhY2hQcm9jZXNzSW5mbyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxudHlwZSBQcm9wc1R5cGUgPSB7XG4gIHRhcmdldFVyaTogTnVjbGlkZVVyaTtcbn07XG5cbmV4cG9ydCBjbGFzcyBBdHRhY2hVaUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wc1R5cGUsIHZvaWQ+IHtcbiAgcHJvcHM6IFByb3BzVHlwZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHNUeXBlKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDYW5jZWxCdXR0b25DbGljayA9IHRoaXMuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUF0dGFjaEJ1dHRvbkNsaWNrID0gdGhpcy5faGFuZGxlQXR0YWNoQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkIHRleHQtcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0blwiIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrfT5cbiAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCJcbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQXR0YWNoQnV0dG9uQ2xpY2t9PlxuICAgICAgICAgICAgQXR0YWNoXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVBdHRhY2hCdXR0b25DbGljaygpOiB2b2lkIHtcbiAgICAvLyBTdGFydCBhIGRlYnVnIHNlc3Npb24gd2l0aCB0aGUgdXNlci1zdXBwbGllZCBpbmZvcm1hdGlvbi5cbiAgICBjb25zdCBwcm9jZXNzSW5mbyA9IG5ldyBBdHRhY2hQcm9jZXNzSW5mbyh0aGlzLnByb3BzLnRhcmdldFVyaSk7XG4gICAgcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLWh1Yi1wbHVzJylcbiAgICAgIC5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKVxuICAgICAgLnRoZW4oZGVidWdnZXJTZXJ2aWNlID0+IGRlYnVnZ2VyU2VydmljZS5zdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbykpO1xuICAgIHRoaXMuX3Nob3dEZWJ1Z2dlclBhbmVsKCk7XG4gICAgdGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2soKTtcbiAgfVxuXG4gIF9zaG93RGVidWdnZXJQYW5lbCgpOiB2b2lkIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnXG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVDYW5jZWxCdXR0b25DbGljaygpOiB2b2lkIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1sYXVuY2gtYXR0YWNoJ1xuICAgICk7XG4gIH1cbn1cbiJdfQ==