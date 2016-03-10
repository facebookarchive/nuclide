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

/*eslint-disable react/prop-types */

var _reactForAtom = require('react-for-atom');

var TriStateCheckboxComponent = (function (_React$Component) {
  _inherits(TriStateCheckboxComponent, _React$Component);

  function TriStateCheckboxComponent() {
    _classCallCheck(this, TriStateCheckboxComponent);

    _get(Object.getPrototypeOf(TriStateCheckboxComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(TriStateCheckboxComponent, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'svg',
        {
          version: '1.1',
          viewBox: '0 0 100 100',
          className: 'nuclide-file-tree-checkbox',
          width: '1.5em',
          onClick: this.props.onClick },
        _reactForAtom.React.createElement('path', {
          className: 'nuclide-file-tree-checkbox-path',
          d: 'M 10 10 L 90 10 L 90 90 L 10 90 z',
          strokeWidth: '10',
          fill: 'none'
        }),
        this._renderCheckedPath()
      );
    }
  }, {
    key: '_renderCheckedPath',
    value: function _renderCheckedPath() {
      if (this.props.checkedStatus === 'clear') {
        return;
      }

      if (this.props.checkedStatus === 'checked') {
        return _reactForAtom.React.createElement('path', {
          className: 'nuclide-file-tree-checkbox-checked',
          d: 'M 25 40 L 45 65 L 80 10',
          strokeWidth: '15',
          fill: 'none'
        });
      }

      return _reactForAtom.React.createElement('path', {
        className: 'nuclide-file-tree-checkbox-partial',
        d: 'M 25 50 L 75 50',
        strokeWidth: '15',
        fill: 'none'
      });
    }
  }]);

  return TriStateCheckboxComponent;
})(_reactForAtom.React.Component);

exports.TriStateCheckboxComponent = TriStateCheckboxComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRyaVN0YXRlQ2hlY2tib3hDb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFhb0IsZ0JBQWdCOztJQU92Qix5QkFBeUI7WUFBekIseUJBQXlCOztXQUF6Qix5QkFBeUI7MEJBQXpCLHlCQUF5Qjs7K0JBQXpCLHlCQUF5Qjs7O2VBQXpCLHlCQUF5Qjs7V0FHOUIsa0JBQWtCO0FBQ3RCLGFBQ0U7OztBQUNFLGlCQUFPLEVBQUMsS0FBSztBQUNiLGlCQUFPLEVBQUMsYUFBYTtBQUNyQixtQkFBUyxFQUFDLDRCQUE0QjtBQUN0QyxlQUFLLEVBQUMsT0FBTztBQUNiLGlCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7UUFDNUI7QUFDRSxtQkFBUyxFQUFDLGlDQUFpQztBQUMzQyxXQUFDLEVBQUMsbUNBQW1DO0FBQ3JDLHFCQUFXLEVBQUMsSUFBSTtBQUNoQixjQUFJLEVBQUMsTUFBTTtVQUNYO1FBQ0QsSUFBSSxDQUFDLGtCQUFrQixFQUFFO09BQ3RCLENBQ047S0FDSDs7O1dBRWlCLDhCQUFtQjtBQUNuQyxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLE9BQU8sRUFBRTtBQUN4QyxlQUFPO09BQ1I7O0FBRUQsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7QUFDMUMsZUFDRTtBQUNFLG1CQUFTLEVBQUMsb0NBQW9DO0FBQzlDLFdBQUMsRUFBQyx5QkFBeUI7QUFDM0IscUJBQVcsRUFBQyxJQUFJO0FBQ2hCLGNBQUksRUFBQyxNQUFNO1VBQ1gsQ0FDRjtPQUNIOztBQUVELGFBQ0U7QUFDRSxpQkFBUyxFQUFDLG9DQUFvQztBQUM5QyxTQUFDLEVBQUMsaUJBQWlCO0FBQ25CLG1CQUFXLEVBQUMsSUFBSTtBQUNoQixZQUFJLEVBQUMsTUFBTTtRQUNYLENBQ0Y7S0FDSDs7O1NBOUNVLHlCQUF5QjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiVHJpU3RhdGVDaGVja2JveENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNoZWNrZWRTdGF0dXM6ICdjaGVja2VkJyB8ICdjbGVhcicgfCAncGFydGlhbCc7XG4gIG9uQ2xpY2s6IChldmVudDogRXZlbnQpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgY2xhc3MgVHJpU3RhdGVDaGVja2JveENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzdmdcbiAgICAgICAgdmVyc2lvbj1cIjEuMVwiXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgMTAwIDEwMFwiXG4gICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLWNoZWNrYm94XCJcbiAgICAgICAgd2lkdGg9XCIxLjVlbVwiXG4gICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtY2hlY2tib3gtcGF0aFwiXG4gICAgICAgICAgZD1cIk0gMTAgMTAgTCA5MCAxMCBMIDkwIDkwIEwgMTAgOTAgelwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxMFwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAvPlxuICAgICAgICB7dGhpcy5fcmVuZGVyQ2hlY2tlZFBhdGgoKX1cbiAgICAgIDwvc3ZnPlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ2hlY2tlZFBhdGgoKTogP1JlYWN0LkVsZW1lbnQge1xuICAgIGlmICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICdjbGVhcicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnY2hlY2tlZCcpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtY2hlY2tib3gtY2hlY2tlZFwiXG4gICAgICAgICAgZD1cIk0gMjUgNDAgTCA0NSA2NSBMIDgwIDEwXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjE1XCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8cGF0aFxuICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWZpbGUtdHJlZS1jaGVja2JveC1wYXJ0aWFsXCJcbiAgICAgICAgZD1cIk0gMjUgNTAgTCA3NSA1MFwiXG4gICAgICAgIHN0cm9rZVdpZHRoPVwiMTVcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAvPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==