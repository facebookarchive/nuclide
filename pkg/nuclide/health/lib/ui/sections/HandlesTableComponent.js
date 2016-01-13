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

var PropTypes = _reactForAtom2['default'].PropTypes;

var HandlesTableComponent = (function (_React$Component) {
  _inherits(HandlesTableComponent, _React$Component);

  _createClass(HandlesTableComponent, null, [{
    key: 'propTypes',
    value: {
      title: PropTypes.string,
      handles: PropTypes.arrayOf(PropTypes.object),
      keyed: PropTypes.func.isRequired,
      columns: PropTypes.arrayOf(PropTypes.object).isRequired
    },
    enumerable: true
  }]);

  function HandlesTableComponent(props) {
    _classCallCheck(this, HandlesTableComponent);

    _get(Object.getPrototypeOf(HandlesTableComponent.prototype), 'constructor', this).call(this, props);
    this.previousHandleSummaries = {};
  }

  _createClass(HandlesTableComponent, [{
    key: 'getHandleSummaries',
    value: function getHandleSummaries(handles) {
      var _this = this;

      var handleSummaries = {};
      handles.forEach(function (handle, h) {
        var summarizedHandle = {};
        _this.props.columns.forEach(function (column, c) {
          summarizedHandle[c] = column.value(handle, h);
        });
        handleSummaries[_this.props.keyed(handle, h)] = summarizedHandle;
      });
      return handleSummaries;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      if (!this.props.handles || Object.keys(this.props.handles).length === 0) {
        return _reactForAtom2['default'].createElement('div', null);
      }

      var handleSummaries = this.getHandleSummaries(this.props.handles);
      var component = _reactForAtom2['default'].createElement(
        'div',
        null,
        _reactForAtom2['default'].createElement(
          'h3',
          null,
          this.props.title
        ),
        _reactForAtom2['default'].createElement(
          'table',
          { className: 'table' },
          _reactForAtom2['default'].createElement(
            'thead',
            null,
            _reactForAtom2['default'].createElement(
              'tr',
              null,
              _reactForAtom2['default'].createElement(
                'th',
                { width: '10%' },
                'ID'
              ),
              this.props.columns.map(function (column, c) {
                return _reactForAtom2['default'].createElement(
                  'th',
                  { key: c, width: column.widthPercentage + '%' },
                  column.title
                );
              })
            )
          ),
          _reactForAtom2['default'].createElement(
            'tbody',
            null,
            Object.keys(handleSummaries).map(function (key) {
              var handleSummary = handleSummaries[key];
              var previousHandle = _this2.previousHandleSummaries[key];
              return _reactForAtom2['default'].createElement(
                'tr',
                { key: key, className: previousHandle ? '' : 'nuclide-health-handle-new' },
                _reactForAtom2['default'].createElement(
                  'th',
                  null,
                  key
                ),
                _this2.props.columns.map(function (column, c) {
                  var className = '';
                  if (previousHandle && previousHandle[c] !== handleSummary[c]) {
                    className = 'nuclide-health-handle-updated';
                  }
                  return _reactForAtom2['default'].createElement(
                    'td',
                    { key: c, className: className },
                    handleSummary[c]
                  );
                })
              );
            })
          )
        )
      );
      this.previousHandleSummaries = handleSummaries;
      return component;
    }
  }]);

  return HandlesTableComponent;
})(_reactForAtom2['default'].Component);

