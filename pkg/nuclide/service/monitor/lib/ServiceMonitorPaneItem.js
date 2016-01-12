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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _ServiceMonitor = require('./ServiceMonitor');

var _ServiceMonitor2 = _interopRequireDefault(_ServiceMonitor);

var _uiPaneItem = require('../../../ui/pane-item');

var _uiPaneItem2 = _interopRequireDefault(_uiPaneItem);

var _client = require('../../../client');

var ServiceMonitorPaneItem = (function (_NuclideCustomPaneItem) {
  _inherits(ServiceMonitorPaneItem, _NuclideCustomPaneItem);

  function ServiceMonitorPaneItem() {
    _classCallCheck(this, ServiceMonitorPaneItem);

    _get(Object.getPrototypeOf(ServiceMonitorPaneItem.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ServiceMonitorPaneItem, [{
    key: '__renderPaneItem',
    value: function __renderPaneItem(options) {
      return _reactForAtom2['default'].createElement(_ServiceMonitor2['default'], {
        serviceLogger: (0, _client.getServiceLogger)()
      });
    }
  }]);

  return ServiceMonitorPaneItem;
})(_uiPaneItem2['default']);

module.exports = document.registerElement('nuclide-service-monitor', {
  prototype: ServiceMonitorPaneItem.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2VNb25pdG9yUGFuZUl0ZW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWFrQixnQkFBZ0I7Ozs7OEJBQ1Asa0JBQWtCOzs7OzBCQUNYLHVCQUF1Qjs7OztzQkFDMUIsaUJBQWlCOztJQUUxQyxzQkFBc0I7WUFBdEIsc0JBQXNCOztXQUF0QixzQkFBc0I7MEJBQXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7O2VBQXRCLHNCQUFzQjs7V0FFViwwQkFBQyxPQUFxQyxFQUFFO0FBQ3RELGFBQ0U7QUFDRSxxQkFBYSxFQUFFLCtCQUFrQixBQUFDO1FBQ2xDLENBQ0Y7S0FDSDs7O1NBUkcsc0JBQXNCOzs7QUFXNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLHlCQUF5QixFQUFFO0FBQ25FLFdBQVMsRUFBRSxzQkFBc0IsQ0FBQyxTQUFTO0NBQzVDLENBQUMsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlTW9uaXRvclBhbmVJdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVDdXN0b21QYW5lSXRlbU9wdGlvbnN9IGZyb20gJy4uLy4uLy4uL3VpL3BhbmUtaXRlbS9saWIvdHlwZXMnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFNlcnZpY2VNb25pdG9yIGZyb20gJy4vU2VydmljZU1vbml0b3InO1xuaW1wb3J0IE51Y2xpZGVDdXN0b21QYW5lSXRlbSBmcm9tICcuLi8uLi8uLi91aS9wYW5lLWl0ZW0nO1xuaW1wb3J0IHtnZXRTZXJ2aWNlTG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9jbGllbnQnO1xuXG5jbGFzcyBTZXJ2aWNlTW9uaXRvclBhbmVJdGVtIGV4dGVuZHMgTnVjbGlkZUN1c3RvbVBhbmVJdGVtIHtcblxuICBfX3JlbmRlclBhbmVJdGVtKG9wdGlvbnM6IE51Y2xpZGVDdXN0b21QYW5lSXRlbU9wdGlvbnMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFNlcnZpY2VNb25pdG9yXG4gICAgICAgIHNlcnZpY2VMb2dnZXI9e2dldFNlcnZpY2VMb2dnZXIoKX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnbnVjbGlkZS1zZXJ2aWNlLW1vbml0b3InLCB7XG4gIHByb3RvdHlwZTogU2VydmljZU1vbml0b3JQYW5lSXRlbS5wcm90b3R5cGUsXG59KTtcbiJdfQ==