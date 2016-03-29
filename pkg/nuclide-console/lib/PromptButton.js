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

var _remote = require('remote');

var _remote2 = _interopRequireDefault(_remote);

var Menu = _remote2['default'].require('menu');
var MenuItem = _remote2['default'].require('menu-item');

var PromptButton = (function (_React$Component) {
  _inherits(PromptButton, _React$Component);

  function PromptButton(props) {
    _classCallCheck(this, PromptButton);

    _get(Object.getPrototypeOf(PromptButton.prototype), 'constructor', this).call(this, props);
    this._handleClick = this._handleClick.bind(this);
  }

  _createClass(PromptButton, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'span',
        { className: 'nuclide-console-prompt-wrapper', onClick: this._handleClick },
        _reactForAtom.React.createElement(
          'span',
          { className: 'nuclide-console-prompt-label' },
          this.props.children
        ),
        _reactForAtom.React.createElement('span', { className: 'icon icon-chevron-right' })
      );
    }
  }, {
    key: '_handleClick',
    value: function _handleClick(event) {
      var _this = this;

      var currentWindow = _remote2['default'].getCurrentWindow();
      var menu = new Menu();
      // TODO: Sort alphabetically by label
      this.props.options.forEach(function (option) {
        menu.append(new MenuItem({
          type: 'checkbox',
          checked: _this.props.value === option.id,
          label: option.label,
          click: function click() {
            return _this.props.onChange(option.id);
          }
        }));
      });
      menu.popup(currentWindow, event.clientX, event.clientY);
    }
  }]);

  return PromptButton;
})(_reactForAtom.React.Component);

exports['default'] = PromptButton;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb21wdEJ1dHRvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O3NCQUNqQixRQUFROzs7O0FBRTNCLElBQU0sSUFBSSxHQUFHLG9CQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQyxJQUFNLFFBQVEsR0FBRyxvQkFBTyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0lBY3hCLFlBQVk7WUFBWixZQUFZOztBQUlwQixXQUpRLFlBQVksQ0FJbkIsS0FBWSxFQUFFOzBCQUpQLFlBQVk7O0FBSzdCLCtCQUxpQixZQUFZLDZDQUt2QixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDekQ7O2VBUGtCLFlBQVk7O1dBU3pCLGtCQUFrQjtBQUN0QixhQUNFOztVQUFNLFNBQVMsRUFBQyxnQ0FBZ0MsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQUFBQztRQUMxRTs7WUFBTSxTQUFTLEVBQUMsOEJBQThCO1VBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtTQUNmO1FBQ1AsNENBQU0sU0FBUyxFQUFDLHlCQUF5QixHQUFRO09BQzVDLENBQ1A7S0FDSDs7O1dBRVcsc0JBQUMsS0FBMEIsRUFBUTs7O0FBQzdDLFVBQU0sYUFBYSxHQUFHLG9CQUFPLGdCQUFnQixFQUFFLENBQUM7QUFDaEQsVUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzs7QUFFeEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ25DLFlBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUM7QUFDdkIsY0FBSSxFQUFFLFVBQVU7QUFDaEIsaUJBQU8sRUFBRSxNQUFLLEtBQUssQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLEVBQUU7QUFDdkMsZUFBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO0FBQ25CLGVBQUssRUFBRTttQkFBTSxNQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztXQUFBO1NBQzVDLENBQUMsQ0FBQyxDQUFDO09BQ0wsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDekQ7OztTQWpDa0IsWUFBWTtHQUFTLG9CQUFNLFNBQVM7O3FCQUFwQyxZQUFZIiwiZmlsZSI6IlByb21wdEJ1dHRvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCByZW1vdGUgZnJvbSAncmVtb3RlJztcblxuY29uc3QgTWVudSA9IHJlbW90ZS5yZXF1aXJlKCdtZW51Jyk7XG5jb25zdCBNZW51SXRlbSA9IHJlbW90ZS5yZXF1aXJlKCdtZW51LWl0ZW0nKTtcblxudHlwZSBQcm9tcHRPcHRpb24gPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGxhYmVsOiBzdHJpbmc7XG59O1xuXG50eXBlIFByb3BzID0ge1xuICB2YWx1ZTogc3RyaW5nO1xuICBvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQ7XG4gIGNoaWxkcmVuOiA/YW55O1xuICBvcHRpb25zOiBBcnJheTxQcm9tcHRPcHRpb24+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvbXB0QnV0dG9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBfZGlzcG9zYWJsZXM6IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ2xpY2sgPSB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWNvbnNvbGUtcHJvbXB0LXdyYXBwZXJcIiBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja30+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtY29uc29sZS1wcm9tcHQtbGFiZWxcIj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tY2hldnJvbi1yaWdodFwiPjwvc3Bhbj5cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFdpbmRvdyA9IHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCk7XG4gICAgY29uc3QgbWVudSA9IG5ldyBNZW51KCk7XG4gICAgLy8gVE9ETzogU29ydCBhbHBoYWJldGljYWxseSBieSBsYWJlbFxuICAgIHRoaXMucHJvcHMub3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XG4gICAgICBtZW51LmFwcGVuZChuZXcgTWVudUl0ZW0oe1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBjaGVja2VkOiB0aGlzLnByb3BzLnZhbHVlID09PSBvcHRpb24uaWQsXG4gICAgICAgIGxhYmVsOiBvcHRpb24ubGFiZWwsXG4gICAgICAgIGNsaWNrOiAoKSA9PiB0aGlzLnByb3BzLm9uQ2hhbmdlKG9wdGlvbi5pZCksXG4gICAgICB9KSk7XG4gICAgfSk7XG4gICAgbWVudS5wb3B1cChjdXJyZW50V2luZG93LCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgfVxuXG59XG4iXX0=