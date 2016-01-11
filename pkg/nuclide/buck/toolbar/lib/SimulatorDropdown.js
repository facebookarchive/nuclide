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
var React = require('react-for-atom');

var PropTypes = React.PropTypes;

var SimulatorDropdown = (function (_React$Component) {
  _inherits(SimulatorDropdown, _React$Component);

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

SimulatorDropdown.propTypes = {
  className: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onSelectedSimulatorChange: PropTypes.func.isRequired
};

SimulatorDropdown.defaultProps = {
  className: '',
  disabled: false,
  title: 'Choose a device',
  onSelectedSimulatorChange: function onSelectedSimulatorChange() {}
};

module.exports = SimulatorDropdown;
//# sourceMappingURL=data:application/json;base64,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TUFBTSxDQUFDLFVBQVU7QUFDdEMsVUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNuQyxPQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2xDLDJCQUF5QixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtDQUNyRCxDQUFDOztBQUVGLGlCQUFpQixDQUFDLFlBQVksR0FBRztBQUMvQixXQUFTLEVBQUUsRUFBRTtBQUNiLFVBQVEsRUFBRSxLQUFLO0FBQ2YsT0FBSyxFQUFFLGlCQUFpQjtBQUN4QiwyQkFBeUIsRUFBRSxxQ0FBTSxFQUFFO0NBQ3BDLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJTaW11bGF0b3JEcm9wZG93bi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IElvc1NpbXVsYXRvciA9IHJlcXVpcmUoJy4vSW9zU2ltdWxhdG9yJyk7XG5jb25zdCBOdWNsaWRlRHJvcGRvd24gPSByZXF1aXJlKCcuLi8uLi8uLi91aS9kcm9wZG93bicpO1xuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5pbXBvcnQgdHlwZSB7RGV2aWNlfSBmcm9tICcuL0lvc1NpbXVsYXRvcic7XG5cbmNsYXNzIFNpbXVsYXRvckRyb3Bkb3duIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczoge1trZXk6IHN0cmluZ106IG1peGVkfSkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbWVudUl0ZW1zOiBbXSxcbiAgICAgIHNlbGVjdGVkSW5kZXg6IDAsXG4gICAgfTtcbiAgICB0aGlzLl9idWlsZE1lbnVJdGVtcyA9IHRoaXMuX2J1aWxkTWVudUl0ZW1zLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlU2VsZWN0aW9uID0gdGhpcy5faGFuZGxlU2VsZWN0aW9uLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBJb3NTaW11bGF0b3IuZ2V0RGV2aWNlcygpLnRoZW4odGhpcy5fYnVpbGRNZW51SXRlbXMpO1xuICB9XG5cbiAgX2J1aWxkTWVudUl0ZW1zKGRldmljZXM6IEFycmF5PERldmljZT4pIHtcbiAgICBjb25zdCBzZWxlY3RlZEluZGV4ID0gSW9zU2ltdWxhdG9yLnNlbGVjdERldmljZShkZXZpY2VzKTtcbiAgICBjb25zdCBtZW51SXRlbXMgPSBkZXZpY2VzLm1hcChkZXZpY2UgPT4gKHtcbiAgICAgIGxhYmVsOiBgJHtkZXZpY2UubmFtZX0gKCR7ZGV2aWNlLm9zfSlgLFxuICAgICAgdmFsdWU6IGRldmljZS51ZGlkLFxuICAgIH0pKTtcbiAgICB0aGlzLnNldFN0YXRlKHttZW51SXRlbXMsIHNlbGVjdGVkSW5kZXh9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGlmICh0aGlzLnN0YXRlLm1lbnVJdGVtcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiA8c3BhbiAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPE51Y2xpZGVEcm9wZG93blxuICAgICAgICBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfVxuICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4fVxuICAgICAgICBtZW51SXRlbXM9e3RoaXMuc3RhdGUubWVudUl0ZW1zfVxuICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVTZWxlY3Rpb259XG4gICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLnRpdGxlfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVNlbGVjdGlvbihuZXdJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtID0gdGhpcy5zdGF0ZS5tZW51SXRlbXNbbmV3SW5kZXhdO1xuICAgIGlmIChzZWxlY3RlZEl0ZW0pIHtcbiAgICAgIHRoaXMucHJvcHMub25TZWxlY3RlZFNpbXVsYXRvckNoYW5nZShzZWxlY3RlZEl0ZW0udmFsdWUpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiBuZXdJbmRleH0pO1xuICB9XG59XG5cblNpbXVsYXRvckRyb3Bkb3duLnByb3BUeXBlcyA9IHtcbiAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBvblNlbGVjdGVkU2ltdWxhdG9yQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxufTtcblxuU2ltdWxhdG9yRHJvcGRvd24uZGVmYXVsdFByb3BzID0ge1xuICBjbGFzc05hbWU6ICcnLFxuICBkaXNhYmxlZDogZmFsc2UsXG4gIHRpdGxlOiAnQ2hvb3NlIGEgZGV2aWNlJyxcbiAgb25TZWxlY3RlZFNpbXVsYXRvckNoYW5nZTogKCkgPT4ge30sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvckRyb3Bkb3duO1xuIl19