Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _reactForAtom = require('react-for-atom');

var ConsoleHeader = (function (_React$Component) {
  _inherits(ConsoleHeader, _React$Component);

  function ConsoleHeader(props) {
    _classCallCheck(this, ConsoleHeader);

    _get(Object.getPrototypeOf(ConsoleHeader.prototype), 'constructor', this).call(this, props);
    this._handleClearButtonClick = this._handleClearButtonClick.bind(this);
  }

  _createClass(ConsoleHeader, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-output-header padded' },
        _reactForAtom.React.createElement(
          'button',
          {
            className: 'btn btn-sm icon inline-block btn-secondary pull-right',
            onClick: this._handleClearButtonClick },
          'Clear'
        )
      );
    }
  }, {
    key: '_handleClearButtonClick',
    value: function _handleClearButtonClick(event) {
      this.props.clear();
    }
  }]);

  return ConsoleHeader;
})(_reactForAtom.React.Component);

exports['default'] = ConsoleHeader;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbnNvbGVIZWFkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBV29CLGdCQUFnQjs7SUFNZixhQUFhO1lBQWIsYUFBYTs7QUFHckIsV0FIUSxhQUFhLENBR3BCLEtBQVksRUFBRTswQkFIUCxhQUFhOztBQUk5QiwrQkFKaUIsYUFBYSw2Q0FJeEIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMvRTs7ZUFOa0IsYUFBYTs7V0FRMUIsa0JBQWtCO0FBQ3RCLGFBQ0U7O1VBQUssU0FBUyxFQUFDLDhCQUE4QjtRQUMzQzs7O0FBQ0UscUJBQVMsRUFBQyx1REFBdUQ7QUFDakUsbUJBQU8sRUFBRSxJQUFJLENBQUMsdUJBQXVCLEFBQUM7O1NBRS9CO09BQ0wsQ0FDTjtLQUNIOzs7V0FHc0IsaUNBQUMsS0FBMEIsRUFBUTtBQUN4RCxVQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3BCOzs7U0F2QmtCLGFBQWE7R0FBUyxvQkFBTSxTQUFTOztxQkFBckMsYUFBYSIsImZpbGUiOiJDb25zb2xlSGVhZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjbGVhcjogKCkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnNvbGVIZWFkZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDbGVhckJ1dHRvbkNsaWNrID0gdGhpcy5faGFuZGxlQ2xlYXJCdXR0b25DbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtb3V0cHV0LWhlYWRlciBwYWRkZWRcIj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tc20gaWNvbiBpbmxpbmUtYmxvY2sgYnRuLXNlY29uZGFyeSBwdWxsLXJpZ2h0XCJcbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGVhckJ1dHRvbkNsaWNrfT5cbiAgICAgICAgICBDbGVhclxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuXG4gIF9oYW5kbGVDbGVhckJ1dHRvbkNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5jbGVhcigpO1xuICB9XG5cbn1cbiJdfQ==