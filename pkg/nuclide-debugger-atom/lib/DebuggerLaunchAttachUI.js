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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTGF1bmNoQXR0YWNoVUkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0FldUIsK0JBQStCOzs0QkFDbEMsZ0JBQWdCOztnQ0FDZCwwQkFBMEI7Ozs7SUFxQm5DLHNCQUFzQjtZQUF0QixzQkFBc0I7O0FBSXRCLFdBSkEsc0JBQXNCLENBSXJCLEtBQWdCLEVBQUU7MEJBSm5CLHNCQUFzQjs7QUFLL0IsK0JBTFMsc0JBQXNCLDZDQUt6QixLQUFLLEVBQUU7O0FBRWIsQUFBQyxRQUFJLENBQU8saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRSxBQUFDLFFBQUksQ0FBTywrQkFBK0IsR0FBRyxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlGLEFBQUMsUUFBSSxDQUFPLGtDQUFrQyxHQUM1QyxJQUFJLENBQUMsa0NBQWtDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELEFBQUMsUUFBSSxDQUFPLG9DQUFvQyxHQUM5QyxJQUFJLENBQUMsb0NBQW9DLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV2RCxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsa0NBQTRCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0FBQzNGLGlCQUFXLEVBQUUsRUFBRTtBQUNmLHdCQUFrQixFQUFFLEVBQUU7QUFDdEIscUJBQWUsRUFBRSxFQUFFO0FBQ25CLDhCQUF3QixFQUFFLENBQUM7QUFDM0IsZ0NBQTBCLEVBQUUsQ0FBQztBQUM3QixrQ0FBNEIsRUFBRSxDQUFDO0FBQy9CLGFBQU8sRUFBRSxJQUFJO0tBQ2QsQ0FBQztHQUNIOztlQXhCVSxzQkFBc0I7O1dBMEJmLDhCQUFHO0FBQ25CLFVBQUksQ0FB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LG9DQUE0QixFQUFFLFFBQVE7T0FDdkMsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDO0FBQ3BFLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN0RSxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFNUQsVUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDOUM7Ozs7O1dBR1ksdUJBQUMsUUFBc0MsRUFBRSxNQUFjLEVBQVE7QUFDMUUsVUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFNUMsVUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ25CLGVBQU8sR0FBRyxvQkFBTSxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsRUFBQyxDQUFDLENBQUM7T0FDdkU7QUFDRCxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osZUFBTyxFQUFQLE9BQU87T0FDUixDQUFDLENBQUM7S0FDSjs7O1NBaktVLHNCQUFzQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiRGVidWdnZXJMYXVuY2hBdHRhY2hVSS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEZWJ1Z2dlclByb3ZpZGVyU3RvcmV9IGZyb20gJy4vRGVidWdnZXJQcm92aWRlclN0b3JlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIgZnJvbSAnLi9EZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyQWN0aW9ucyBmcm9tICcuL0RlYnVnZ2VyQWN0aW9ucyc7XG5cbmltcG9ydCB7RHJvcGRvd259IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0Ryb3Bkb3duJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxudHlwZSBQcm9wc1R5cGUgPSB7XG4gIHN0b3JlOiBEZWJ1Z2dlclByb3ZpZGVyU3RvcmU7XG4gIGRlYnVnZ2VyQWN0aW9uczogRGVidWdnZXJBY3Rpb25zO1xufTtcblxudHlwZSBTdGF0ZVR5cGUgPSB7XG4gIGNvbm5lY3Rpb25zVXBkYXRlZERpc3Bvc2FibGU6IElEaXNwb3NhYmxlO1xuICAvLyBDdXJyZW50IGF2YWlsYWJsZSBOdWNsaWRlIGNvbm5lY3Rpb25zLlxuICBjb25uZWN0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgLy8gQXZhaWxibGUgbGF1bmNoL2F0dGFjaCBwcm92aWRlcnMgZm9yIGN1cnJlbnQgc2VsZWN0ZWQgY29ubmVjdGlvbi5cbiAgYXZhaWxhYmxlUHJvdmlkZXJzOiBBcnJheTxEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyPjtcbiAgLy8gQ3VzdG9taXplZCBsYXVuY2gvYXR0YWNoIGFjdGlvbnMgc3VwcG9ydGVkIGJ5IHRoaXMgKGNvbm5lY3Rpb24gKyBwcm92aWRlcikgY29tYmluYXRpb24uXG4gIHByb3ZpZGVyQWN0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgY29ubmVjdGlvbnNEcm9wZG93bkluZGV4OiBudW1iZXI7XG4gIGRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4OiBudW1iZXI7XG4gIHByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXg6IG51bWJlcjtcbiAgZWxlbWVudDogP1JlYWN0LkVsZW1lbnQ7XG59O1xuXG5leHBvcnQgY2xhc3MgRGVidWdnZXJMYXVuY2hBdHRhY2hVSSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wc1R5cGUsIFN0YXRlVHlwZT4ge1xuICBwcm9wczogUHJvcHNUeXBlO1xuICBzdGF0ZTogU3RhdGVUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wc1R5cGUpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAodGhpczogYW55KS5fcmVzZXRDb25uZWN0aW9ucyA9IHRoaXMuX3Jlc2V0Q29ubmVjdGlvbnMuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ29ubmVjdGlvbkRyb3Bkb3duQ2hhbmdlID0gdGhpcy5faGFuZGxlQ29ubmVjdGlvbkRyb3Bkb3duQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZURlYnVnZ2luZ1R5cGVEcm9wZG93bkNoYW5nZSA9XG4gICAgICB0aGlzLl9oYW5kbGVEZWJ1Z2dpbmdUeXBlRHJvcGRvd25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlUHJvdmlkZXJBY3Rpb25zRHJvcGRvd25DaGFuZ2UgPVxuICAgICAgdGhpcy5faGFuZGxlUHJvdmlkZXJBY3Rpb25zRHJvcGRvd25DaGFuZ2UuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjb25uZWN0aW9uc1VwZGF0ZWREaXNwb3NhYmxlOiB0aGlzLnByb3BzLnN0b3JlLm9uQ29ubmVjdGlvbnNVcGRhdGVkKHRoaXMuX3Jlc2V0Q29ubmVjdGlvbnMpLFxuICAgICAgY29ubmVjdGlvbnM6IFtdLFxuICAgICAgYXZhaWxhYmxlUHJvdmlkZXJzOiBbXSxcbiAgICAgIHByb3ZpZGVyQWN0aW9uczogW10sXG4gICAgICBjb25uZWN0aW9uc0Ryb3Bkb3duSW5kZXg6IDAsXG4gICAgICBkZWJ1Z2dpbmdUeXBlRHJvcGRvd25JbmRleDogMCxcbiAgICAgIHByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXg6IDAsXG4gICAgICBlbGVtZW50OiBudWxsLFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5wcm9wcy5kZWJ1Z2dlckFjdGlvbnMudXBkYXRlQ29ubmVjdGlvbnMoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuc3RhdGUuY29ubmVjdGlvbnNVcGRhdGVkRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgY29ubmVjdGlvbkl0ZW1zID0gdGhpcy5zdGF0ZS5jb25uZWN0aW9ucy5tYXAoKGNvbm5lY3Rpb24sIGluZGV4KSA9PiAoe1xuICAgICAgbGFiZWw6IHJlbW90ZVVyaS5pc1JlbW90ZShjb25uZWN0aW9uKSA/IHJlbW90ZVVyaS5nZXRIb3N0bmFtZShjb25uZWN0aW9uKSA6IGNvbm5lY3Rpb24sXG4gICAgICB2YWx1ZTogaW5kZXgsXG4gICAgfSkpO1xuXG4gICAgY29uc3QgZGVidWdnaW5nVHlwZUl0ZW1zID0gdGhpcy5zdGF0ZS5hdmFpbGFibGVQcm92aWRlcnMubWFwKChwcm92aWRlciwgaW5kZXgpID0+ICh7XG4gICAgICBsYWJlbDogcHJvdmlkZXIuZ2V0RGVidWdnaW5nVHlwZU5hbWUoKSxcbiAgICAgIHZhbHVlOiBpbmRleCxcbiAgICB9KSk7XG5cbiAgICBjb25zdCBwcm92aWRlckFjdGlvbnMgPSB0aGlzLnN0YXRlLnByb3ZpZGVyQWN0aW9ucy5tYXAoKGFjdGlvbiwgaW5kZXgpID0+ICh7XG4gICAgICBsYWJlbDogYWN0aW9uLFxuICAgICAgdmFsdWU6IGluZGV4LFxuICAgIH0pKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrIHBhZGRlZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxhdW5jaC1hdHRhY2gtaGVhZGVyXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPkNvbm5lY3Rpb246IDwvbGFiZWw+XG4gICAgICAgICAgPERyb3Bkb3duXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgbWVudUl0ZW1zPXtjb25uZWN0aW9uSXRlbXN9XG4gICAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVDb25uZWN0aW9uRHJvcGRvd25DaGFuZ2V9XG4gICAgICAgICAgICBzZWxlY3RlZEluZGV4PXt0aGlzLnN0YXRlLmNvbm5lY3Rpb25zRHJvcGRvd25JbmRleH1cbiAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+VHlwZTogPC9sYWJlbD5cbiAgICAgICAgICA8RHJvcGRvd25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICBtZW51SXRlbXM9e2RlYnVnZ2luZ1R5cGVJdGVtc31cbiAgICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuX2hhbmRsZURlYnVnZ2luZ1R5cGVEcm9wZG93bkNoYW5nZX1cbiAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuZGVidWdnaW5nVHlwZURyb3Bkb3duSW5kZXh9XG4gICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPkFjdGlvbjogPC9sYWJlbD5cbiAgICAgICAgICA8RHJvcGRvd25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICBtZW51SXRlbXM9e3Byb3ZpZGVyQWN0aW9uc31cbiAgICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuX2hhbmRsZVByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duQ2hhbmdlfVxuICAgICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5wcm92aWRlckFjdGlvbnNEcm9wZG93bkluZGV4fVxuICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICB7dGhpcy5zdGF0ZS5lbGVtZW50fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICAvLyBSZXNldCBjb25uZWN0aW9ucyBkcm9wZG93biB3aXRoIGxhdGVzdCBjb25uZWN0aW9ucy5cbiAgX3Jlc2V0Q29ubmVjdGlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgY29ubmVjdGlvbnMgPSB0aGlzLnByb3BzLnN0b3JlLmdldENvbm5lY3Rpb25zKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb25uZWN0aW9ucyxcbiAgICAgIGNvbm5lY3Rpb25zRHJvcGRvd25JbmRleDogMCxcbiAgICB9KTtcbiAgICAvLyBDb250aW51ZSBmaWxsIGRlYnVnZ2luZyB0eXBlcyBkcm9wZG93biBmb3IgbmV3IGNvbm5lY3Rpb24uXG4gICAgdGhpcy5fcmVzZXRBdmFpbGFibGVEZWJ1Z2dpbmdUeXBlcyhjb25uZWN0aW9uc1swXSk7XG4gIH1cblxuICBfaGFuZGxlQ29ubmVjdGlvbkRyb3Bkb3duQ2hhbmdlKG5ld0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNvbm5lY3Rpb25zRHJvcGRvd25JbmRleDogbmV3SW5kZXgsXG4gICAgfSk7XG4gICAgY29uc3Qgc2VsZWN0ZWRDb25uZWN0aW9uID0gdGhpcy5zdGF0ZS5jb25uZWN0aW9uc1tuZXdJbmRleF07XG4gICAgdGhpcy5fcmVzZXRBdmFpbGFibGVEZWJ1Z2dpbmdUeXBlcyhzZWxlY3RlZENvbm5lY3Rpb24pO1xuICB9XG5cbiAgLy8gUmVzZXQgZGVidWdnaW5nIHR5cGVzIGRyb3Bkb3duIGZvciBpbnB1dCBjb25uZWN0aW9uLlxuICBfcmVzZXRBdmFpbGFibGVEZWJ1Z2dpbmdUeXBlcyhjb25uZWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGVhclByZXZpb3VzUHJvdmlkZXJzKCk7XG4gICAgY29uc3QgYXZhaWxhYmxlUHJvdmlkZXJzID1cbiAgICAgIHRoaXMucHJvcHMuc3RvcmUuZ2V0TGF1bmNoQXR0YWNoUHJvdmlkZXJzRm9yQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGF2YWlsYWJsZVByb3ZpZGVycyxcbiAgICAgIGRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4OiAwLFxuICAgIH0pO1xuICAgIC8vIENvbnRpbnVlIGZpbGwgYWN0aW9ucyBkcm9wZG93biBmb3IgbmV3IHByb3ZpZGVyLlxuICAgIHRoaXMuX3Jlc2V0UHJvdmlkZXJBY3Rpb25zKGF2YWlsYWJsZVByb3ZpZGVyc1swXSk7XG4gIH1cblxuICBfY2xlYXJQcmV2aW91c1Byb3ZpZGVycygpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIHRoaXMuc3RhdGUuYXZhaWxhYmxlUHJvdmlkZXJzKSB7XG4gICAgICBwcm92aWRlci5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZURlYnVnZ2luZ1R5cGVEcm9wZG93bkNoYW5nZShuZXdJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkZWJ1Z2dpbmdUeXBlRHJvcGRvd25JbmRleDogbmV3SW5kZXgsXG4gICAgfSk7XG4gICAgdGhpcy5fcmVzZXRQcm92aWRlckFjdGlvbnModGhpcy5zdGF0ZS5hdmFpbGFibGVQcm92aWRlcnNbbmV3SW5kZXhdKTtcbiAgfVxuXG4gIC8vIFJlc2V0IGFjdGlvbnMgZHJvcGRvd24gZm9yIGlucHV0IERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIuXG4gIF9yZXNldFByb3ZpZGVyQWN0aW9ucyhwcm92aWRlcjogRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcik6IHZvaWQge1xuICAgIGNvbnN0IHByb3ZpZGVyQWN0aW9ucyA9IHByb3ZpZGVyLmdldEFjdGlvbnMoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb3ZpZGVyQWN0aW9ucyxcbiAgICAgIHByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXg6IDAsXG4gICAgfSk7XG4gICAgdGhpcy5fcmVzZXRFbGVtZW50KHByb3ZpZGVyLCBwcm92aWRlckFjdGlvbnNbMF0pO1xuICB9XG5cbiAgX2hhbmRsZVByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duQ2hhbmdlKG5ld0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXg6IG5ld0luZGV4LFxuICAgIH0pO1xuICAgIGNvbnN0IHNlbGVjdGVkUHJvdmlkZXJJbmRleCA9IHRoaXMuc3RhdGUuZGVidWdnaW5nVHlwZURyb3Bkb3duSW5kZXg7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLnN0YXRlLmF2YWlsYWJsZVByb3ZpZGVyc1tzZWxlY3RlZFByb3ZpZGVySW5kZXhdO1xuICAgIGNvbnN0IHNlbGVjdGVkQWN0aW9uID0gdGhpcy5zdGF0ZS5wcm92aWRlckFjdGlvbnNbbmV3SW5kZXhdO1xuICAgIC8vIENvbnRpbnVlIHVzZSBuZXcgVUkgZWxlbWVudCBmb3IgbmV3IHByb3ZpZGVyICsgYWN0aW9uLlxuICAgIHRoaXMuX3Jlc2V0RWxlbWVudChwcm92aWRlciwgc2VsZWN0ZWRBY3Rpb24pO1xuICB9XG5cbiAgLy8gRGlzcGxheSBuZXcgY3VzdG9taXplZCBlbGVtZW50IFVJIGZyb20gaW5wdXQgcHJvdmlkZXIgYW5kIGFjdGlvbi5cbiAgX3Jlc2V0RWxlbWVudChwcm92aWRlcjogRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlciwgYWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgZWxlbWVudCA9IHByb3ZpZGVyLmdldENvbXBvbmVudChhY3Rpb24pO1xuICAgIC8vIEFzc2lnbiBhbiB1bmlxdWUga2V5IHRvIGVsZW1lbnQgc28gdGhhdCByZWFjdCB0cmVhdHMgaXQgYXMgYSBuZXcgZWxlbWVudC5cbiAgICBpZiAoZWxlbWVudCAhPSBudWxsKSB7XG4gICAgICBlbGVtZW50ID0gUmVhY3QuY2xvbmVFbGVtZW50KGVsZW1lbnQsIHtrZXk6IHByb3ZpZGVyLmdldFVuaXF1ZUtleSgpfSk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZWxlbWVudCxcbiAgICB9KTtcbiAgfVxufVxuIl19