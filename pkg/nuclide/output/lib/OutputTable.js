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

var _commons = require('../../commons');

var _reactForAtom = require('react-for-atom');

var _RecordView = require('./RecordView');

var _RecordView2 = _interopRequireDefault(_RecordView);

var OutputTable = (function (_React$Component) {
  _inherits(OutputTable, _React$Component);

  function OutputTable(props) {
    _classCallCheck(this, OutputTable);

    _get(Object.getPrototypeOf(OutputTable.prototype), 'constructor', this).call(this, props);
    this._isScrolledToBottom = true;
    this._userIsScrolling = false;
    this._handleClearButtonClick = this._handleClearButtonClick.bind(this);
    this._handleTableWrapper = this._handleTableWrapper.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._handleScrollEnd = (0, _commons.debounce)(this._handleScrollEnd, 100);
  }

  _createClass(OutputTable, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      // If records are added while we're scrolled to the bottom (or very very close, at least),
      // automatically scroll.
      if (this.props.records.length !== prevProps.records.length) {
        this._autoscroll();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-output' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-output-header padded' },
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn btn-sm icon inline-block btn-secondary pull-right',
              onClick: this._handleClearButtonClick
            },
            'Clear'
          )
        ),
        _reactForAtom.React.createElement(
          'div',
          {
            className: 'nuclide-output-table-wrapper',
            ref: this._handleTableWrapper,
            onScroll: this._handleScroll
          },
          this.props.records.map(this._renderRow, this)
        )
      );
    }
  }, {
    key: '_handleScroll',
    value: function _handleScroll(event) {
      this._userIsScrolling = true;
      this._handleScrollEnd();
    }
  }, {
    key: '_handleScrollEnd',
    value: function _handleScrollEnd() {
      this._userIsScrolling = false;

      if (!this._tableWrapper) {
        return;
      }

      var _tableWrapper = this._tableWrapper;
      var scrollTop = _tableWrapper.scrollTop;
      var scrollHeight = _tableWrapper.scrollHeight;
      var offsetHeight = _tableWrapper.offsetHeight;

      this._isScrolledToBottom = scrollHeight - (offsetHeight + scrollTop) < 5;
    }
  }, {
    key: '_handleTableWrapper',
    value: function _handleTableWrapper(el) {
      this._tableWrapper = el;
      this._autoscroll();
    }
  }, {
    key: '_renderRow',
    value: function _renderRow(record, index) {
      return _reactForAtom.React.createElement(_RecordView2['default'], { key: index, record: record });
    }

    /**
     * Scroll to the bottom of the list if autoscroll is active.
     */
  }, {
    key: '_autoscroll',
    value: function _autoscroll() {
      if (!this._tableWrapper || this._userIsScrolling || !this._isScrolledToBottom) {
        return;
      }
      this._tableWrapper.scrollTop = this._tableWrapper.scrollHeight;
    }
  }, {
    key: '_handleClearButtonClick',
    value: function _handleClearButtonClick(event) {
      this._isScrolledToBottom = true;
      this.props.clearRecords();
    }
  }]);

  return OutputTable;
})(_reactForAtom.React.Component);

