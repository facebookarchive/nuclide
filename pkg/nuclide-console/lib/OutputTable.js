Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _RecordView = require('./RecordView');

var _RecordView2 = _interopRequireDefault(_RecordView);

var OutputTable = (function (_React$Component) {
  _inherits(OutputTable, _React$Component);

  function OutputTable() {
    _classCallCheck(this, OutputTable);

    _get(Object.getPrototypeOf(OutputTable.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(OutputTable, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        {
          className: 'nuclide-console-table-wrapper native-key-bindings',
          tabIndex: '1' },
        this.props.records.map(this._renderRow, this)
      );
    }
  }, {
    key: '_renderRow',
    value: function _renderRow(record, index) {
      return _reactForAtom.React.createElement(_RecordView2['default'], { key: index, record: record });
    }
  }]);

  return OutputTable;
})(_reactForAtom.React.Component);

exports['default'] = OutputTable;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk91dHB1dFRhYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYW9CLGdCQUFnQjs7MEJBQ2IsY0FBYzs7OztJQU1oQixXQUFXO1lBQVgsV0FBVzs7V0FBWCxXQUFXOzBCQUFYLFdBQVc7OytCQUFYLFdBQVc7OztlQUFYLFdBQVc7O1dBR3hCLGtCQUFrQjtBQUN0QixhQUNFOzs7QUFDRSxtQkFBUyxFQUFDLG1EQUFtRDtBQUM3RCxrQkFBUSxFQUFDLEdBQUc7UUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUM7T0FDMUMsQ0FDTjtLQUNIOzs7V0FFUyxvQkFBQyxNQUFjLEVBQUUsS0FBYSxFQUFnQjtBQUN0RCxhQUFPLDZEQUFZLEdBQUcsRUFBRSxLQUFLLEFBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxBQUFDLEdBQUcsQ0FBQztLQUNuRDs7O1NBZmtCLFdBQVc7R0FBUyxvQkFBTSxTQUFTOztxQkFBbkMsV0FBVyIsImZpbGUiOiJPdXRwdXRUYWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZWNvcmR9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVjb3JkVmlldyBmcm9tICcuL1JlY29yZFZpZXcnO1xuXG50eXBlIFByb3BzID0ge1xuICByZWNvcmRzOiBBcnJheTxSZWNvcmQ+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3V0cHV0VGFibGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtY29uc29sZS10YWJsZS13cmFwcGVyIG5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICB0YWJJbmRleD1cIjFcIj5cbiAgICAgICAge3RoaXMucHJvcHMucmVjb3Jkcy5tYXAodGhpcy5fcmVuZGVyUm93LCB0aGlzKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyUm93KHJlY29yZDogUmVjb3JkLCBpbmRleDogbnVtYmVyKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gPFJlY29yZFZpZXcga2V5PXtpbmRleH0gcmVjb3JkPXtyZWNvcmR9IC8+O1xuICB9XG5cbn1cbiJdfQ==