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

var _require = require('../../nuclide-ui/lib/Dropdown');

var Dropdown = _require.Dropdown;

var _require2 = require('react-for-atom');

var React = _require2.React;
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

      return React.createElement(Dropdown, {
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
//# sourceMappingURL=data:application/json;base64,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ZSwwQkFBQyxRQUFnQixFQUFFO0FBQ2pDLFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BELFVBQUksWUFBWSxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQzFEO0FBQ0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQzFDOzs7U0FuRUcsaUJBQWlCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBc0UvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IlNpbXVsYXRvckRyb3Bkb3duLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgSW9zU2ltdWxhdG9yID0gcmVxdWlyZSgnLi9Jb3NTaW11bGF0b3InKTtcbmNvbnN0IHtEcm9wZG93bn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ecm9wZG93bicpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmltcG9ydCB0eXBlIHtEZXZpY2V9IGZyb20gJy4vSW9zU2ltdWxhdG9yJztcblxuY2xhc3MgU2ltdWxhdG9yRHJvcGRvd24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgb25TZWxlY3RlZFNpbXVsYXRvckNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogJycsXG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIHRpdGxlOiAnQ2hvb3NlIGEgZGV2aWNlJyxcbiAgICBvblNlbGVjdGVkU2ltdWxhdG9yQ2hhbmdlOiAoc2ltdWxhdG9yOiBzdHJpbmcpID0+IHt9LFxuICB9O1xuXG4gIHN0YXRlOiB7XG4gICAgbWVudUl0ZW1zOiBBcnJheTx7bGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZ30+O1xuICAgIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBtZW51SXRlbXM6IFtdLFxuICAgICAgc2VsZWN0ZWRJbmRleDogMCxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLl9idWlsZE1lbnVJdGVtcyA9IHRoaXMuX2J1aWxkTWVudUl0ZW1zLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNlbGVjdGlvbiA9IHRoaXMuX2hhbmRsZVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgSW9zU2ltdWxhdG9yLmdldERldmljZXMoKS50aGVuKHRoaXMuX2J1aWxkTWVudUl0ZW1zKTtcbiAgfVxuXG4gIF9idWlsZE1lbnVJdGVtcyhkZXZpY2VzOiBBcnJheTxEZXZpY2U+KTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IElvc1NpbXVsYXRvci5zZWxlY3REZXZpY2UoZGV2aWNlcyk7XG4gICAgY29uc3QgbWVudUl0ZW1zID0gZGV2aWNlcy5tYXAoZGV2aWNlID0+ICh7XG4gICAgICBsYWJlbDogYCR7ZGV2aWNlLm5hbWV9ICgke2RldmljZS5vc30pYCxcbiAgICAgIHZhbHVlOiBkZXZpY2UudWRpZCxcbiAgICB9KSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bWVudUl0ZW1zLCBzZWxlY3RlZEluZGV4fSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgaWYgKHRoaXMuc3RhdGUubWVudUl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDxzcGFuIC8+O1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8RHJvcGRvd25cbiAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleH1cbiAgICAgICAgbWVudUl0ZW1zPXt0aGlzLnN0YXRlLm1lbnVJdGVtc31cbiAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5faGFuZGxlU2VsZWN0aW9ufVxuICAgICAgICBzaXplPVwic21cIlxuICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVTZWxlY3Rpb24obmV3SW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IHRoaXMuc3RhdGUubWVudUl0ZW1zW25ld0luZGV4XTtcbiAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XG4gICAgICB0aGlzLnByb3BzLm9uU2VsZWN0ZWRTaW11bGF0b3JDaGFuZ2Uoc2VsZWN0ZWRJdGVtLnZhbHVlKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleDogbmV3SW5kZXh9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvckRyb3Bkb3duO1xuIl19