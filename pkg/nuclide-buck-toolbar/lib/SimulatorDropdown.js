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

var _require = require('../../nuclide-ui/lib/NuclideDropdown');

var NuclideDropdown = _require.NuclideDropdown;

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
//# sourceMappingURL=data:application/json;base64,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RWUsMEJBQUMsUUFBZ0IsRUFBRTtBQUNqQyxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwRCxVQUFJLFlBQVksRUFBRTtBQUNoQixZQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUMxRDtBQUNELFVBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxhQUFhLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztLQUMxQzs7O1NBbkVHLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXNFL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJTaW11bGF0b3JEcm9wZG93bi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IElvc1NpbXVsYXRvciA9IHJlcXVpcmUoJy4vSW9zU2ltdWxhdG9yJyk7XG5jb25zdCB7TnVjbGlkZURyb3Bkb3dufSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL051Y2xpZGVEcm9wZG93bicpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmltcG9ydCB0eXBlIHtEZXZpY2V9IGZyb20gJy4vSW9zU2ltdWxhdG9yJztcblxuY2xhc3MgU2ltdWxhdG9yRHJvcGRvd24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgb25TZWxlY3RlZFNpbXVsYXRvckNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogJycsXG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIHRpdGxlOiAnQ2hvb3NlIGEgZGV2aWNlJyxcbiAgICBvblNlbGVjdGVkU2ltdWxhdG9yQ2hhbmdlOiAoc2ltdWxhdG9yOiBzdHJpbmcpID0+IHt9LFxuICB9O1xuXG4gIHN0YXRlOiB7XG4gICAgbWVudUl0ZW1zOiBBcnJheTx7bGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZ30+O1xuICAgIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczoge1trZXk6IHN0cmluZ106IG1peGVkfSkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbWVudUl0ZW1zOiBbXSxcbiAgICAgIHNlbGVjdGVkSW5kZXg6IDAsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fYnVpbGRNZW51SXRlbXMgPSB0aGlzLl9idWlsZE1lbnVJdGVtcy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVTZWxlY3Rpb24gPSB0aGlzLl9oYW5kbGVTZWxlY3Rpb24uYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIElvc1NpbXVsYXRvci5nZXREZXZpY2VzKCkudGhlbih0aGlzLl9idWlsZE1lbnVJdGVtcyk7XG4gIH1cblxuICBfYnVpbGRNZW51SXRlbXMoZGV2aWNlczogQXJyYXk8RGV2aWNlPik6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkSW5kZXggPSBJb3NTaW11bGF0b3Iuc2VsZWN0RGV2aWNlKGRldmljZXMpO1xuICAgIGNvbnN0IG1lbnVJdGVtcyA9IGRldmljZXMubWFwKGRldmljZSA9PiAoe1xuICAgICAgbGFiZWw6IGAke2RldmljZS5uYW1lfSAoJHtkZXZpY2Uub3N9KWAsXG4gICAgICB2YWx1ZTogZGV2aWNlLnVkaWQsXG4gICAgfSkpO1xuICAgIHRoaXMuc2V0U3RhdGUoe21lbnVJdGVtcywgc2VsZWN0ZWRJbmRleH0pO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgaWYgKHRoaXMuc3RhdGUubWVudUl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDxzcGFuIC8+O1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8TnVjbGlkZURyb3Bkb3duXG4gICAgICAgIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9XG4gICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICBzZWxlY3RlZEluZGV4PXt0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXh9XG4gICAgICAgIG1lbnVJdGVtcz17dGhpcy5zdGF0ZS5tZW51SXRlbXN9XG4gICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuX2hhbmRsZVNlbGVjdGlvbn1cbiAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgdGl0bGU9e3RoaXMucHJvcHMudGl0bGV9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlU2VsZWN0aW9uKG5ld0luZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCBzZWxlY3RlZEl0ZW0gPSB0aGlzLnN0YXRlLm1lbnVJdGVtc1tuZXdJbmRleF07XG4gICAgaWYgKHNlbGVjdGVkSXRlbSkge1xuICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdGVkU2ltdWxhdG9yQ2hhbmdlKHNlbGVjdGVkSXRlbS52YWx1ZSk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IG5ld0luZGV4fSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW11bGF0b3JEcm9wZG93bjtcbiJdfQ==