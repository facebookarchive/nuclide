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

var _nuclideUiDropdown = require('../../nuclide-ui-dropdown');

var _nuclideUiDropdown2 = _interopRequireDefault(_nuclideUiDropdown);

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
          _reactForAtom.React.createElement(_nuclideUiDropdown2['default'], {
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
          _reactForAtom.React.createElement(_nuclideUiDropdown2['default'], {
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
          _reactForAtom.React.createElement(_nuclideUiDropdown2['default'], {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTGF1bmNoQXR0YWNoVUkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztpQ0FlNEIsMkJBQTJCOzs7OzRCQUNuQyxnQkFBZ0I7O2dDQUNkLDBCQUEwQjs7OztJQXFCbkMsc0JBQXNCO1lBQXRCLHNCQUFzQjs7QUFJdEIsV0FKQSxzQkFBc0IsQ0FJckIsS0FBZ0IsRUFBRTswQkFKbkIsc0JBQXNCOztBQUsvQiwrQkFMUyxzQkFBc0IsNkNBS3pCLEtBQUssRUFBRTs7QUFFYixBQUFDLFFBQUksQ0FBTyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xFLEFBQUMsUUFBSSxDQUFPLCtCQUErQixHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUYsQUFBQyxRQUFJLENBQU8sa0NBQWtDLEdBQzVDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsQUFBQyxRQUFJLENBQU8sb0NBQW9DLEdBQzlDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXZELFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxrQ0FBNEIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDM0YsaUJBQVcsRUFBRSxFQUFFO0FBQ2Ysd0JBQWtCLEVBQUUsRUFBRTtBQUN0QixxQkFBZSxFQUFFLEVBQUU7QUFDbkIsOEJBQXdCLEVBQUUsQ0FBQztBQUMzQixnQ0FBMEIsRUFBRSxDQUFDO0FBQzdCLGtDQUE0QixFQUFFLENBQUM7QUFDL0IsYUFBTyxFQUFFLElBQUk7S0FDZCxDQUFDO0dBQ0g7O2VBeEJVLHNCQUFzQjs7V0EwQmYsOEJBQUc7QUFDbkIsVUFBSSxD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Q1osb0NBQTRCLEVBQUUsUUFBUTtPQUN2QyxDQUFDLENBQUM7QUFDSCxVQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUM7QUFDcEUsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3RFLFVBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUU1RCxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztLQUM5Qzs7Ozs7V0FHWSx1QkFBQyxRQUFzQyxFQUFFLE1BQWMsRUFBUTtBQUMxRSxVQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUU1QyxVQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsZUFBTyxHQUFHLG9CQUFNLFlBQVksQ0FBQyxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFDLENBQUMsQ0FBQztPQUN2RTtBQUNELFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixlQUFPLEVBQVAsT0FBTztPQUNSLENBQUMsQ0FBQztLQUNKOzs7U0FqS1Usc0JBQXNCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJEZWJ1Z2dlckxhdW5jaEF0dGFjaFVJLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RlYnVnZ2VyUHJvdmlkZXJTdG9yZX0gZnJvbSAnLi9EZWJ1Z2dlclByb3ZpZGVyU3RvcmUnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlciBmcm9tICcuL0RlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXInO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJBY3Rpb25zIGZyb20gJy4vRGVidWdnZXJBY3Rpb25zJztcblxuaW1wb3J0IE51Y2xpZGVEcm9wZG93biBmcm9tICcuLi8uLi9udWNsaWRlLXVpLWRyb3Bkb3duJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxudHlwZSBQcm9wc1R5cGUgPSB7XG4gIHN0b3JlOiBEZWJ1Z2dlclByb3ZpZGVyU3RvcmU7XG4gIGRlYnVnZ2VyQWN0aW9uczogRGVidWdnZXJBY3Rpb25zO1xufTtcblxudHlwZSBTdGF0ZVR5cGUgPSB7XG4gIGNvbm5lY3Rpb25zVXBkYXRlZERpc3Bvc2FibGU6IElEaXNwb3NhYmxlO1xuICAvLyBDdXJyZW50IGF2YWlsYWJsZSBOdWNsaWRlIGNvbm5lY3Rpb25zLlxuICBjb25uZWN0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgLy8gQXZhaWxibGUgbGF1bmNoL2F0dGFjaCBwcm92aWRlcnMgZm9yIGN1cnJlbnQgc2VsZWN0ZWQgY29ubmVjdGlvbi5cbiAgYXZhaWxhYmxlUHJvdmlkZXJzOiBBcnJheTxEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyPjtcbiAgLy8gQ3VzdG9taXplZCBsYXVuY2gvYXR0YWNoIGFjdGlvbnMgc3VwcG9ydGVkIGJ5IHRoaXMgKGNvbm5lY3Rpb24gKyBwcm92aWRlcikgY29tYmluYXRpb24uXG4gIHByb3ZpZGVyQWN0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgY29ubmVjdGlvbnNEcm9wZG93bkluZGV4OiBudW1iZXI7XG4gIGRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4OiBudW1iZXI7XG4gIHByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXg6IG51bWJlcjtcbiAgZWxlbWVudDogP1JlYWN0RWxlbWVudDtcbn07XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlckxhdW5jaEF0dGFjaFVJIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgU3RhdGVUeXBlPiB7XG4gIHByb3BzOiBQcm9wc1R5cGU7XG4gIHN0YXRlOiBTdGF0ZVR5cGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzVHlwZSkge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgICh0aGlzOiBhbnkpLl9yZXNldENvbm5lY3Rpb25zID0gdGhpcy5fcmVzZXRDb25uZWN0aW9ucy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDb25uZWN0aW9uRHJvcGRvd25DaGFuZ2UgPSB0aGlzLl9oYW5kbGVDb25uZWN0aW9uRHJvcGRvd25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlRGVidWdnaW5nVHlwZURyb3Bkb3duQ2hhbmdlID1cbiAgICAgIHRoaXMuX2hhbmRsZURlYnVnZ2luZ1R5cGVEcm9wZG93bkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZSA9XG4gICAgICB0aGlzLl9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGNvbm5lY3Rpb25zVXBkYXRlZERpc3Bvc2FibGU6IHRoaXMucHJvcHMuc3RvcmUub25Db25uZWN0aW9uc1VwZGF0ZWQodGhpcy5fcmVzZXRDb25uZWN0aW9ucyksXG4gICAgICBjb25uZWN0aW9uczogW10sXG4gICAgICBhdmFpbGFibGVQcm92aWRlcnM6IFtdLFxuICAgICAgcHJvdmlkZXJBY3Rpb25zOiBbXSxcbiAgICAgIGNvbm5lY3Rpb25zRHJvcGRvd25JbmRleDogMCxcbiAgICAgIGRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4OiAwLFxuICAgICAgcHJvdmlkZXJBY3Rpb25zRHJvcGRvd25JbmRleDogMCxcbiAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnByb3BzLmRlYnVnZ2VyQWN0aW9ucy51cGRhdGVDb25uZWN0aW9ucygpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5zdGF0ZS5jb25uZWN0aW9uc1VwZGF0ZWREaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25JdGVtcyA9IHRoaXMuc3RhdGUuY29ubmVjdGlvbnMubWFwKChjb25uZWN0aW9uLCBpbmRleCkgPT4gKHtcbiAgICAgIGxhYmVsOiByZW1vdGVVcmkuaXNSZW1vdGUoY29ubmVjdGlvbikgPyByZW1vdGVVcmkuZ2V0SG9zdG5hbWUoY29ubmVjdGlvbikgOiBjb25uZWN0aW9uLFxuICAgICAgdmFsdWU6IGluZGV4LFxuICAgIH0pKTtcblxuICAgIGNvbnN0IGRlYnVnZ2luZ1R5cGVJdGVtcyA9IHRoaXMuc3RhdGUuYXZhaWxhYmxlUHJvdmlkZXJzLm1hcCgocHJvdmlkZXIsIGluZGV4KSA9PiAoe1xuICAgICAgbGFiZWw6IHByb3ZpZGVyLmdldERlYnVnZ2luZ1R5cGVOYW1lKCksXG4gICAgICB2YWx1ZTogaW5kZXgsXG4gICAgfSkpO1xuXG4gICAgY29uc3QgcHJvdmlkZXJBY3Rpb25zID0gdGhpcy5zdGF0ZS5wcm92aWRlckFjdGlvbnMubWFwKChhY3Rpb24sIGluZGV4KSA9PiAoe1xuICAgICAgbGFiZWw6IGFjdGlvbixcbiAgICAgIHZhbHVlOiBpbmRleCxcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9jayBwYWRkZWRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsYXVuY2gtYXR0YWNoLWhlYWRlclwiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5Db25uZWN0aW9uOiA8L2xhYmVsPlxuICAgICAgICAgIDxOdWNsaWRlRHJvcGRvd25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICBtZW51SXRlbXM9e2Nvbm5lY3Rpb25JdGVtc31cbiAgICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuX2hhbmRsZUNvbm5lY3Rpb25Ecm9wZG93bkNoYW5nZX1cbiAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuY29ubmVjdGlvbnNEcm9wZG93bkluZGV4fVxuICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5UeXBlOiA8L2xhYmVsPlxuICAgICAgICAgIDxOdWNsaWRlRHJvcGRvd25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICBtZW51SXRlbXM9e2RlYnVnZ2luZ1R5cGVJdGVtc31cbiAgICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuX2hhbmRsZURlYnVnZ2luZ1R5cGVEcm9wZG93bkNoYW5nZX1cbiAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuZGVidWdnaW5nVHlwZURyb3Bkb3duSW5kZXh9XG4gICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPkFjdGlvbjogPC9sYWJlbD5cbiAgICAgICAgICA8TnVjbGlkZURyb3Bkb3duXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgbWVudUl0ZW1zPXtwcm92aWRlckFjdGlvbnN9XG4gICAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZX1cbiAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUucHJvdmlkZXJBY3Rpb25zRHJvcGRvd25JbmRleH1cbiAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAge3RoaXMuc3RhdGUuZWxlbWVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLy8gUmVzZXQgY29ubmVjdGlvbnMgZHJvcGRvd24gd2l0aCBsYXRlc3QgY29ubmVjdGlvbnMuXG4gIF9yZXNldENvbm5lY3Rpb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25zID0gdGhpcy5wcm9wcy5zdG9yZS5nZXRDb25uZWN0aW9ucygpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY29ubmVjdGlvbnMsXG4gICAgICBjb25uZWN0aW9uc0Ryb3Bkb3duSW5kZXg6IDAsXG4gICAgfSk7XG4gICAgLy8gQ29udGludWUgZmlsbCBkZWJ1Z2dpbmcgdHlwZXMgZHJvcGRvd24gZm9yIG5ldyBjb25uZWN0aW9uLlxuICAgIHRoaXMuX3Jlc2V0QXZhaWxhYmxlRGVidWdnaW5nVHlwZXMoY29ubmVjdGlvbnNbMF0pO1xuICB9XG5cbiAgX2hhbmRsZUNvbm5lY3Rpb25Ecm9wZG93bkNoYW5nZShuZXdJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb25uZWN0aW9uc0Ryb3Bkb3duSW5kZXg6IG5ld0luZGV4LFxuICAgIH0pO1xuICAgIGNvbnN0IHNlbGVjdGVkQ29ubmVjdGlvbiA9IHRoaXMuc3RhdGUuY29ubmVjdGlvbnNbbmV3SW5kZXhdO1xuICAgIHRoaXMuX3Jlc2V0QXZhaWxhYmxlRGVidWdnaW5nVHlwZXMoc2VsZWN0ZWRDb25uZWN0aW9uKTtcbiAgfVxuXG4gIC8vIFJlc2V0IGRlYnVnZ2luZyB0eXBlcyBkcm9wZG93biBmb3IgaW5wdXQgY29ubmVjdGlvbi5cbiAgX3Jlc2V0QXZhaWxhYmxlRGVidWdnaW5nVHlwZXMoY29ubmVjdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJQcmV2aW91c1Byb3ZpZGVycygpO1xuICAgIGNvbnN0IGF2YWlsYWJsZVByb3ZpZGVycyA9XG4gICAgICB0aGlzLnByb3BzLnN0b3JlLmdldExhdW5jaEF0dGFjaFByb3ZpZGVyc0ZvckNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhdmFpbGFibGVQcm92aWRlcnMsXG4gICAgICBkZWJ1Z2dpbmdUeXBlRHJvcGRvd25JbmRleDogMCxcbiAgICB9KTtcbiAgICAvLyBDb250aW51ZSBmaWxsIGFjdGlvbnMgZHJvcGRvd24gZm9yIG5ldyBwcm92aWRlci5cbiAgICB0aGlzLl9yZXNldFByb3ZpZGVyQWN0aW9ucyhhdmFpbGFibGVQcm92aWRlcnNbMF0pO1xuICB9XG5cbiAgX2NsZWFyUHJldmlvdXNQcm92aWRlcnMoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBwcm92aWRlciBvZiB0aGlzLnN0YXRlLmF2YWlsYWJsZVByb3ZpZGVycykge1xuICAgICAgcHJvdmlkZXIuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z2dpbmdUeXBlRHJvcGRvd25DaGFuZ2UobmV3SW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZGVidWdnaW5nVHlwZURyb3Bkb3duSW5kZXg6IG5ld0luZGV4LFxuICAgIH0pO1xuICAgIHRoaXMuX3Jlc2V0UHJvdmlkZXJBY3Rpb25zKHRoaXMuc3RhdGUuYXZhaWxhYmxlUHJvdmlkZXJzW25ld0luZGV4XSk7XG4gIH1cblxuICAvLyBSZXNldCBhY3Rpb25zIGRyb3Bkb3duIGZvciBpbnB1dCBEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyLlxuICBfcmVzZXRQcm92aWRlckFjdGlvbnMocHJvdmlkZXI6IERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIpOiB2b2lkIHtcbiAgICBjb25zdCBwcm92aWRlckFjdGlvbnMgPSBwcm92aWRlci5nZXRBY3Rpb25zKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwcm92aWRlckFjdGlvbnMsXG4gICAgICBwcm92aWRlckFjdGlvbnNEcm9wZG93bkluZGV4OiAwLFxuICAgIH0pO1xuICAgIHRoaXMuX3Jlc2V0RWxlbWVudChwcm92aWRlciwgcHJvdmlkZXJBY3Rpb25zWzBdKTtcbiAgfVxuXG4gIF9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZShuZXdJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwcm92aWRlckFjdGlvbnNEcm9wZG93bkluZGV4OiBuZXdJbmRleCxcbiAgICB9KTtcbiAgICBjb25zdCBzZWxlY3RlZFByb3ZpZGVySW5kZXggPSB0aGlzLnN0YXRlLmRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4O1xuICAgIGNvbnN0IHByb3ZpZGVyID0gdGhpcy5zdGF0ZS5hdmFpbGFibGVQcm92aWRlcnNbc2VsZWN0ZWRQcm92aWRlckluZGV4XTtcbiAgICBjb25zdCBzZWxlY3RlZEFjdGlvbiA9IHRoaXMuc3RhdGUucHJvdmlkZXJBY3Rpb25zW25ld0luZGV4XTtcbiAgICAvLyBDb250aW51ZSB1c2UgbmV3IFVJIGVsZW1lbnQgZm9yIG5ldyBwcm92aWRlciArIGFjdGlvbi5cbiAgICB0aGlzLl9yZXNldEVsZW1lbnQocHJvdmlkZXIsIHNlbGVjdGVkQWN0aW9uKTtcbiAgfVxuXG4gIC8vIERpc3BsYXkgbmV3IGN1c3RvbWl6ZWQgZWxlbWVudCBVSSBmcm9tIGlucHV0IHByb3ZpZGVyIGFuZCBhY3Rpb24uXG4gIF9yZXNldEVsZW1lbnQocHJvdmlkZXI6IERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIsIGFjdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGVsZW1lbnQgPSBwcm92aWRlci5nZXRDb21wb25lbnQoYWN0aW9uKTtcbiAgICAvLyBBc3NpZ24gYW4gdW5pcXVlIGtleSB0byBlbGVtZW50IHNvIHRoYXQgcmVhY3QgdHJlYXRzIGl0IGFzIGEgbmV3IGVsZW1lbnQuXG4gICAgaWYgKGVsZW1lbnQgIT0gbnVsbCkge1xuICAgICAgZWxlbWVudCA9IFJlYWN0LmNsb25lRWxlbWVudChlbGVtZW50LCB7a2V5OiBwcm92aWRlci5nZXRVbmlxdWVLZXkoKX0pO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGVsZW1lbnQsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==