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