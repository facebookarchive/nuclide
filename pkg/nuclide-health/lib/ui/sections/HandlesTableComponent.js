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

var PropTypes = _reactForAtom.React.PropTypes;

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
        return _reactForAtom.React.createElement('div', null);
      }

      var handleSummaries = this.getHandleSummaries(this.props.handles);
      var component = _reactForAtom.React.createElement(
        'div',
        null,
        _reactForAtom.React.createElement(
          'h3',
          null,
          this.props.title
        ),
        _reactForAtom.React.createElement(
          'table',
          { className: 'table' },
          _reactForAtom.React.createElement(
            'thead',
            null,
            _reactForAtom.React.createElement(
              'tr',
              null,
              _reactForAtom.React.createElement(
                'th',
                { width: '10%' },
                'ID'
              ),
              this.props.columns.map(function (column, c) {
                return _reactForAtom.React.createElement(
                  'th',
                  { key: c, width: column.widthPercentage + '%' },
                  column.title
                );
              })
            )
          ),
          _reactForAtom.React.createElement(
            'tbody',
            null,
            Object.keys(handleSummaries).map(function (key) {
              var handleSummary = handleSummaries[key];
              var previousHandle = _this2.previousHandleSummaries[key];
              return _reactForAtom.React.createElement(
                'tr',
                { key: key, className: previousHandle ? '' : 'nuclide-health-handle-new' },
                _reactForAtom.React.createElement(
                  'th',
                  null,
                  key
                ),
                _this2.props.columns.map(function (column, c) {
                  var className = '';
                  if (previousHandle && previousHandle[c] !== handleSummary[c]) {
                    className = 'nuclide-health-handle-updated';
                  }
                  return _reactForAtom.React.createElement(
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
})(_reactForAtom.React.Component);

exports['default'] = HandlesTableComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbmRsZXNUYWJsZUNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztJQUM3QixTQUFTLHVCQUFULFNBQVM7O0lBRUsscUJBQXFCO1lBQXJCLHFCQUFxQjs7ZUFBckIscUJBQXFCOztXQUVyQjtBQUNqQixXQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDdkIsYUFBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUM1QyxXQUFLLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ2hDLGFBQU8sRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVO0tBQ3hEOzs7O0FBSVUsV0FYUSxxQkFBcUIsQ0FXNUIsS0FBYSxFQUFFOzBCQVhSLHFCQUFxQjs7QUFZdEMsK0JBWmlCLHFCQUFxQiw2Q0FZaEMsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztHQUNuQzs7ZUFka0IscUJBQXFCOztXQWdCdEIsNEJBQUMsT0FBc0IsRUFBVTs7O0FBQ2pELFVBQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMzQixhQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFFLENBQUMsRUFBSztBQUM3QixZQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztBQUM1QixjQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFFLENBQUMsRUFBSztBQUN4QywwQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMvQyxDQUFDLENBQUM7QUFDSCx1QkFBZSxDQUFDLE1BQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztPQUNqRSxDQUFDLENBQUM7QUFDSCxhQUFPLGVBQWUsQ0FBQztLQUN4Qjs7O1dBRUssa0JBQWlCOzs7QUFDckIsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3ZFLGVBQU8sOENBQU8sQ0FBQztPQUNoQjs7QUFFRCxVQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwRSxVQUFNLFNBQVMsR0FDYjs7O1FBQ0U7OztVQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztTQUFNO1FBQzNCOztZQUFPLFNBQVMsRUFBQyxPQUFPO1VBQ3RCOzs7WUFDRTs7O2NBQ0U7O2tCQUFJLEtBQUssRUFBQyxLQUFLOztlQUFRO2NBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDO3VCQUNoQzs7b0JBQUksR0FBRyxFQUFFLENBQUMsQUFBQyxFQUFDLEtBQUssRUFBSyxNQUFNLENBQUMsZUFBZSxNQUFJO2tCQUFFLE1BQU0sQ0FBQyxLQUFLO2lCQUFNO2VBQUEsQ0FDckU7YUFDRTtXQUNDO1VBQ1I7OztZQUNHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ3ZDLGtCQUFNLGFBQWEsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0Msa0JBQU0sY0FBYyxHQUFHLE9BQUssdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekQscUJBQ0U7O2tCQUFJLEdBQUcsRUFBRSxHQUFHLEFBQUMsRUFBQyxTQUFTLEVBQUUsY0FBYyxHQUFHLEVBQUUsR0FBRywyQkFBMkIsQUFBQztnQkFDekU7OztrQkFBSyxHQUFHO2lCQUFNO2dCQUNiLE9BQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFLO0FBQ3JDLHNCQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDbkIsc0JBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDNUQsNkJBQVMsR0FBRywrQkFBK0IsQ0FBQzttQkFDN0M7QUFDRCx5QkFBTzs7c0JBQUksR0FBRyxFQUFFLENBQUMsQUFBQyxFQUFDLFNBQVMsRUFBRSxTQUFTLEFBQUM7b0JBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQzttQkFBTSxDQUFDO2lCQUNsRSxDQUFDO2VBQ0MsQ0FDTDthQUNILENBQUM7V0FDSTtTQUNGO09BQ0osQUFDUCxDQUFDO0FBQ0YsVUFBSSxDQUFDLHVCQUF1QixHQUFHLGVBQWUsQ0FBQztBQUMvQyxhQUFPLFNBQVMsQ0FBQztLQUNsQjs7O1NBckVrQixxQkFBcUI7R0FBUyxvQkFBTSxTQUFTOztxQkFBN0MscUJBQXFCIiwiZmlsZSI6IkhhbmRsZXNUYWJsZUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhhbmRsZXNUYWJsZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBoYW5kbGVzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KSxcbiAgICBrZXllZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBjb2x1bW5zOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHByZXZpb3VzSGFuZGxlU3VtbWFyaWVzOiBPYmplY3Q7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnByZXZpb3VzSGFuZGxlU3VtbWFyaWVzID0ge307XG4gIH1cblxuICBnZXRIYW5kbGVTdW1tYXJpZXMoaGFuZGxlczogQXJyYXk8T2JqZWN0Pik6IE9iamVjdCB7XG4gICAgY29uc3QgaGFuZGxlU3VtbWFyaWVzID0ge307XG4gICAgaGFuZGxlcy5mb3JFYWNoKChoYW5kbGUsIGgpID0+IHtcbiAgICAgIGNvbnN0IHN1bW1hcml6ZWRIYW5kbGUgPSB7fTtcbiAgICAgIHRoaXMucHJvcHMuY29sdW1ucy5mb3JFYWNoKChjb2x1bW4sIGMpID0+IHtcbiAgICAgICAgc3VtbWFyaXplZEhhbmRsZVtjXSA9IGNvbHVtbi52YWx1ZShoYW5kbGUsIGgpO1xuICAgICAgfSk7XG4gICAgICBoYW5kbGVTdW1tYXJpZXNbdGhpcy5wcm9wcy5rZXllZChoYW5kbGUsIGgpXSA9IHN1bW1hcml6ZWRIYW5kbGU7XG4gICAgfSk7XG4gICAgcmV0dXJuIGhhbmRsZVN1bW1hcmllcztcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGlmICghdGhpcy5wcm9wcy5oYW5kbGVzIHx8IE9iamVjdC5rZXlzKHRoaXMucHJvcHMuaGFuZGxlcykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gPGRpdiAvPjtcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGVTdW1tYXJpZXMgPSB0aGlzLmdldEhhbmRsZVN1bW1hcmllcyh0aGlzLnByb3BzLmhhbmRsZXMpO1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMz57dGhpcy5wcm9wcy50aXRsZX08L2gzPlxuICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidGFibGVcIj5cbiAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgIDx0aCB3aWR0aD1cIjEwJVwiPklEPC90aD5cbiAgICAgICAgICAgICAge3RoaXMucHJvcHMuY29sdW1ucy5tYXAoKGNvbHVtbiwgYykgPT5cbiAgICAgICAgICAgICAgICA8dGgga2V5PXtjfSB3aWR0aD17YCR7Y29sdW1uLndpZHRoUGVyY2VudGFnZX0lYH0+e2NvbHVtbi50aXRsZX08L3RoPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgIHtPYmplY3Qua2V5cyhoYW5kbGVTdW1tYXJpZXMpLm1hcChrZXkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBoYW5kbGVTdW1tYXJ5ID0gaGFuZGxlU3VtbWFyaWVzW2tleV07XG4gICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzSGFuZGxlID0gdGhpcy5wcmV2aW91c0hhbmRsZVN1bW1hcmllc1trZXldO1xuICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDx0ciBrZXk9e2tleX0gY2xhc3NOYW1lPXtwcmV2aW91c0hhbmRsZSA/ICcnIDogJ251Y2xpZGUtaGVhbHRoLWhhbmRsZS1uZXcnfT5cbiAgICAgICAgICAgICAgICAgIDx0aD57a2V5fTwvdGg+XG4gICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5jb2x1bW5zLm1hcCgoY29sdW1uLCBjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzSGFuZGxlICYmIHByZXZpb3VzSGFuZGxlW2NdICE9PSBoYW5kbGVTdW1tYXJ5W2NdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ251Y2xpZGUtaGVhbHRoLWhhbmRsZS11cGRhdGVkJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gPHRkIGtleT17Y30gY2xhc3NOYW1lPXtjbGFzc05hbWV9PntoYW5kbGVTdW1tYXJ5W2NdfTwvdGQ+O1xuICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICAgIHRoaXMucHJldmlvdXNIYW5kbGVTdW1tYXJpZXMgPSBoYW5kbGVTdW1tYXJpZXM7XG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgfVxuXG59XG4iXX0=