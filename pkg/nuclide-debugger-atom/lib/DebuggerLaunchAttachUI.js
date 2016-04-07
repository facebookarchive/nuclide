Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibDropdown = require('../../nuclide-ui/lib/Dropdown');

var _reactForAtom = require('react-for-atom');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var DebuggerLaunchAttachUI = (function (_React$Component) {
  _inherits(DebuggerLaunchAttachUI, _React$Component);

  function DebuggerLaunchAttachUI(props) {
    _classCallCheck(this, DebuggerLaunchAttachUI);

    _get(Object.getPrototypeOf(DebuggerLaunchAttachUI.prototype), 'constructor', this).call(this, props);

    this._resetConnections = this._resetConnections.bind(this);
    this._handleConnectionDropdownChange = this._handleConnectionDropdownChange.bind(this);
    this._handleDebuggingTypeDropdownChange = this._handleDebuggingTypeDropdownChange.bind(this);
    this._handleProviderActionsDropdownChange = this._handleProviderActionsDropdownChange.bind(this);

    this.state = {
      connectionsUpdatedDisposable: this.props.store.onConnectionsUpdated(this._resetConnections),
      connections: [],
      availableProviders: [],
      providerActions: [],
      connectionsDropdownIndex: 0,
      debuggingTypeDropdownIndex: 0,
      providerActionsDropdownIndex: 0,
      element: null
    };
  }

  _createClass(DebuggerLaunchAttachUI, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.props.debuggerActions.updateConnections();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.state.connectionsUpdatedDisposable.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      var connectionItems = this.state.connections.map(function (connection, index) {
        return {
          label: _nuclideRemoteUri2['default'].isRemote(connection) ? _nuclideRemoteUri2['default'].getHostname(connection) : connection,
          value: index
        };
      });

      var debuggingTypeItems = this.state.availableProviders.map(function (provider, index) {
        return {
          label: provider.getDebuggingTypeName(),
          value: index
        };
      });

      var providerActions = this.state.providerActions.map(function (action, index) {
        return {
          label: action,
          value: index
        };
      });

      return _reactForAtom.React.createElement(
        'div',
        { className: 'block padded' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'launch-attach-header' },
          _reactForAtom.React.createElement(
            'label',
            { className: 'inline-block' },
            'Connection: '
          ),
          _reactForAtom.React.createElement(_nuclideUiLibDropdown.Dropdown, {
            className: 'inline-block',
            menuItems: connectionItems,
            onSelectedChange: this._handleConnectionDropdownChange,
            selectedIndex: this.state.connectionsDropdownIndex,
            size: 'sm'
          }),
          _reactForAtom.React.createElement(
            'label',
            { className: 'inline-block' },
            'Type: '
          ),
          _reactForAtom.React.createElement(_nuclideUiLibDropdown.Dropdown, {
            className: 'inline-block',
            menuItems: debuggingTypeItems,
            onSelectedChange: this._handleDebuggingTypeDropdownChange,
            selectedIndex: this.state.debuggingTypeDropdownIndex,
            size: 'sm'
          }),
          _reactForAtom.React.createElement(
            'label',
            { className: 'inline-block' },
            'Action: '
          ),
          _reactForAtom.React.createElement(_nuclideUiLibDropdown.Dropdown, {
            className: 'inline-block',
            menuItems: providerActions,
            onSelectedChange: this._handleProviderActionsDropdownChange,
            selectedIndex: this.state.providerActionsDropdownIndex,
            size: 'sm'
          })
        ),
        _reactForAtom.React.createElement(
          'div',
          null,
          this.state.element
        )
      );
    }

    // Reset connections dropdown with latest connections.
  }, {
    key: '_resetConnections',
    value: function _resetConnections() {
      var connections = this.props.store.getConnections();
      this.setState({
        connections: connections,
        connectionsDropdownIndex: 0
      });
      // Continue fill debugging types dropdown for new connection.
      this._resetAvailableDebuggingTypes(connections[0]);
    }
  }, {
    key: '_handleConnectionDropdownChange',
    value: function _handleConnectionDropdownChange(newIndex) {
      this.setState({
        connectionsDropdownIndex: newIndex
      });
      var selectedConnection = this.state.connections[newIndex];
      this._resetAvailableDebuggingTypes(selectedConnection);
    }

    // Reset debugging types dropdown for input connection.
  }, {
    key: '_resetAvailableDebuggingTypes',
    value: function _resetAvailableDebuggingTypes(connection) {
      this._clearPreviousProviders();
      var availableProviders = this.props.store.getLaunchAttachProvidersForConnection(connection);
      this.setState({
        availableProviders: availableProviders,
        debuggingTypeDropdownIndex: 0
      });
      // Continue fill actions dropdown for new provider.
      this._resetProviderActions(availableProviders[0]);
    }
  }, {
    key: '_clearPreviousProviders',
    value: function _clearPreviousProviders() {
      for (var provider of this.state.availableProviders) {
        provider.dispose();
      }
    }
  }, {
    key: '_handleDebuggingTypeDropdownChange',
    value: function _handleDebuggingTypeDropdownChange(newIndex) {
      this.setState({
        debuggingTypeDropdownIndex: newIndex
      });
      this._resetProviderActions(this.state.availableProviders[newIndex]);
    }

    // Reset actions dropdown for input DebuggerLaunchAttachProvider.
  }, {
    key: '_resetProviderActions',
    value: function _resetProviderActions(provider) {
      var providerActions = provider.getActions();
      this.setState({
        providerActions: providerActions,
        providerActionsDropdownIndex: 0
      });
      this._resetElement(provider, providerActions[0]);
    }
  }, {
    key: '_handleProviderActionsDropdownChange',
    value: function _handleProviderActionsDropdownChange(newIndex) {
      this.setState({
        providerActionsDropdownIndex: newIndex
      });
      var selectedProviderIndex = this.state.debuggingTypeDropdownIndex;
      var provider = this.state.availableProviders[selectedProviderIndex];
      var selectedAction = this.state.providerActions[newIndex];
      // Continue use new UI element for new provider + action.
      this._resetElement(provider, selectedAction);
    }

    // Display new customized element UI from input provider and action.
  }, {
    key: '_resetElement',
    value: function _resetElement(provider, action) {
      var element = provider.getComponent(action);
      // Assign an unique key to element so that react treats it as a new element.
      if (element != null) {
        element = _reactForAtom.React.cloneElement(element, { key: provider.getUniqueKey() });
      }
      this.setState({
        element: element
      });
    }
  }]);

  return DebuggerLaunchAttachUI;
})(_reactForAtom.React.Component);