exports['default'] = OutputTable;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQzdFLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDO0tBQ2hFOzs7V0FFc0IsaUNBQUMsS0FBMEIsRUFBUTtBQUN4RCxVQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDM0I7OztTQXBGa0IsV0FBVztHQUFTLG9CQUFNLFNBQVM7O3FCQUFuQyxXQUFXIiwiZmlsZSI6Ik91dHB1dFRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQgdHlwZSB7UmVjb3JkfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVjb3JkVmlldyBmcm9tICcuL1JlY29yZFZpZXcnO1xuXG50eXBlIFByb3BzID0ge1xuICByZWNvcmRzOiBBcnJheTxSZWNvcmQ+O1xuICBjbGVhclJlY29yZHM6ICgpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPdXRwdXRUYWJsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuXG4gIF9pc1Njcm9sbGVkVG9Cb3R0b206IGJvb2xlYW47XG4gIF90YWJsZVdyYXBwZXI6ID9IVE1MRWxlbWVudDtcbiAgX3VzZXJJc1Njcm9sbGluZzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5faXNTY3JvbGxlZFRvQm90dG9tID0gdHJ1ZTtcbiAgICB0aGlzLl91c2VySXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ2xlYXJCdXR0b25DbGljayA9IHRoaXMuX2hhbmRsZUNsZWFyQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlVGFibGVXcmFwcGVyID0gdGhpcy5faGFuZGxlVGFibGVXcmFwcGVyLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNjcm9sbCA9IHRoaXMuX2hhbmRsZVNjcm9sbC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVTY3JvbGxFbmQgPSBkZWJvdW5jZSh0aGlzLl9oYW5kbGVTY3JvbGxFbmQsIDEwMCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIC8vIElmIHJlY29yZHMgYXJlIGFkZGVkIHdoaWxlIHdlJ3JlIHNjcm9sbGVkIHRvIHRoZSBib3R0b20gKG9yIHZlcnkgdmVyeSBjbG9zZSwgYXQgbGVhc3QpLFxuICAgIC8vIGF1dG9tYXRpY2FsbHkgc2Nyb2xsLlxuICAgIGlmICh0aGlzLnByb3BzLnJlY29yZHMubGVuZ3RoICE9PSBwcmV2UHJvcHMucmVjb3Jkcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2F1dG9zY3JvbGwoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1vdXRwdXRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLW91dHB1dC1oZWFkZXIgcGFkZGVkXCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1zbSBpY29uIGlubGluZS1ibG9jayBidG4tc2Vjb25kYXJ5IHB1bGwtcmlnaHRcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xlYXJCdXR0b25DbGlja31cbiAgICAgICAgICA+XG4gICAgICAgICAgICBDbGVhclxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtb3V0cHV0LXRhYmxlLXdyYXBwZXJcIlxuICAgICAgICAgIHJlZj17dGhpcy5faGFuZGxlVGFibGVXcmFwcGVyfVxuICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLl9oYW5kbGVTY3JvbGx9XG4gICAgICAgID5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5yZWNvcmRzLm1hcCh0aGlzLl9yZW5kZXJSb3csIHRoaXMpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlU2Nyb2xsKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5fdXNlcklzU2Nyb2xsaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl9oYW5kbGVTY3JvbGxFbmQoKTtcbiAgfVxuXG4gIF9oYW5kbGVTY3JvbGxFbmQoKTogdm9pZCB7XG4gICAgdGhpcy5fdXNlcklzU2Nyb2xsaW5nID0gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMuX3RhYmxlV3JhcHBlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtzY3JvbGxUb3AsIHNjcm9sbEhlaWdodCwgb2Zmc2V0SGVpZ2h0fSA9IHRoaXMuX3RhYmxlV3JhcHBlcjtcbiAgICB0aGlzLl9pc1Njcm9sbGVkVG9Cb3R0b20gPSBzY3JvbGxIZWlnaHQgLSAob2Zmc2V0SGVpZ2h0ICsgc2Nyb2xsVG9wKSA8IDU7XG4gIH1cblxuICBfaGFuZGxlVGFibGVXcmFwcGVyKGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuX3RhYmxlV3JhcHBlciA9IGVsO1xuICAgIHRoaXMuX2F1dG9zY3JvbGwoKTtcbiAgfVxuXG4gIF9yZW5kZXJSb3cocmVjb3JkOiBSZWNvcmQsIGluZGV4OiBudW1iZXIpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiA8UmVjb3JkVmlldyBrZXk9e2luZGV4fSByZWNvcmQ9e3JlY29yZH0gLz47XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIGxpc3QgaWYgYXV0b3Njcm9sbCBpcyBhY3RpdmUuXG4gICAqL1xuICBfYXV0b3Njcm9sbCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3RhYmxlV3JhcHBlciB8fCB0aGlzLl91c2VySXNTY3JvbGxpbmcgfHwgIXRoaXMuX2lzU2Nyb2xsZWRUb0JvdHRvbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl90YWJsZVdyYXBwZXIuc2Nyb2xsVG9wID0gdGhpcy5fdGFibGVXcmFwcGVyLnNjcm9sbEhlaWdodDtcbiAgfVxuXG4gIF9oYW5kbGVDbGVhckJ1dHRvbkNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5faXNTY3JvbGxlZFRvQm90dG9tID0gdHJ1ZTtcbiAgICB0aGlzLnByb3BzLmNsZWFyUmVjb3JkcygpO1xuICB9XG5cbn1cbiJdfQ==