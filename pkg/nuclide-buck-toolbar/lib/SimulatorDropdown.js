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
var NuclideDropdown = require('../../nuclide-ui-dropdown');

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
      onSelectedSimulatorChange: function onSelectedSimulatorChange(simulator) {}
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
//# sourceMappingURL=data:application/json;base64,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MEJBQUMsUUFBZ0IsRUFBRTtBQUNqQyxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwRCxVQUFJLFlBQVksRUFBRTtBQUNoQixZQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUMxRDtBQUNELFVBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxhQUFhLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztLQUMxQzs7O1NBbkVHLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXNFL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJTaW11bGF0b3JEcm9wZG93bi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IElvc1NpbXVsYXRvciA9IHJlcXVpcmUoJy4vSW9zU2ltdWxhdG9yJyk7XG5jb25zdCBOdWNsaWRlRHJvcGRvd24gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpLWRyb3Bkb3duJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuaW1wb3J0IHR5cGUge0RldmljZX0gZnJvbSAnLi9Jb3NTaW11bGF0b3InO1xuXG5jbGFzcyBTaW11bGF0b3JEcm9wZG93biBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBvblNlbGVjdGVkU2ltdWxhdG9yQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgdGl0bGU6ICdDaG9vc2UgYSBkZXZpY2UnLFxuICAgIG9uU2VsZWN0ZWRTaW11bGF0b3JDaGFuZ2U6IChzaW11bGF0b3I6IHN0cmluZykgPT4ge30sXG4gIH07XG5cbiAgc3RhdGU6IHtcbiAgICBtZW51SXRlbXM6IEFycmF5PHtsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nfT47XG4gICAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiB7W2tleTogc3RyaW5nXTogbWl4ZWR9KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBtZW51SXRlbXM6IFtdLFxuICAgICAgc2VsZWN0ZWRJbmRleDogMCxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLl9idWlsZE1lbnVJdGVtcyA9IHRoaXMuX2J1aWxkTWVudUl0ZW1zLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNlbGVjdGlvbiA9IHRoaXMuX2hhbmRsZVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgSW9zU2ltdWxhdG9yLmdldERldmljZXMoKS50aGVuKHRoaXMuX2J1aWxkTWVudUl0ZW1zKTtcbiAgfVxuXG4gIF9idWlsZE1lbnVJdGVtcyhkZXZpY2VzOiBBcnJheTxEZXZpY2U+KTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IElvc1NpbXVsYXRvci5zZWxlY3REZXZpY2UoZGV2aWNlcyk7XG4gICAgY29uc3QgbWVudUl0ZW1zID0gZGV2aWNlcy5tYXAoZGV2aWNlID0+ICh7XG4gICAgICBsYWJlbDogYCR7ZGV2aWNlLm5hbWV9ICgke2RldmljZS5vc30pYCxcbiAgICAgIHZhbHVlOiBkZXZpY2UudWRpZCxcbiAgICB9KSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bWVudUl0ZW1zLCBzZWxlY3RlZEluZGV4fSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBpZiAodGhpcy5zdGF0ZS5tZW51SXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gPHNwYW4gLz47XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxOdWNsaWRlRHJvcGRvd25cbiAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleH1cbiAgICAgICAgbWVudUl0ZW1zPXt0aGlzLnN0YXRlLm1lbnVJdGVtc31cbiAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5faGFuZGxlU2VsZWN0aW9ufVxuICAgICAgICBzaXplPVwic21cIlxuICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVTZWxlY3Rpb24obmV3SW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IHRoaXMuc3RhdGUubWVudUl0ZW1zW25ld0luZGV4XTtcbiAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XG4gICAgICB0aGlzLnByb3BzLm9uU2VsZWN0ZWRTaW11bGF0b3JDaGFuZ2Uoc2VsZWN0ZWRJdGVtLnZhbHVlKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleDogbmV3SW5kZXh9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvckRyb3Bkb3duO1xuIl19