exports.DebuggerLaunchAttachUI = DebuggerLaunchAttachUI;

// Current available Nuclide connections.

// Availble launch/attach providers for current selected connection.

// Customized launch/attach actions supported by this (connection + provider) combination.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTGF1bmNoQXR0YWNoVUkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0FldUIsK0JBQStCOzs0QkFDbEMsZ0JBQWdCOztnQ0FDZCwwQkFBMEI7Ozs7SUFxQm5DLHNCQUFzQjtZQUF0QixzQkFBc0I7O0FBSXRCLFdBSkEsc0JBQXNCLENBSXJCLEtBQWdCLEVBQUU7MEJBSm5CLHNCQUFzQjs7QUFLL0IsK0JBTFMsc0JBQXNCLDZDQUt6QixLQUFLLEVBQUU7O0FBRWIsQUFBQyxRQUFJLENBQU8saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRSxBQUFDLFFBQUksQ0FBTywrQkFBK0IsR0FBRyxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlGLEFBQUMsUUFBSSxDQUFPLGtDQUFrQyxHQUM1QyxJQUFJLENBQUMsa0NBQWtDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELEFBQUMsUUFBSSxDQUFPLG9DQUFvQyxHQUM5QyxJQUFJLENBQUMsb0NBQW9DLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV2RCxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsa0NBQTRCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0FBQzNGLGlCQUFXLEVBQUUsRUFBRTtBQUNmLHdCQUFrQixFQUFFLEVBQUU7QUFDdEIscUJBQWUsRUFBRSxFQUFFO0FBQ25CLDhCQUF3QixFQUFFLENBQUM7QUFDM0IsZ0NBQTBCLEVBQUUsQ0FBQztBQUM3QixrQ0FBNEIsRUFBRSxDQUFDO0FBQy9CLGFBQU8sRUFBRSxJQUFJO0tBQ2QsQ0FBQztHQUNIOztlQXhCVSxzQkFBc0I7O1dBMEJmLDhCQUFHO0FBQ25CLFVBQUksQ0FB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LG9DQUE0QixFQUFFLFFBQVE7T0FDdkMsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDO0FBQ3BFLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN0RSxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFNUQsVUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDOUM7Ozs7O1dBR1ksdUJBQUMsUUFBc0MsRUFBRSxNQUFjLEVBQVE7QUFDMUUsVUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFNUMsVUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ25CLGVBQU8sR0FBRyxvQkFBTSxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsRUFBQyxDQUFDLENBQUM7T0FDdkU7QUFDRCxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osZUFBTyxFQUFQLE9BQU87T0FDUixDQUFDLENBQUM7S0FDSjs7O1NBaktVLHNCQUFzQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiRGVidWdnZXJMYXVuY2hBdHRhY2hVSS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEZWJ1Z2dlclByb3ZpZGVyU3RvcmV9IGZyb20gJy4vRGVidWdnZXJQcm92aWRlclN0b3JlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIgZnJvbSAnLi9EZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyQWN0aW9ucyBmcm9tICcuL0RlYnVnZ2VyQWN0aW9ucyc7XG5cbmltcG9ydCB7RHJvcGRvd259IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0Ryb3Bkb3duJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxudHlwZSBQcm9wc1R5cGUgPSB7XG4gIHN0b3JlOiBEZWJ1Z2dlclByb3ZpZGVyU3RvcmU7XG4gIGRlYnVnZ2VyQWN0aW9uczogRGVidWdnZXJBY3Rpb25zO1xufTtcblxudHlwZSBTdGF0ZVR5cGUgPSB7XG4gIGNvbm5lY3Rpb25zVXBkYXRlZERpc3Bvc2FibGU6IElEaXNwb3NhYmxlO1xuICAvLyBDdXJyZW50IGF2YWlsYWJsZSBOdWNsaWRlIGNvbm5lY3Rpb25zLlxuICBjb25uZWN0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgLy8gQXZhaWxibGUgbGF1bmNoL2F0dGFjaCBwcm92aWRlcnMgZm9yIGN1cnJlbnQgc2VsZWN0ZWQgY29ubmVjdGlvbi5cbiAgYXZhaWxhYmxlUHJvdmlkZXJzOiBBcnJheTxEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyPjtcbiAgLy8gQ3VzdG9taXplZCBsYXVuY2gvYXR0YWNoIGFjdGlvbnMgc3VwcG9ydGVkIGJ5IHRoaXMgKGNvbm5lY3Rpb24gKyBwcm92aWRlcikgY29tYmluYXRpb24uXG4gIHByb3ZpZGVyQWN0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgY29ubmVjdGlvbnNEcm9wZG93bkluZGV4OiBudW1iZXI7XG4gIGRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4OiBudW1iZXI7XG4gIHByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXg6IG51bWJlcjtcbiAgZWxlbWVudDogP1JlYWN0RWxlbWVudDtcbn07XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlckxhdW5jaEF0dGFjaFVJIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgU3RhdGVUeXBlPiB7XG4gIHByb3BzOiBQcm9wc1R5cGU7XG4gIHN0YXRlOiBTdGF0ZVR5cGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzVHlwZSkge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgICh0aGlzOiBhbnkpLl9yZXNldENvbm5lY3Rpb25zID0gdGhpcy5fcmVzZXRDb25uZWN0aW9ucy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDb25uZWN0aW9uRHJvcGRvd25DaGFuZ2UgPSB0aGlzLl9oYW5kbGVDb25uZWN0aW9uRHJvcGRvd25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlRGVidWdnaW5nVHlwZURyb3Bkb3duQ2hhbmdlID1cbiAgICAgIHRoaXMuX2hhbmRsZURlYnVnZ2luZ1R5cGVEcm9wZG93bkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZSA9XG4gICAgICB0aGlzLl9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGNvbm5lY3Rpb25zVXBkYXRlZERpc3Bvc2FibGU6IHRoaXMucHJvcHMuc3RvcmUub25Db25uZWN0aW9uc1VwZGF0ZWQodGhpcy5fcmVzZXRDb25uZWN0aW9ucyksXG4gICAgICBjb25uZWN0aW9uczogW10sXG4gICAgICBhdmFpbGFibGVQcm92aWRlcnM6IFtdLFxuICAgICAgcHJvdmlkZXJBY3Rpb25zOiBbXSxcbiAgICAgIGNvbm5lY3Rpb25zRHJvcGRvd25JbmRleDogMCxcbiAgICAgIGRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4OiAwLFxuICAgICAgcHJvdmlkZXJBY3Rpb25zRHJvcGRvd25JbmRleDogMCxcbiAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnByb3BzLmRlYnVnZ2VyQWN0aW9ucy51cGRhdGVDb25uZWN0aW9ucygpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5zdGF0ZS5jb25uZWN0aW9uc1VwZGF0ZWREaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25JdGVtcyA9IHRoaXMuc3RhdGUuY29ubmVjdGlvbnMubWFwKChjb25uZWN0aW9uLCBpbmRleCkgPT4gKHtcbiAgICAgIGxhYmVsOiByZW1vdGVVcmkuaXNSZW1vdGUoY29ubmVjdGlvbikgPyByZW1vdGVVcmkuZ2V0SG9zdG5hbWUoY29ubmVjdGlvbikgOiBjb25uZWN0aW9uLFxuICAgICAgdmFsdWU6IGluZGV4LFxuICAgIH0pKTtcblxuICAgIGNvbnN0IGRlYnVnZ2luZ1R5cGVJdGVtcyA9IHRoaXMuc3RhdGUuYXZhaWxhYmxlUHJvdmlkZXJzLm1hcCgocHJvdmlkZXIsIGluZGV4KSA9PiAoe1xuICAgICAgbGFiZWw6IHByb3ZpZGVyLmdldERlYnVnZ2luZ1R5cGVOYW1lKCksXG4gICAgICB2YWx1ZTogaW5kZXgsXG4gICAgfSkpO1xuXG4gICAgY29uc3QgcHJvdmlkZXJBY3Rpb25zID0gdGhpcy5zdGF0ZS5wcm92aWRlckFjdGlvbnMubWFwKChhY3Rpb24sIGluZGV4KSA9PiAoe1xuICAgICAgbGFiZWw6IGFjdGlvbixcbiAgICAgIHZhbHVlOiBpbmRleCxcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9jayBwYWRkZWRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsYXVuY2gtYXR0YWNoLWhlYWRlclwiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5Db25uZWN0aW9uOiA8L2xhYmVsPlxuICAgICAgICAgIDxEcm9wZG93blxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICAgIG1lbnVJdGVtcz17Y29ubmVjdGlvbkl0ZW1zfVxuICAgICAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5faGFuZGxlQ29ubmVjdGlvbkRyb3Bkb3duQ2hhbmdlfVxuICAgICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5jb25uZWN0aW9uc0Ryb3Bkb3duSW5kZXh9XG4gICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlR5cGU6IDwvbGFiZWw+XG4gICAgICAgICAgPERyb3Bkb3duXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgbWVudUl0ZW1zPXtkZWJ1Z2dpbmdUeXBlSXRlbXN9XG4gICAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVEZWJ1Z2dpbmdUeXBlRHJvcGRvd25DaGFuZ2V9XG4gICAgICAgICAgICBzZWxlY3RlZEluZGV4PXt0aGlzLnN0YXRlLmRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4fVxuICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5BY3Rpb246IDwvbGFiZWw+XG4gICAgICAgICAgPERyb3Bkb3duXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgbWVudUl0ZW1zPXtwcm92aWRlckFjdGlvbnN9XG4gICAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZX1cbiAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUucHJvdmlkZXJBY3Rpb25zRHJvcGRvd25JbmRleH1cbiAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAge3RoaXMuc3RhdGUuZWxlbWVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLy8gUmVzZXQgY29ubmVjdGlvbnMgZHJvcGRvd24gd2l0aCBsYXRlc3QgY29ubmVjdGlvbnMuXG4gIF9yZXNldENvbm5lY3Rpb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25zID0gdGhpcy5wcm9wcy5zdG9yZS5nZXRDb25uZWN0aW9ucygpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY29ubmVjdGlvbnMsXG4gICAgICBjb25uZWN0aW9uc0Ryb3Bkb3duSW5kZXg6IDAsXG4gICAgfSk7XG4gICAgLy8gQ29udGludWUgZmlsbCBkZWJ1Z2dpbmcgdHlwZXMgZHJvcGRvd24gZm9yIG5ldyBjb25uZWN0aW9uLlxuICAgIHRoaXMuX3Jlc2V0QXZhaWxhYmxlRGVidWdnaW5nVHlwZXMoY29ubmVjdGlvbnNbMF0pO1xuICB9XG5cbiAgX2hhbmRsZUNvbm5lY3Rpb25Ecm9wZG93bkNoYW5nZShuZXdJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb25uZWN0aW9uc0Ryb3Bkb3duSW5kZXg6IG5ld0luZGV4LFxuICAgIH0pO1xuICAgIGNvbnN0IHNlbGVjdGVkQ29ubmVjdGlvbiA9IHRoaXMuc3RhdGUuY29ubmVjdGlvbnNbbmV3SW5kZXhdO1xuICAgIHRoaXMuX3Jlc2V0QXZhaWxhYmxlRGVidWdnaW5nVHlwZXMoc2VsZWN0ZWRDb25uZWN0aW9uKTtcbiAgfVxuXG4gIC8vIFJlc2V0IGRlYnVnZ2luZyB0eXBlcyBkcm9wZG93biBmb3IgaW5wdXQgY29ubmVjdGlvbi5cbiAgX3Jlc2V0QXZhaWxhYmxlRGVidWdnaW5nVHlwZXMoY29ubmVjdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJQcmV2aW91c1Byb3ZpZGVycygpO1xuICAgIGNvbnN0IGF2YWlsYWJsZVByb3ZpZGVycyA9XG4gICAgICB0aGlzLnByb3BzLnN0b3JlLmdldExhdW5jaEF0dGFjaFByb3ZpZGVyc0ZvckNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhdmFpbGFibGVQcm92aWRlcnMsXG4gICAgICBkZWJ1Z2dpbmdUeXBlRHJvcGRvd25JbmRleDogMCxcbiAgICB9KTtcbiAgICAvLyBDb250aW51ZSBmaWxsIGFjdGlvbnMgZHJvcGRvd24gZm9yIG5ldyBwcm92aWRlci5cbiAgICB0aGlzLl9yZXNldFByb3ZpZGVyQWN0aW9ucyhhdmFpbGFibGVQcm92aWRlcnNbMF0pO1xuICB9XG5cbiAgX2NsZWFyUHJldmlvdXNQcm92aWRlcnMoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBwcm92aWRlciBvZiB0aGlzLnN0YXRlLmF2YWlsYWJsZVByb3ZpZGVycykge1xuICAgICAgcHJvdmlkZXIuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z2dpbmdUeXBlRHJvcGRvd25DaGFuZ2UobmV3SW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZGVidWdnaW5nVHlwZURyb3Bkb3duSW5kZXg6IG5ld0luZGV4LFxuICAgIH0pO1xuICAgIHRoaXMuX3Jlc2V0UHJvdmlkZXJBY3Rpb25zKHRoaXMuc3RhdGUuYXZhaWxhYmxlUHJvdmlkZXJzW25ld0luZGV4XSk7XG4gIH1cblxuICAvLyBSZXNldCBhY3Rpb25zIGRyb3Bkb3duIGZvciBpbnB1dCBEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyLlxuICBfcmVzZXRQcm92aWRlckFjdGlvbnMocHJvdmlkZXI6IERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIpOiB2b2lkIHtcbiAgICBjb25zdCBwcm92aWRlckFjdGlvbnMgPSBwcm92aWRlci5nZXRBY3Rpb25zKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwcm92aWRlckFjdGlvbnMsXG4gICAgICBwcm92aWRlckFjdGlvbnNEcm9wZG93bkluZGV4OiAwLFxuICAgIH0pO1xuICAgIHRoaXMuX3Jlc2V0RWxlbWVudChwcm92aWRlciwgcHJvdmlkZXJBY3Rpb25zWzBdKTtcbiAgfVxuXG4gIF9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZShuZXdJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwcm92aWRlckFjdGlvbnNEcm9wZG93bkluZGV4OiBuZXdJbmRleCxcbiAgICB9KTtcbiAgICBjb25zdCBzZWxlY3RlZFByb3ZpZGVySW5kZXggPSB0aGlzLnN0YXRlLmRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4O1xuICAgIGNvbnN0IHByb3ZpZGVyID0gdGhpcy5zdGF0ZS5hdmFpbGFibGVQcm92aWRlcnNbc2VsZWN0ZWRQcm92aWRlckluZGV4XTtcbiAgICBjb25zdCBzZWxlY3RlZEFjdGlvbiA9IHRoaXMuc3RhdGUucHJvdmlkZXJBY3Rpb25zW25ld0luZGV4XTtcbiAgICAvLyBDb250aW51ZSB1c2UgbmV3IFVJIGVsZW1lbnQgZm9yIG5ldyBwcm92aWRlciArIGFjdGlvbi5cbiAgICB0aGlzLl9yZXNldEVsZW1lbnQocHJvdmlkZXIsIHNlbGVjdGVkQWN0aW9uKTtcbiAgfVxuXG4gIC8vIERpc3BsYXkgbmV3IGN1c3RvbWl6ZWQgZWxlbWVudCBVSSBmcm9tIGlucHV0IHByb3ZpZGVyIGFuZCBhY3Rpb24uXG4gIF9yZXNldEVsZW1lbnQocHJvdmlkZXI6IERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIsIGFjdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGVsZW1lbnQgPSBwcm92aWRlci5nZXRDb21wb25lbnQoYWN0aW9uKTtcbiAgICAvLyBBc3NpZ24gYW4gdW5pcXVlIGtleSB0byBlbGVtZW50IHNvIHRoYXQgcmVhY3QgdHJlYXRzIGl0IGFzIGEgbmV3IGVsZW1lbnQuXG4gICAgaWYgKGVsZW1lbnQgIT0gbnVsbCkge1xuICAgICAgZWxlbWVudCA9IFJlYWN0LmNsb25lRWxlbWVudChlbGVtZW50LCB7a2V5OiBwcm92aWRlci5nZXRVbmlxdWVLZXkoKX0pO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGVsZW1lbnQsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==