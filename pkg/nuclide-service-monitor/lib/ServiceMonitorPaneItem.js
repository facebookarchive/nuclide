var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _ServiceMonitor = require('./ServiceMonitor');

var _ServiceMonitor2 = _interopRequireDefault(_ServiceMonitor);

var _nuclideUiLibNuclideCustomPaneItem = require('../../nuclide-ui/lib/NuclideCustomPaneItem');

var _nuclideClient = require('../../nuclide-client');

var ServiceMonitorPaneItem = (function (_NuclideCustomPaneItem) {
  _inherits(ServiceMonitorPaneItem, _NuclideCustomPaneItem);

  function ServiceMonitorPaneItem() {
    _classCallCheck(this, ServiceMonitorPaneItem);

    _get(Object.getPrototypeOf(ServiceMonitorPaneItem.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ServiceMonitorPaneItem, [{
    key: '__renderPaneItem',
    value: function __renderPaneItem(options) {
      return _reactForAtom.React.createElement(_ServiceMonitor2['default'], {
        serviceLogger: (0, _nuclideClient.getServiceLogger)()
      });
    }
  }]);

  return ServiceMonitorPaneItem;
})(_nuclideUiLibNuclideCustomPaneItem.NuclideCustomPaneItem);

module.exports = document.registerElement('nuclide-service-monitor', {
  prototype: ServiceMonitorPaneItem.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2VNb25pdG9yUGFuZUl0ZW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWVvQixnQkFBZ0I7OzhCQUNULGtCQUFrQjs7OztpREFDVCw0Q0FBNEM7OzZCQUNqRCxzQkFBc0I7O0lBRS9DLHNCQUFzQjtZQUF0QixzQkFBc0I7O1dBQXRCLHNCQUFzQjswQkFBdEIsc0JBQXNCOzsrQkFBdEIsc0JBQXNCOzs7ZUFBdEIsc0JBQXNCOztXQUVWLDBCQUFDLE9BQXFDLEVBQUU7QUFDdEQsYUFDRTtBQUNFLHFCQUFhLEVBQUUsc0NBQWtCLEFBQUM7UUFDbEMsQ0FDRjtLQUNIOzs7U0FSRyxzQkFBc0I7OztBQVc1QixNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMseUJBQXlCLEVBQUU7QUFDbkUsV0FBUyxFQUFFLHNCQUFzQixDQUFDLFNBQVM7Q0FDNUMsQ0FBQyxDQUFDIiwiZmlsZSI6IlNlcnZpY2VNb25pdG9yUGFuZUl0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVDdXN0b21QYW5lSXRlbU9wdGlvbnMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL3R5cGVzJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFNlcnZpY2VNb25pdG9yIGZyb20gJy4vU2VydmljZU1vbml0b3InO1xuaW1wb3J0IHtOdWNsaWRlQ3VzdG9tUGFuZUl0ZW19IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL051Y2xpZGVDdXN0b21QYW5lSXRlbSc7XG5pbXBvcnQge2dldFNlcnZpY2VMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtY2xpZW50JztcblxuY2xhc3MgU2VydmljZU1vbml0b3JQYW5lSXRlbSBleHRlbmRzIE51Y2xpZGVDdXN0b21QYW5lSXRlbSB7XG5cbiAgX19yZW5kZXJQYW5lSXRlbShvcHRpb25zOiBOdWNsaWRlQ3VzdG9tUGFuZUl0ZW1PcHRpb25zKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxTZXJ2aWNlTW9uaXRvclxuICAgICAgICBzZXJ2aWNlTG9nZ2VyPXtnZXRTZXJ2aWNlTG9nZ2VyKCl9XG4gICAgICAvPlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ251Y2xpZGUtc2VydmljZS1tb25pdG9yJywge1xuICBwcm90b3R5cGU6IFNlcnZpY2VNb25pdG9yUGFuZUl0ZW0ucHJvdG90eXBlLFxufSk7XG4iXX0=