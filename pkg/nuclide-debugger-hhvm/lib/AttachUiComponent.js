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

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

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
            _nuclideUiLibButton.Button,
            { onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            {
              buttonType: _nuclideUiLibButton.ButtonTypes.PRIMARY,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFVpQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O2lDQUNKLHFCQUFxQjs7a0NBSTlDLDZCQUE2Qjs7SUFRdkIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsS0FBZ0IsRUFBRTswQkFIbkIsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLHdCQUF3QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEYsQUFBQyxRQUFJLENBQU8sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNqRjs7ZUFQVSxpQkFBaUI7O1dBU3RCLGtCQUFrQjtBQUN0QixhQUNFOztVQUFLLFNBQVMsRUFBQyxPQUFPO1FBQ3BCOztZQUFLLFNBQVMsRUFBQyxtQkFBbUI7VUFDaEM7O2NBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQUFBQzs7V0FBZ0I7VUFDL0Q7OztBQUNFLHdCQUFVLEVBQUUsZ0NBQVksT0FBTyxBQUFDO0FBQ2hDLHFCQUFPLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixBQUFDOztXQUVoQztTQUNMO09BQ0YsQ0FDTjtLQUNIOzs7V0FFdUIsb0NBQVM7O0FBRS9CLFVBQU0sV0FBVyxHQUFHLHlDQUFzQixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hFLGFBQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUN0QyxvQkFBb0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUMvQyxJQUFJLENBQUMsVUFBQSxlQUFlO2VBQUksZUFBZSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDeEUsVUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDMUIsVUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7S0FDakM7OztXQUVpQiw4QkFBUztBQUN6QixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUNsQyx1QkFBdUIsQ0FDeEIsQ0FBQztLQUNIOzs7V0FFdUIsb0NBQVM7QUFDL0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsdUNBQXVDLENBQ3hDLENBQUM7S0FDSDs7O1NBOUNVLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiQXR0YWNoVWlDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0F0dGFjaFByb2Nlc3NJbmZvfSBmcm9tICcuL0F0dGFjaFByb2Nlc3NJbmZvJztcbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQnV0dG9uVHlwZXMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG50eXBlIFByb3BzVHlwZSA9IHtcbiAgdGFyZ2V0VXJpOiBOdWNsaWRlVXJpO1xufTtcblxuZXhwb3J0IGNsYXNzIEF0dGFjaFVpQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgdm9pZD4ge1xuICBwcm9wczogUHJvcHNUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wc1R5cGUpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrID0gdGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQXR0YWNoQnV0dG9uQ2xpY2sgPSB0aGlzLl9oYW5kbGVBdHRhY2hCdXR0b25DbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkIHRleHQtcmlnaHRcIj5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrfT5DYW5jZWw8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBidXR0b25UeXBlPXtCdXR0b25UeXBlcy5QUklNQVJZfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQXR0YWNoQnV0dG9uQ2xpY2t9PlxuICAgICAgICAgICAgQXR0YWNoXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVBdHRhY2hCdXR0b25DbGljaygpOiB2b2lkIHtcbiAgICAvLyBTdGFydCBhIGRlYnVnIHNlc3Npb24gd2l0aCB0aGUgdXNlci1zdXBwbGllZCBpbmZvcm1hdGlvbi5cbiAgICBjb25zdCBwcm9jZXNzSW5mbyA9IG5ldyBBdHRhY2hQcm9jZXNzSW5mbyh0aGlzLnByb3BzLnRhcmdldFVyaSk7XG4gICAgcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLWh1Yi1wbHVzJylcbiAgICAgIC5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKVxuICAgICAgLnRoZW4oZGVidWdnZXJTZXJ2aWNlID0+IGRlYnVnZ2VyU2VydmljZS5zdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbykpO1xuICAgIHRoaXMuX3Nob3dEZWJ1Z2dlclBhbmVsKCk7XG4gICAgdGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2soKTtcbiAgfVxuXG4gIF9zaG93RGVidWdnZXJQYW5lbCgpOiB2b2lkIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnXG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVDYW5jZWxCdXR0b25DbGljaygpOiB2b2lkIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1sYXVuY2gtYXR0YWNoJ1xuICAgICk7XG4gIH1cbn1cbiJdfQ==