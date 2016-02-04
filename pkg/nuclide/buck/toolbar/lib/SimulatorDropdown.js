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

var IosSimulator = require('./IosSimulator');
var NuclideDropdown = require('../../../ui/dropdown');

var _require = require('react-for-atom');

var React = _require.React;
var PropTypes = React.PropTypes;

var SimulatorDropdown = (function (_React$Component) {
  _inherits(SimulatorDropdown, _React$Component);

  _createClass(SimulatorDropdown, null, [{
    key: 'propTypes',
    value: {
      className: PropTypes.string.isRequired,
      disabled: PropTypes.bool.isRequired,
      title: PropTypes.string.isRequired,
      onSelectedSimulatorChange: PropTypes.func.isRequired
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      className: '',
      disabled: false,
      title: 'Choose a device',
      onSelectedSimulatorChange: function onSelectedSimulatorChange() {}
    },
    enumerable: true
  }]);

  function SimulatorDropdown(props) {
    _classCallCheck(this, SimulatorDropdown);

    _get(Object.getPrototypeOf(SimulatorDropdown.prototype), 'constructor', this).call(this, props);
    this.state = {
      menuItems: [],
      selectedIndex: 0
    };
    this._buildMenuItems = this._buildMenuItems.bind(this);
    this._handleSelection = this._handleSelection.bind(this);
  }

  _createClass(SimulatorDropdown, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      IosSimulator.getDevices().then(this._buildMenuItems);
    }
  }, {
    key: '_buildMenuItems',
    value: function _buildMenuItems(devices) {
      var selectedIndex = IosSimulator.selectDevice(devices);
      var menuItems = devices.map(function (device) {
        return {
          label: device.name + ' (' + device.os + ')',
          value: device.udid
        };
      });
      this.setState({ menuItems: menuItems, selectedIndex: selectedIndex });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.menuItems.length === 0) {
        return React.createElement('span', null);
      }

      return React.createElement(NuclideDropdown, {
        className: this.props.className,
        disabled: this.props.disabled,
        selectedIndex: this.state.selectedIndex,
        menuItems: this.state.menuItems,
        onSelectedChange: this._handleSelection,
        size: 'sm',
        title: this.props.title
      });
    }
  }, {
    key: '_handleSelection',
    value: function _handleSelection(newIndex) {
      var selectedItem = this.state.menuItems[newIndex];
      if (selectedItem) {
        this.props.onSelectedSimulatorChange(selectedItem.value);
      }
      this.setState({ selectedIndex: newIndex });
    }
  }]);

  return SimulatorDropdown;
})(React.Component);

module.exports = SimulatorDropdown;
//# sourceMappingURL=data:application/json;base64,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VUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEQsVUFBSSxZQUFZLEVBQUU7QUFDaEIsWUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDMUQ7QUFDRCxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsYUFBYSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDMUM7OztTQTlERyxpQkFBaUI7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFpRS9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiU2ltdWxhdG9yRHJvcGRvd24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBJb3NTaW11bGF0b3IgPSByZXF1aXJlKCcuL0lvc1NpbXVsYXRvcicpO1xuY29uc3QgTnVjbGlkZURyb3Bkb3duID0gcmVxdWlyZSgnLi4vLi4vLi4vdWkvZHJvcGRvd24nKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5pbXBvcnQgdHlwZSB7RGV2aWNlfSBmcm9tICcuL0lvc1NpbXVsYXRvcic7XG5cbmNsYXNzIFNpbXVsYXRvckRyb3Bkb3duIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG9uU2VsZWN0ZWRTaW11bGF0b3JDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICB0aXRsZTogJ0Nob29zZSBhIGRldmljZScsXG4gICAgb25TZWxlY3RlZFNpbXVsYXRvckNoYW5nZTogKCkgPT4ge30sXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IHtba2V5OiBzdHJpbmddOiBtaXhlZH0pIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1lbnVJdGVtczogW10sXG4gICAgICBzZWxlY3RlZEluZGV4OiAwLFxuICAgIH07XG4gICAgdGhpcy5fYnVpbGRNZW51SXRlbXMgPSB0aGlzLl9idWlsZE1lbnVJdGVtcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZVNlbGVjdGlvbiA9IHRoaXMuX2hhbmRsZVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgSW9zU2ltdWxhdG9yLmdldERldmljZXMoKS50aGVuKHRoaXMuX2J1aWxkTWVudUl0ZW1zKTtcbiAgfVxuXG4gIF9idWlsZE1lbnVJdGVtcyhkZXZpY2VzOiBBcnJheTxEZXZpY2U+KSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IElvc1NpbXVsYXRvci5zZWxlY3REZXZpY2UoZGV2aWNlcyk7XG4gICAgY29uc3QgbWVudUl0ZW1zID0gZGV2aWNlcy5tYXAoZGV2aWNlID0+ICh7XG4gICAgICBsYWJlbDogYCR7ZGV2aWNlLm5hbWV9ICgke2RldmljZS5vc30pYCxcbiAgICAgIHZhbHVlOiBkZXZpY2UudWRpZCxcbiAgICB9KSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bWVudUl0ZW1zLCBzZWxlY3RlZEluZGV4fSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBpZiAodGhpcy5zdGF0ZS5tZW51SXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gPHNwYW4gLz47XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxOdWNsaWRlRHJvcGRvd25cbiAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleH1cbiAgICAgICAgbWVudUl0ZW1zPXt0aGlzLnN0YXRlLm1lbnVJdGVtc31cbiAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5faGFuZGxlU2VsZWN0aW9ufVxuICAgICAgICBzaXplPVwic21cIlxuICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVTZWxlY3Rpb24obmV3SW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IHRoaXMuc3RhdGUubWVudUl0ZW1zW25ld0luZGV4XTtcbiAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XG4gICAgICB0aGlzLnByb3BzLm9uU2VsZWN0ZWRTaW11bGF0b3JDaGFuZ2Uoc2VsZWN0ZWRJdGVtLnZhbHVlKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleDogbmV3SW5kZXh9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvckRyb3Bkb3duO1xuIl19