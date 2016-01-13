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

/* eslint-disable react/prop-types */

var DiffCountComponent = (function (_React$Component) {
  _inherits(DiffCountComponent, _React$Component);

  function DiffCountComponent(props) {
    _classCallCheck(this, DiffCountComponent);

    _get(Object.getPrototypeOf(DiffCountComponent.prototype), 'constructor', this).call(this, props);
  }

  _createClass(DiffCountComponent, [{
    key: 'render',
    value: function render() {
      var count = this.props.count;

      if (count === 0) {
        return null;
      }
      return _reactForAtom2['default'].createElement(
        'span',
        null,
        count > 99 ? '99+' : count
      );
    }
  }]);

  return DiffCountComponent;
})(_reactForAtom2['default'].Component);

module.exports = DiffCountComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZDb3VudENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBV2tCLGdCQUFnQjs7Ozs7O0lBTzVCLGtCQUFrQjtZQUFsQixrQkFBa0I7O0FBRVgsV0FGUCxrQkFBa0IsQ0FFVixLQUFZLEVBQUU7MEJBRnRCLGtCQUFrQjs7QUFHcEIsK0JBSEUsa0JBQWtCLDZDQUdkLEtBQUssRUFBRTtHQUNkOztlQUpHLGtCQUFrQjs7V0FNaEIsa0JBQWtCO1VBQ2YsS0FBSyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQW5CLEtBQUs7O0FBQ1osVUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELGFBQ0U7OztRQUNHLEtBQUssR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUs7T0FDdEIsQ0FDUDtLQUNIOzs7U0FoQkcsa0JBQWtCO0dBQVMsMEJBQU0sU0FBUzs7QUFtQmhELE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRGlmZkNvdW50Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgY291bnQ6IG51bWJlcjtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmNsYXNzIERpZmZDb3VudENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtjb3VudH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8c3Bhbj5cbiAgICAgICAge2NvdW50ID4gOTkgPyAnOTkrJyA6IGNvdW50fVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmQ291bnRDb21wb25lbnQ7XG4iXX0=