exports['default'] = HandlesTableComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbmRsZXNUYWJsZUNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdrQixnQkFBZ0I7Ozs7SUFDM0IsU0FBUyw2QkFBVCxTQUFTOztJQUVLLHFCQUFxQjtZQUFyQixxQkFBcUI7O2VBQXJCLHFCQUFxQjs7V0FFckI7QUFDakIsV0FBSyxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ3ZCLGFBQU8sRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDNUMsV0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNoQyxhQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVTtLQUN4RDs7OztBQUlVLFdBWFEscUJBQXFCLENBVzVCLEtBQWEsRUFBRTswQkFYUixxQkFBcUI7O0FBWXRDLCtCQVppQixxQkFBcUIsNkNBWWhDLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLENBQUM7R0FDbkM7O2VBZGtCLHFCQUFxQjs7V0FnQnRCLDRCQUFDLE9BQXNCLEVBQVU7OztBQUNqRCxVQUFNLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDM0IsYUFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUs7QUFDN0IsWUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDNUIsY0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUs7QUFDeEMsMEJBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDL0MsQ0FBQyxDQUFDO0FBQ0gsdUJBQWUsQ0FBQyxNQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUM7T0FDakUsQ0FBQyxDQUFDO0FBQ0gsYUFBTyxlQUFlLENBQUM7S0FDeEI7OztXQUVLLGtCQUFpQjs7O0FBQ3JCLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN2RSxlQUFPLG9EQUFPLENBQUM7T0FDaEI7O0FBRUQsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEUsVUFBTSxTQUFTLEdBQ2I7OztRQUNFOzs7VUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7U0FBTTtRQUMzQjs7WUFBTyxTQUFTLEVBQUMsT0FBTztVQUN0Qjs7O1lBQ0U7OztjQUNFOztrQkFBSSxLQUFLLEVBQUMsS0FBSzs7ZUFBUTtjQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNLEVBQUUsQ0FBQzt1QkFDaEM7O29CQUFJLEdBQUcsRUFBRSxDQUFDLEFBQUMsRUFBQyxLQUFLLEVBQUssTUFBTSxDQUFDLGVBQWUsTUFBSTtrQkFBRSxNQUFNLENBQUMsS0FBSztpQkFBTTtlQUFBLENBQ3JFO2FBQ0U7V0FDQztVQUNSOzs7WUFDRyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUN2QyxrQkFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLGtCQUFNLGNBQWMsR0FBRyxPQUFLLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELHFCQUNFOztrQkFBSSxHQUFHLEVBQUUsR0FBRyxBQUFDLEVBQUMsU0FBUyxFQUFFLGNBQWMsR0FBRyxFQUFFLEdBQUcsMkJBQTJCLEFBQUM7Z0JBQ3pFOzs7a0JBQUssR0FBRztpQkFBTTtnQkFDYixPQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTSxFQUFFLENBQUMsRUFBSztBQUNyQyxzQkFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ25CLHNCQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzVELDZCQUFTLEdBQUcsK0JBQStCLENBQUM7bUJBQzdDO0FBQ0QseUJBQU87O3NCQUFJLEdBQUcsRUFBRSxDQUFDLEFBQUMsRUFBQyxTQUFTLEVBQUUsU0FBUyxBQUFDO29CQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7bUJBQU0sQ0FBQztpQkFDbEUsQ0FBQztlQUNDLENBQ0w7YUFDSCxDQUFDO1dBQ0k7U0FDRjtPQUNKLEFBQ1AsQ0FBQztBQUNGLFVBQUksQ0FBQyx1QkFBdUIsR0FBRyxlQUFlLENBQUM7QUFDL0MsYUFBTyxTQUFTLENBQUM7S0FDbEI7OztTQXJFa0IscUJBQXFCO0dBQVMsMEJBQU0sU0FBUzs7cUJBQTdDLHFCQUFxQiIsImZpbGUiOiJIYW5kbGVzVGFibGVDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGFuZGxlc1RhYmxlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGhhbmRsZXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QpLFxuICAgIGtleWVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGNvbHVtbnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QpLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgcHJldmlvdXNIYW5kbGVTdW1tYXJpZXM6IE9iamVjdDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMucHJldmlvdXNIYW5kbGVTdW1tYXJpZXMgPSB7fTtcbiAgfVxuXG4gIGdldEhhbmRsZVN1bW1hcmllcyhoYW5kbGVzOiBBcnJheTxPYmplY3Q+KTogT2JqZWN0IHtcbiAgICBjb25zdCBoYW5kbGVTdW1tYXJpZXMgPSB7fTtcbiAgICBoYW5kbGVzLmZvckVhY2goKGhhbmRsZSwgaCkgPT4ge1xuICAgICAgY29uc3Qgc3VtbWFyaXplZEhhbmRsZSA9IHt9O1xuICAgICAgdGhpcy5wcm9wcy5jb2x1bW5zLmZvckVhY2goKGNvbHVtbiwgYykgPT4ge1xuICAgICAgICBzdW1tYXJpemVkSGFuZGxlW2NdID0gY29sdW1uLnZhbHVlKGhhbmRsZSwgaCk7XG4gICAgICB9KTtcbiAgICAgIGhhbmRsZVN1bW1hcmllc1t0aGlzLnByb3BzLmtleWVkKGhhbmRsZSwgaCldID0gc3VtbWFyaXplZEhhbmRsZTtcbiAgICB9KTtcbiAgICByZXR1cm4gaGFuZGxlU3VtbWFyaWVzO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgaWYgKCF0aGlzLnByb3BzLmhhbmRsZXMgfHwgT2JqZWN0LmtleXModGhpcy5wcm9wcy5oYW5kbGVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiA8ZGl2IC8+O1xuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZVN1bW1hcmllcyA9IHRoaXMuZ2V0SGFuZGxlU3VtbWFyaWVzKHRoaXMucHJvcHMuaGFuZGxlcyk7XG4gICAgY29uc3QgY29tcG9uZW50ID0gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgzPnt0aGlzLnByb3BzLnRpdGxlfTwvaDM+XG4gICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ0YWJsZVwiPlxuICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRoIHdpZHRoPVwiMTAlXCI+SUQ8L3RoPlxuICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5jb2x1bW5zLm1hcCgoY29sdW1uLCBjKSA9PlxuICAgICAgICAgICAgICAgIDx0aCBrZXk9e2N9IHdpZHRoPXtgJHtjb2x1bW4ud2lkdGhQZXJjZW50YWdlfSVgfT57Y29sdW1uLnRpdGxlfTwvdGg+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAge09iamVjdC5rZXlzKGhhbmRsZVN1bW1hcmllcykubWFwKGtleSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGhhbmRsZVN1bW1hcnkgPSBoYW5kbGVTdW1tYXJpZXNba2V5XTtcbiAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNIYW5kbGUgPSB0aGlzLnByZXZpb3VzSGFuZGxlU3VtbWFyaWVzW2tleV07XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPHRyIGtleT17a2V5fSBjbGFzc05hbWU9e3ByZXZpb3VzSGFuZGxlID8gJycgOiAnbnVjbGlkZS1oZWFsdGgtaGFuZGxlLW5ldyd9PlxuICAgICAgICAgICAgICAgICAgPHRoPntrZXl9PC90aD5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNvbHVtbnMubWFwKChjb2x1bW4sIGMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNIYW5kbGUgJiYgcHJldmlvdXNIYW5kbGVbY10gIT09IGhhbmRsZVN1bW1hcnlbY10pIHtcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSAnbnVjbGlkZS1oZWFsdGgtaGFuZGxlLXVwZGF0ZWQnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiA8dGQga2V5PXtjfSBjbGFzc05hbWU9e2NsYXNzTmFtZX0+e2hhbmRsZVN1bW1hcnlbY119PC90ZD47XG4gICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgPC90YWJsZT5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gICAgdGhpcy5wcmV2aW91c0hhbmRsZVN1bW1hcmllcyA9IGhhbmRsZVN1bW1hcmllcztcbiAgICByZXR1cm4gY29tcG9uZW50O1xuICB9XG5cbn1cbiJdfQ==