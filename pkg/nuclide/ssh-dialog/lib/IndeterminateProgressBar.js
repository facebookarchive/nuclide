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

/**
 * Component to entertain the user while he is waiting to hear back from the
 * server.
 */

var IndeterminateProgressBar = (function (_React$Component) {
  _inherits(IndeterminateProgressBar, _React$Component);

  function IndeterminateProgressBar() {
    _classCallCheck(this, IndeterminateProgressBar);

    _get(Object.getPrototypeOf(IndeterminateProgressBar.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(IndeterminateProgressBar, [{
    key: 'render',
    value: function render() {
      return _reactForAtom2['default'].createElement(
        'div',
        { className: 'block text-center padded' },
        _reactForAtom2['default'].createElement('span', { className: 'loading loading-spinner-medium inline-block' })
      );
    }
  }]);

  return IndeterminateProgressBar;
})(_reactForAtom2['default'].Component);

exports['default'] = IndeterminateProgressBar;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluZGV0ZXJtaW5hdGVQcm9ncmVzc0Jhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdrQixnQkFBZ0I7Ozs7Ozs7OztJQU1iLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQUNyQyxrQkFBaUI7QUFDckIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsMEJBQTBCO1FBQ3ZDLGtEQUFNLFNBQVMsRUFBQyw2Q0FBNkMsR0FBUTtPQUNqRSxDQUNOO0tBQ0g7OztTQVBrQix3QkFBd0I7R0FBUywwQkFBTSxTQUFTOztxQkFBaEQsd0JBQXdCIiwiZmlsZSI6IkluZGV0ZXJtaW5hdGVQcm9ncmVzc0Jhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbi8qKlxuICogQ29tcG9uZW50IHRvIGVudGVydGFpbiB0aGUgdXNlciB3aGlsZSBoZSBpcyB3YWl0aW5nIHRvIGhlYXIgYmFjayBmcm9tIHRoZVxuICogc2VydmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmRldGVybWluYXRlUHJvZ3Jlc3NCYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9jayB0ZXh0LWNlbnRlciBwYWRkZWRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItbWVkaXVtIGlubGluZS1ibG9ja1wiPjwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==