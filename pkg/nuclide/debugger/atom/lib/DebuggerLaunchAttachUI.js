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

/*eslint-disable react/prop-types */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _uiDropdown = require('../../../ui/dropdown');

var _uiDropdown2 = _interopRequireDefault(_uiDropdown);

var _reactForAtom = require('react-for-atom');

var _remoteUri = require('../../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

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
          label: _remoteUri2['default'].isRemote(connection) ? _remoteUri2['default'].getHostname(connection) : connection,
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
          'label',
          { className: 'inline-block' },
          'Connection: '
        ),
        _reactForAtom.React.createElement(_uiDropdown2['default'], {
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
        _reactForAtom.React.createElement(_uiDropdown2['default'], {
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
        _reactForAtom.React.createElement(_uiDropdown2['default'], {
          className: 'inline-block',
          menuItems: providerActions,
          onSelectedChange: this._handleProviderActionsDropdownChange,
          selectedIndex: this.state.providerActionsDropdownIndex,
          size: 'sm'
        }),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTGF1bmNoQXR0YWNoVUkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQWlCNEIsc0JBQXNCOzs7OzRCQUM5QixnQkFBZ0I7O3lCQUNkLHFCQUFxQjs7OztJQXFCOUIsc0JBQXNCO1lBQXRCLHNCQUFzQjs7QUFHdEIsV0FIQSxzQkFBc0IsQ0FHckIsS0FBZ0IsRUFBRTswQkFIbkIsc0JBQXNCOztBQUkvQiwrQkFKUyxzQkFBc0IsNkNBSXpCLEtBQUssRUFBRTs7QUFFYixBQUFDLFFBQUksQ0FBTyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xFLEFBQUMsUUFBSSxDQUFPLCtCQUErQixHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUYsQUFBQyxRQUFJLENBQU8sa0NBQWtDLEdBQzVDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsQUFBQyxRQUFJLENBQU8sb0NBQW9DLEdBQzlDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXZELFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxrQ0FBNEIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDM0YsaUJBQVcsRUFBRSxFQUFFO0FBQ2Ysd0JBQWtCLEVBQUUsRUFBRTtBQUN0QixxQkFBZSxFQUFFLEVBQUU7QUFDbkIsOEJBQXdCLEVBQUUsQ0FBQztBQUMzQixnQ0FBMEIsRUFBRSxDQUFDO0FBQzdCLGtDQUE0QixFQUFFLENBQUM7QUFDL0IsYUFBTyxFQUFFLElBQUk7S0FDZCxDQUFDO0dBQ0g7O2VBdkJVLHNCQUFzQjs7V0F5QmYsOEJBQUc7QUFDbkIsVUFB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QztBQUNILFVBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztBQUNwRSxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDdEUsVUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTVELFVBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQzlDOzs7OztXQUdZLHVCQUFDLFFBQXNDLEVBQUUsTUFBYyxFQUFRO0FBQzFFLFVBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTVDLFVBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixlQUFPLEdBQUcsb0JBQU0sWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsWUFBWSxFQUFFLEVBQUMsQ0FBQyxDQUFDO09BQ3ZFO0FBQ0QsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGVBQU8sRUFBUCxPQUFPO09BQ1IsQ0FBQyxDQUFDO0tBQ0o7OztTQTlKVSxzQkFBc0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkRlYnVnZ2VyTGF1bmNoQXR0YWNoVUkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKmVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cblxuaW1wb3J0IHR5cGUge0RlYnVnZ2VyUHJvdmlkZXJTdG9yZX0gZnJvbSAnLi9EZWJ1Z2dlclByb3ZpZGVyU3RvcmUnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlciBmcm9tICcuL0RlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXInO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJBY3Rpb25zIGZyb20gJy4vRGVidWdnZXJBY3Rpb25zJztcblxuaW1wb3J0IE51Y2xpZGVEcm9wZG93biBmcm9tICcuLi8uLi8uLi91aS9kcm9wZG93bic7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuXG50eXBlIFByb3BzVHlwZSA9IHtcbiAgc3RvcmU6IERlYnVnZ2VyUHJvdmlkZXJTdG9yZTtcbiAgZGVidWdnZXJBY3Rpb25zOiBEZWJ1Z2dlckFjdGlvbnM7XG59O1xuXG50eXBlIFN0YXRlVHlwZSA9IHtcbiAgY29ubmVjdGlvbnNVcGRhdGVkRGlzcG9zYWJsZTogSURpc3Bvc2FibGU7XG4gIC8vIEN1cnJlbnQgYXZhaWxhYmxlIE51Y2xpZGUgY29ubmVjdGlvbnMuXG4gIGNvbm5lY3Rpb25zOiBBcnJheTxzdHJpbmc+O1xuICAvLyBBdmFpbGJsZSBsYXVuY2gvYXR0YWNoIHByb3ZpZGVycyBmb3IgY3VycmVudCBzZWxlY3RlZCBjb25uZWN0aW9uLlxuICBhdmFpbGFibGVQcm92aWRlcnM6IEFycmF5PERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXI+O1xuICAvLyBDdXN0b21pemVkIGxhdW5jaC9hdHRhY2ggYWN0aW9ucyBzdXBwb3J0ZWQgYnkgdGhpcyAoY29ubmVjdGlvbiArIHByb3ZpZGVyKSBjb21iaW5hdGlvbi5cbiAgcHJvdmlkZXJBY3Rpb25zOiBBcnJheTxzdHJpbmc+O1xuICBjb25uZWN0aW9uc0Ryb3Bkb3duSW5kZXg6IG51bWJlcjtcbiAgZGVidWdnaW5nVHlwZURyb3Bkb3duSW5kZXg6IG51bWJlcjtcbiAgcHJvdmlkZXJBY3Rpb25zRHJvcGRvd25JbmRleDogbnVtYmVyO1xuICBlbGVtZW50OiA/UmVhY3RFbGVtZW50O1xufTtcblxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyTGF1bmNoQXR0YWNoVUkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHNUeXBlLCBTdGF0ZVR5cGU+IHtcbiAgc3RhdGU6IFN0YXRlVHlwZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHNUeXBlKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgKHRoaXM6IGFueSkuX3Jlc2V0Q29ubmVjdGlvbnMgPSB0aGlzLl9yZXNldENvbm5lY3Rpb25zLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNvbm5lY3Rpb25Ecm9wZG93bkNoYW5nZSA9IHRoaXMuX2hhbmRsZUNvbm5lY3Rpb25Ecm9wZG93bkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVEZWJ1Z2dpbmdUeXBlRHJvcGRvd25DaGFuZ2UgPVxuICAgICAgdGhpcy5faGFuZGxlRGVidWdnaW5nVHlwZURyb3Bkb3duQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duQ2hhbmdlID1cbiAgICAgIHRoaXMuX2hhbmRsZVByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duQ2hhbmdlLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgY29ubmVjdGlvbnNVcGRhdGVkRGlzcG9zYWJsZTogdGhpcy5wcm9wcy5zdG9yZS5vbkNvbm5lY3Rpb25zVXBkYXRlZCh0aGlzLl9yZXNldENvbm5lY3Rpb25zKSxcbiAgICAgIGNvbm5lY3Rpb25zOiBbXSxcbiAgICAgIGF2YWlsYWJsZVByb3ZpZGVyczogW10sXG4gICAgICBwcm92aWRlckFjdGlvbnM6IFtdLFxuICAgICAgY29ubmVjdGlvbnNEcm9wZG93bkluZGV4OiAwLFxuICAgICAgZGVidWdnaW5nVHlwZURyb3Bkb3duSW5kZXg6IDAsXG4gICAgICBwcm92aWRlckFjdGlvbnNEcm9wZG93bkluZGV4OiAwLFxuICAgICAgZWxlbWVudDogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHRoaXMucHJvcHMuZGVidWdnZXJBY3Rpb25zLnVwZGF0ZUNvbm5lY3Rpb25zKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLnN0YXRlLmNvbm5lY3Rpb25zVXBkYXRlZERpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY29ubmVjdGlvbkl0ZW1zID0gdGhpcy5zdGF0ZS5jb25uZWN0aW9ucy5tYXAoKGNvbm5lY3Rpb24sIGluZGV4KSA9PiAoe1xuICAgICAgbGFiZWw6IHJlbW90ZVVyaS5pc1JlbW90ZShjb25uZWN0aW9uKSA/IHJlbW90ZVVyaS5nZXRIb3N0bmFtZShjb25uZWN0aW9uKSA6IGNvbm5lY3Rpb24sXG4gICAgICB2YWx1ZTogaW5kZXgsXG4gICAgfSkpO1xuXG4gICAgY29uc3QgZGVidWdnaW5nVHlwZUl0ZW1zID0gdGhpcy5zdGF0ZS5hdmFpbGFibGVQcm92aWRlcnMubWFwKChwcm92aWRlciwgaW5kZXgpID0+ICh7XG4gICAgICBsYWJlbDogcHJvdmlkZXIuZ2V0RGVidWdnaW5nVHlwZU5hbWUoKSxcbiAgICAgIHZhbHVlOiBpbmRleCxcbiAgICB9KSk7XG5cbiAgICBjb25zdCBwcm92aWRlckFjdGlvbnMgPSB0aGlzLnN0YXRlLnByb3ZpZGVyQWN0aW9ucy5tYXAoKGFjdGlvbiwgaW5kZXgpID0+ICh7XG4gICAgICBsYWJlbDogYWN0aW9uLFxuICAgICAgdmFsdWU6IGluZGV4LFxuICAgIH0pKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrIHBhZGRlZFwiPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+Q29ubmVjdGlvbjogPC9sYWJlbD5cbiAgICAgICAgPE51Y2xpZGVEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgbWVudUl0ZW1zPXtjb25uZWN0aW9uSXRlbXN9XG4gICAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5faGFuZGxlQ29ubmVjdGlvbkRyb3Bkb3duQ2hhbmdlfVxuICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuY29ubmVjdGlvbnNEcm9wZG93bkluZGV4fVxuICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5UeXBlOiA8L2xhYmVsPlxuICAgICAgICA8TnVjbGlkZURyb3Bkb3duXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICBtZW51SXRlbXM9e2RlYnVnZ2luZ1R5cGVJdGVtc31cbiAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVEZWJ1Z2dpbmdUeXBlRHJvcGRvd25DaGFuZ2V9XG4gICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5kZWJ1Z2dpbmdUeXBlRHJvcGRvd25JbmRleH1cbiAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAvPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+QWN0aW9uOiA8L2xhYmVsPlxuICAgICAgICA8TnVjbGlkZURyb3Bkb3duXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICBtZW51SXRlbXM9e3Byb3ZpZGVyQWN0aW9uc31cbiAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVQcm92aWRlckFjdGlvbnNEcm9wZG93bkNoYW5nZX1cbiAgICAgICAgICBzZWxlY3RlZEluZGV4PXt0aGlzLnN0YXRlLnByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXh9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICB7dGhpcy5zdGF0ZS5lbGVtZW50fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICAvLyBSZXNldCBjb25uZWN0aW9ucyBkcm9wZG93biB3aXRoIGxhdGVzdCBjb25uZWN0aW9ucy5cbiAgX3Jlc2V0Q29ubmVjdGlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgY29ubmVjdGlvbnMgPSB0aGlzLnByb3BzLnN0b3JlLmdldENvbm5lY3Rpb25zKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb25uZWN0aW9ucyxcbiAgICAgIGNvbm5lY3Rpb25zRHJvcGRvd25JbmRleDogMCxcbiAgICB9KTtcbiAgICAvLyBDb250aW51ZSBmaWxsIGRlYnVnZ2luZyB0eXBlcyBkcm9wZG93biBmb3IgbmV3IGNvbm5lY3Rpb24uXG4gICAgdGhpcy5fcmVzZXRBdmFpbGFibGVEZWJ1Z2dpbmdUeXBlcyhjb25uZWN0aW9uc1swXSk7XG4gIH1cblxuICBfaGFuZGxlQ29ubmVjdGlvbkRyb3Bkb3duQ2hhbmdlKG5ld0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNvbm5lY3Rpb25zRHJvcGRvd25JbmRleDogbmV3SW5kZXgsXG4gICAgfSk7XG4gICAgY29uc3Qgc2VsZWN0ZWRDb25uZWN0aW9uID0gdGhpcy5zdGF0ZS5jb25uZWN0aW9uc1tuZXdJbmRleF07XG4gICAgdGhpcy5fcmVzZXRBdmFpbGFibGVEZWJ1Z2dpbmdUeXBlcyhzZWxlY3RlZENvbm5lY3Rpb24pO1xuICB9XG5cbiAgLy8gUmVzZXQgZGVidWdnaW5nIHR5cGVzIGRyb3Bkb3duIGZvciBpbnB1dCBjb25uZWN0aW9uLlxuICBfcmVzZXRBdmFpbGFibGVEZWJ1Z2dpbmdUeXBlcyhjb25uZWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGVhclByZXZpb3VzUHJvdmlkZXJzKCk7XG4gICAgY29uc3QgYXZhaWxhYmxlUHJvdmlkZXJzID1cbiAgICAgIHRoaXMucHJvcHMuc3RvcmUuZ2V0TGF1bmNoQXR0YWNoUHJvdmlkZXJzRm9yQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGF2YWlsYWJsZVByb3ZpZGVycyxcbiAgICAgIGRlYnVnZ2luZ1R5cGVEcm9wZG93bkluZGV4OiAwLFxuICAgIH0pO1xuICAgIC8vIENvbnRpbnVlIGZpbGwgYWN0aW9ucyBkcm9wZG93biBmb3IgbmV3IHByb3ZpZGVyLlxuICAgIHRoaXMuX3Jlc2V0UHJvdmlkZXJBY3Rpb25zKGF2YWlsYWJsZVByb3ZpZGVyc1swXSk7XG4gIH1cblxuICBfY2xlYXJQcmV2aW91c1Byb3ZpZGVycygpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIHRoaXMuc3RhdGUuYXZhaWxhYmxlUHJvdmlkZXJzKSB7XG4gICAgICBwcm92aWRlci5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZURlYnVnZ2luZ1R5cGVEcm9wZG93bkNoYW5nZShuZXdJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkZWJ1Z2dpbmdUeXBlRHJvcGRvd25JbmRleDogbmV3SW5kZXgsXG4gICAgfSk7XG4gICAgdGhpcy5fcmVzZXRQcm92aWRlckFjdGlvbnModGhpcy5zdGF0ZS5hdmFpbGFibGVQcm92aWRlcnNbbmV3SW5kZXhdKTtcbiAgfVxuXG4gIC8vIFJlc2V0IGFjdGlvbnMgZHJvcGRvd24gZm9yIGlucHV0IERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIuXG4gIF9yZXNldFByb3ZpZGVyQWN0aW9ucyhwcm92aWRlcjogRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcik6IHZvaWQge1xuICAgIGNvbnN0IHByb3ZpZGVyQWN0aW9ucyA9IHByb3ZpZGVyLmdldEFjdGlvbnMoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb3ZpZGVyQWN0aW9ucyxcbiAgICAgIHByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXg6IDAsXG4gICAgfSk7XG4gICAgdGhpcy5fcmVzZXRFbGVtZW50KHByb3ZpZGVyLCBwcm92aWRlckFjdGlvbnNbMF0pO1xuICB9XG5cbiAgX2hhbmRsZVByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duQ2hhbmdlKG5ld0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb3ZpZGVyQWN0aW9uc0Ryb3Bkb3duSW5kZXg6IG5ld0luZGV4LFxuICAgIH0pO1xuICAgIGNvbnN0IHNlbGVjdGVkUHJvdmlkZXJJbmRleCA9IHRoaXMuc3RhdGUuZGVidWdnaW5nVHlwZURyb3Bkb3duSW5kZXg7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLnN0YXRlLmF2YWlsYWJsZVByb3ZpZGVyc1tzZWxlY3RlZFByb3ZpZGVySW5kZXhdO1xuICAgIGNvbnN0IHNlbGVjdGVkQWN0aW9uID0gdGhpcy5zdGF0ZS5wcm92aWRlckFjdGlvbnNbbmV3SW5kZXhdO1xuICAgIC8vIENvbnRpbnVlIHVzZSBuZXcgVUkgZWxlbWVudCBmb3IgbmV3IHByb3ZpZGVyICsgYWN0aW9uLlxuICAgIHRoaXMuX3Jlc2V0RWxlbWVudChwcm92aWRlciwgc2VsZWN0ZWRBY3Rpb24pO1xuICB9XG5cbiAgLy8gRGlzcGxheSBuZXcgY3VzdG9taXplZCBlbGVtZW50IFVJIGZyb20gaW5wdXQgcHJvdmlkZXIgYW5kIGFjdGlvbi5cbiAgX3Jlc2V0RWxlbWVudChwcm92aWRlcjogRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlciwgYWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgZWxlbWVudCA9IHByb3ZpZGVyLmdldENvbXBvbmVudChhY3Rpb24pO1xuICAgIC8vIEFzc2lnbiBhbiB1bmlxdWUga2V5IHRvIGVsZW1lbnQgc28gdGhhdCByZWFjdCB0cmVhdHMgaXQgYXMgYSBuZXcgZWxlbWVudC5cbiAgICBpZiAoZWxlbWVudCAhPSBudWxsKSB7XG4gICAgICBlbGVtZW50ID0gUmVhY3QuY2xvbmVFbGVtZW50KGVsZW1lbnQsIHtrZXk6IHByb3ZpZGVyLmdldFVuaXF1ZUtleSgpfSk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZWxlbWVudCxcbiAgICB9KTtcbiAgfVxufVxuIl19