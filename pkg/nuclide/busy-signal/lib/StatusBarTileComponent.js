Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var SPINNER = '';

/* eslint-disable react/prop-types */

var StatusBarTileComponent = (function (_React$Component) {
  _inherits(StatusBarTileComponent, _React$Component);

  function StatusBarTileComponent(props) {
    _classCallCheck(this, StatusBarTileComponent);

    _get(Object.getPrototypeOf(StatusBarTileComponent.prototype), 'constructor', this).call(this, props);
  }

  _createClass(StatusBarTileComponent, [{
    key: 'render',
    value: function render() {
      var classes = ['nuclide-busy-signal-status-bar'];
      if (this.props.busy) {
        classes.push('nuclide-busy-signal-status-bar-busy');
      } else {
        classes.push('nuclide-busy-signal-status-bar-idle');
      }
      return _reactForAtom2['default'].createElement(
        'div',
        { className: classes.join(' ') },
        SPINNER
      );
    }
  }]);

  return StatusBarTileComponent;
})(_reactForAtom2['default'].Component);

exports.StatusBarTileComponent = StatusBarTileComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0YXR1c0JhclRpbGVDb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXa0IsZ0JBQWdCOzs7O0FBTWxDLElBQU0sT0FBTyxHQUFHLEdBQVEsQ0FBQzs7OztJQUdaLHNCQUFzQjtZQUF0QixzQkFBc0I7O0FBR3RCLFdBSEEsc0JBQXNCLENBR3JCLEtBQVksRUFBRTswQkFIZixzQkFBc0I7O0FBSS9CLCtCQUpTLHNCQUFzQiw2Q0FJekIsS0FBSyxFQUFFO0dBQ2Q7O2VBTFUsc0JBQXNCOztXQU8zQixrQkFBUztBQUNiLFVBQU0sT0FBTyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUNuRCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ25CLGVBQU8sQ0FBQyxJQUFJLENBQUMscUNBQXFDLENBQUMsQ0FBQztPQUNyRCxNQUFNO0FBQ0wsZUFBTyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO09BQ3JEO0FBQ0QsYUFDRTs7VUFBSyxTQUFTLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQUFBQztRQUFFLE9BQU87T0FBTyxDQUNsRDtLQUNIOzs7U0FqQlUsc0JBQXNCO0dBQVMsMEJBQU0sU0FBUyIsImZpbGUiOiJTdGF0dXNCYXJUaWxlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgYnVzeTogYm9vbGVhbixcbn1cblxuY29uc3QgU1BJTk5FUiA9ICdcXHVGMDg3JztcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGNsYXNzIFN0YXR1c0JhclRpbGVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IHZvaWQge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBbJ251Y2xpZGUtYnVzeS1zaWduYWwtc3RhdHVzLWJhciddO1xuICAgIGlmICh0aGlzLnByb3BzLmJ1c3kpIHtcbiAgICAgIGNsYXNzZXMucHVzaCgnbnVjbGlkZS1idXN5LXNpZ25hbC1zdGF0dXMtYmFyLWJ1c3knKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xhc3Nlcy5wdXNoKCdudWNsaWRlLWJ1c3ktc2lnbmFsLXN0YXR1cy1iYXItaWRsZScpO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXMuam9pbignICcpfT57U1BJTk5FUn08L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=