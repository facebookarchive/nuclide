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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFVpQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O2lDQUNKLHFCQUFxQjs7SUFPeEMsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsS0FBZ0IsRUFBRTswQkFIbkIsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLHdCQUF3QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEYsQUFBQyxRQUFJLENBQU8sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNqRjs7ZUFQVSxpQkFBaUI7O1dBU3RCLGtCQUFpQjtBQUNyQixhQUNFOztVQUFLLFNBQVMsRUFBQyxPQUFPO1FBQ3BCOztZQUFLLFNBQVMsRUFBQyxtQkFBbUI7VUFDaEM7O2NBQVEsU0FBUyxFQUFDLEtBQUssRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixBQUFDOztXQUV0RDtVQUNUOzs7QUFDSSx1QkFBUyxFQUFDLGlCQUFpQjtBQUMzQixxQkFBTyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQUFBQzs7V0FFbEM7U0FDTDtPQUNGLENBQ047S0FDSDs7O1dBRXVCLG9DQUFTOztBQUUvQixVQUFNLFdBQVcsR0FBRyx5Q0FBc0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoRSxhQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FDdEMsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FDL0MsSUFBSSxDQUFDLFVBQUEsZUFBZTtlQUFJLGVBQWUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ3hFLFVBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzFCLFVBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0tBQ2pDOzs7V0FFaUIsOEJBQVM7QUFDekIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsdUJBQXVCLENBQ3hCLENBQUM7S0FDSDs7O1dBRXVCLG9DQUFTO0FBQy9CLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLHVDQUF1QyxDQUN4QyxDQUFDO0tBQ0g7OztTQWhEVSxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkF0dGFjaFVpQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtBdHRhY2hQcm9jZXNzSW5mb30gZnJvbSAnLi9BdHRhY2hQcm9jZXNzSW5mbyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxudHlwZSBQcm9wc1R5cGUgPSB7XG4gIHRhcmdldFVyaTogTnVjbGlkZVVyaTtcbn1cblxuZXhwb3J0IGNsYXNzIEF0dGFjaFVpQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgdm9pZD4ge1xuICBwcm9wczogUHJvcHNUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wc1R5cGUpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrID0gdGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQXR0YWNoQnV0dG9uQ2xpY2sgPSB0aGlzLl9oYW5kbGVBdHRhY2hCdXR0b25DbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2tcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWQgdGV4dC1yaWdodFwiPlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2t9PlxuICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVBdHRhY2hCdXR0b25DbGlja30+XG4gICAgICAgICAgICBBdHRhY2hcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUF0dGFjaEJ1dHRvbkNsaWNrKCk6IHZvaWQge1xuICAgIC8vIFN0YXJ0IGEgZGVidWcgc2Vzc2lvbiB3aXRoIHRoZSB1c2VyLXN1cHBsaWVkIGluZm9ybWF0aW9uLlxuICAgIGNvbnN0IHByb2Nlc3NJbmZvID0gbmV3IEF0dGFjaFByb2Nlc3NJbmZvKHRoaXMucHJvcHMudGFyZ2V0VXJpKTtcbiAgICByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXNlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpXG4gICAgICAudGhlbihkZWJ1Z2dlclNlcnZpY2UgPT4gZGVidWdnZXJTZXJ2aWNlLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKSk7XG4gICAgdGhpcy5fc2hvd0RlYnVnZ2VyUGFuZWwoKTtcbiAgICB0aGlzLl9oYW5kbGVDYW5jZWxCdXR0b25DbGljaygpO1xuICB9XG5cbiAgX3Nob3dEZWJ1Z2dlclBhbmVsKCk6IHZvaWQge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c2hvdydcbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrKCk6IHZvaWQge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlLWxhdW5jaC1hdHRhY2gnXG4gICAgKTtcbiAgfVxufVxuIl19