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

      var Menu = _remote2['default'].require('menu');
      var MenuItem = _remote2['default'].require('menu-item');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb21wdEJ1dHRvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O3NCQUNqQixRQUFROzs7O0lBY04sWUFBWTtZQUFaLFlBQVk7O0FBSXBCLFdBSlEsWUFBWSxDQUluQixLQUFZLEVBQUU7MEJBSlAsWUFBWTs7QUFLN0IsK0JBTGlCLFlBQVksNkNBS3ZCLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN6RDs7ZUFQa0IsWUFBWTs7V0FTekIsa0JBQW1CO0FBQ3ZCLGFBQ0U7O1VBQU0sU0FBUyxFQUFDLGdDQUFnQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxBQUFDO1FBQzFFOztZQUFNLFNBQVMsRUFBQyw4QkFBOEI7VUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRO1NBQ2Y7UUFDUCw0Q0FBTSxTQUFTLEVBQUMseUJBQXlCLEdBQVE7T0FDNUMsQ0FDUDtLQUNIOzs7V0FFVyxzQkFBQyxLQUEwQixFQUFROzs7QUFDN0MsVUFBTSxJQUFJLEdBQUcsb0JBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLFVBQU0sUUFBUSxHQUFHLG9CQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM3QyxVQUFNLGFBQWEsR0FBRyxvQkFBTyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ2hELFVBQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7O0FBRXhCLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNuQyxZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDO0FBQ3ZCLGNBQUksRUFBRSxVQUFVO0FBQ2hCLGlCQUFPLEVBQUUsTUFBSyxLQUFLLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxFQUFFO0FBQ3ZDLGVBQUssRUFBRSxNQUFNLENBQUMsS0FBSztBQUNuQixlQUFLLEVBQUU7bUJBQU0sTUFBSyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7V0FBQTtTQUM1QyxDQUFDLENBQUMsQ0FBQztPQUNMLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3pEOzs7U0FuQ2tCLFlBQVk7R0FBUyxvQkFBTSxTQUFTOztxQkFBcEMsWUFBWSIsImZpbGUiOiJQcm9tcHRCdXR0b24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgcmVtb3RlIGZyb20gJ3JlbW90ZSc7XG5cbnR5cGUgUHJvbXB0T3B0aW9uID0ge1xuICBpZDogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xufTtcblxudHlwZSBQcm9wcyA9IHtcbiAgdmFsdWU6IHN0cmluZztcbiAgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkO1xuICBjaGlsZHJlbjogP2FueTtcbiAgb3B0aW9uczogQXJyYXk8UHJvbXB0T3B0aW9uPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb21wdEJ1dHRvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgX2Rpc3Bvc2FibGVzOiBJRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNsaWNrID0gdGhpcy5faGFuZGxlQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtY29uc29sZS1wcm9tcHQtd3JhcHBlclwiIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1jb25zb2xlLXByb21wdC1sYWJlbFwiPlxuICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1jaGV2cm9uLXJpZ2h0XCI+PC9zcGFuPlxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBNZW51ID0gcmVtb3RlLnJlcXVpcmUoJ21lbnUnKTtcbiAgICBjb25zdCBNZW51SXRlbSA9IHJlbW90ZS5yZXF1aXJlKCdtZW51LWl0ZW0nKTtcbiAgICBjb25zdCBjdXJyZW50V2luZG93ID0gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKTtcbiAgICBjb25zdCBtZW51ID0gbmV3IE1lbnUoKTtcbiAgICAvLyBUT0RPOiBTb3J0IGFscGhhYmV0aWNhbGx5IGJ5IGxhYmVsXG4gICAgdGhpcy5wcm9wcy5vcHRpb25zLmZvckVhY2gob3B0aW9uID0+IHtcbiAgICAgIG1lbnUuYXBwZW5kKG5ldyBNZW51SXRlbSh7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIGNoZWNrZWQ6IHRoaXMucHJvcHMudmFsdWUgPT09IG9wdGlvbi5pZCxcbiAgICAgICAgbGFiZWw6IG9wdGlvbi5sYWJlbCxcbiAgICAgICAgY2xpY2s6ICgpID0+IHRoaXMucHJvcHMub25DaGFuZ2Uob3B0aW9uLmlkKSxcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgICBtZW51LnBvcHVwKGN1cnJlbnRXaW5kb3csIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICB9XG5cbn1cbiJdfQ==