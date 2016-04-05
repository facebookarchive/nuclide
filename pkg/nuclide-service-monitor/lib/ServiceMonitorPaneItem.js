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

var _nuclideUiLibCustomPaneItem = require('../../nuclide-ui/lib/CustomPaneItem');

var _nuclideClient = require('../../nuclide-client');

var ServiceMonitorPaneItem = (function (_CustomPaneItem) {
  _inherits(ServiceMonitorPaneItem, _CustomPaneItem);

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
})(_nuclideUiLibCustomPaneItem.CustomPaneItem);

module.exports = document.registerElement('nuclide-service-monitor', {
  prototype: ServiceMonitorPaneItem.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2VNb25pdG9yUGFuZUl0ZW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWVvQixnQkFBZ0I7OzhCQUNULGtCQUFrQjs7OzswQ0FDaEIscUNBQXFDOzs2QkFDbkMsc0JBQXNCOztJQUUvQyxzQkFBc0I7WUFBdEIsc0JBQXNCOztXQUF0QixzQkFBc0I7MEJBQXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7O2VBQXRCLHNCQUFzQjs7V0FFViwwQkFBQyxPQUE4QixFQUFFO0FBQy9DLGFBQ0U7QUFDRSxxQkFBYSxFQUFFLHNDQUFrQixBQUFDO1FBQ2xDLENBQ0Y7S0FDSDs7O1NBUkcsc0JBQXNCOzs7QUFXNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLHlCQUF5QixFQUFFO0FBQ25FLFdBQVMsRUFBRSxzQkFBc0IsQ0FBQyxTQUFTO0NBQzVDLENBQUMsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlTW9uaXRvclBhbmVJdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBDdXN0b21QYW5lSXRlbU9wdGlvbnMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL3R5cGVzJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFNlcnZpY2VNb25pdG9yIGZyb20gJy4vU2VydmljZU1vbml0b3InO1xuaW1wb3J0IHtDdXN0b21QYW5lSXRlbX0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQ3VzdG9tUGFuZUl0ZW0nO1xuaW1wb3J0IHtnZXRTZXJ2aWNlTG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5cbmNsYXNzIFNlcnZpY2VNb25pdG9yUGFuZUl0ZW0gZXh0ZW5kcyBDdXN0b21QYW5lSXRlbSB7XG5cbiAgX19yZW5kZXJQYW5lSXRlbShvcHRpb25zOiBDdXN0b21QYW5lSXRlbU9wdGlvbnMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFNlcnZpY2VNb25pdG9yXG4gICAgICAgIHNlcnZpY2VMb2dnZXI9e2dldFNlcnZpY2VMb2dnZXIoKX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnbnVjbGlkZS1zZXJ2aWNlLW1vbml0b3InLCB7XG4gIHByb3RvdHlwZTogU2VydmljZU1vbml0b3JQYW5lSXRlbS5wcm90b3R5cGUsXG59KTtcbiJdfQ==