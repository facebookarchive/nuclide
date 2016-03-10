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

/* eslint-disable react/prop-types */

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
          className: 'nuclide-output-table-wrapper' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk91dHB1dFRhYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFlb0IsZ0JBQWdCOzswQkFDYixjQUFjOzs7O0lBTWhCLFdBQVc7WUFBWCxXQUFXOztXQUFYLFdBQVc7MEJBQVgsV0FBVzs7K0JBQVgsV0FBVzs7O2VBQVgsV0FBVzs7V0FFeEIsa0JBQWtCO0FBQ3RCLGFBQ0U7OztBQUNFLG1CQUFTLEVBQUMsOEJBQThCO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQztPQUMxQyxDQUNOO0tBQ0g7OztXQUVTLG9CQUFDLE1BQWMsRUFBRSxLQUFhLEVBQWdCO0FBQ3RELGFBQU8sNkRBQVksR0FBRyxFQUFFLEtBQUssQUFBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEFBQUMsR0FBRyxDQUFDO0tBQ25EOzs7U0Fia0IsV0FBVztHQUFTLG9CQUFNLFNBQVM7O3FCQUFuQyxXQUFXIiwiZmlsZSI6Ik91dHB1dFRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQgdHlwZSB7UmVjb3JkfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFJlY29yZFZpZXcgZnJvbSAnLi9SZWNvcmRWaWV3JztcblxudHlwZSBQcm9wcyA9IHtcbiAgcmVjb3JkczogQXJyYXk8UmVjb3JkPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE91dHB1dFRhYmxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzLCB2b2lkPiB7XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtb3V0cHV0LXRhYmxlLXdyYXBwZXJcIj5cbiAgICAgICAge3RoaXMucHJvcHMucmVjb3Jkcy5tYXAodGhpcy5fcmVuZGVyUm93LCB0aGlzKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyUm93KHJlY29yZDogUmVjb3JkLCBpbmRleDogbnVtYmVyKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gPFJlY29yZFZpZXcga2V5PXtpbmRleH0gcmVjb3JkPXtyZWNvcmR9IC8+O1xuICB9XG5cbn1cbiJdfQ==