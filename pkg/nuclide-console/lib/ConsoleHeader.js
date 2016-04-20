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

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var ConsoleHeader = (function (_React$Component) {
  _inherits(ConsoleHeader, _React$Component);

  function ConsoleHeader(props) {
    _classCallCheck(this, ConsoleHeader);

    _get(Object.getPrototypeOf(ConsoleHeader.prototype), 'constructor', this).call(this, props);
    this._handleClearButtonClick = this._handleClearButtonClick.bind(this);
  }

  _createClass(ConsoleHeader, [{
    key: '_handleClearButtonClick',
    value: function _handleClearButtonClick(event) {
      this.props.clear();
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        _nuclideUiLibToolbar.Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarRight.ToolbarRight,
          null,
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            {
              size: _nuclideUiLibButton.ButtonSizes.SMALL,
              onClick: this._handleClearButtonClick },
            'Clear'
          )
        )
      );
    }
  }]);

  return ConsoleHeader;
})(_reactForAtom.React.Component);

exports['default'] = ConsoleHeader;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbnNvbGVIZWFkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBV29CLGdCQUFnQjs7bUNBQ2QsOEJBQThCOzt3Q0FDekIsbUNBQW1DOztrQ0FJdkQsNkJBQTZCOztJQU1mLGFBQWE7WUFBYixhQUFhOztBQUdyQixXQUhRLGFBQWEsQ0FHcEIsS0FBWSxFQUFFOzBCQUhQLGFBQWE7O0FBSTlCLCtCQUppQixhQUFhLDZDQUl4QixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQy9FOztlQU5rQixhQUFhOztXQVFULGlDQUFDLEtBQTBCLEVBQVE7QUFDeEQsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNwQjs7O1dBRUssa0JBQW1CO0FBQ3ZCLGFBQ0U7O1VBQVMsUUFBUSxFQUFDLEtBQUs7UUFDckI7OztVQUNFOzs7QUFDRSxrQkFBSSxFQUFFLGdDQUFZLEtBQUssQUFBQztBQUN4QixxQkFBTyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQUFBQzs7V0FFL0I7U0FDSTtPQUNQLENBQ1Y7S0FDSDs7O1NBeEJrQixhQUFhO0dBQVMsb0JBQU0sU0FBUzs7cUJBQXJDLGFBQWEiLCJmaWxlIjoiQ29uc29sZUhlYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7VG9vbGJhcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhcic7XG5pbXBvcnQge1Rvb2xiYXJSaWdodH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhclJpZ2h0JztcbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQnV0dG9uU2l6ZXMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNsZWFyOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uc29sZUhlYWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNsZWFyQnV0dG9uQ2xpY2sgPSB0aGlzLl9oYW5kbGVDbGVhckJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBfaGFuZGxlQ2xlYXJCdXR0b25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuY2xlYXIoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUb29sYmFyIGxvY2F0aW9uPVwidG9wXCI+XG4gICAgICAgIDxUb29sYmFyUmlnaHQ+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgc2l6ZT17QnV0dG9uU2l6ZXMuU01BTEx9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGVhckJ1dHRvbkNsaWNrfT5cbiAgICAgICAgICAgIENsZWFyXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvVG9vbGJhclJpZ2h0PlxuICAgICAgPC9Ub29sYmFyPlxuICAgICk7XG4gIH1cblxufVxuIl19