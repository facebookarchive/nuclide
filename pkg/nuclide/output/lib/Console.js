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

var _OutputTable = require('./OutputTable');

var _OutputTable2 = _interopRequireDefault(_OutputTable);

var _ConsoleHeader = require('./ConsoleHeader');

var _ConsoleHeader2 = _interopRequireDefault(_ConsoleHeader);

var _RecordView = require('./RecordView');

var _RecordView2 = _interopRequireDefault(_RecordView);

var Console = (function (_React$Component) {
  _inherits(Console, _React$Component);

  function Console(props) {
    _classCallCheck(this, Console);

    _get(Object.getPrototypeOf(Console.prototype), 'constructor', this).call(this, props);
    this._isScrolledToBottom = true;
    this._userIsScrolling = false;
    this._handleScrollPane = this._handleScrollPane.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._handleScrollEnd = (0, _commons.debounce)(this._handleScrollEnd, 100);
  }

  _createClass(Console, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.props.records.length === 0) {
        this._isScrolledToBottom = true;
      }

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
        _reactForAtom.React.createElement(_ConsoleHeader2['default'], { clear: this.props.clearRecords }),
        _reactForAtom.React.createElement(
          'div',
          {
            ref: this._handleScrollPane,
            className: 'nuclide-output-scroll-pane',
            onScroll: this._handleScroll },
          _reactForAtom.React.createElement(_OutputTable2['default'], { records: this.props.records })
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

      if (!this._scrollPane) {
        return;
      }

      var _scrollPane = this._scrollPane;
      var scrollTop = _scrollPane.scrollTop;
      var scrollHeight = _scrollPane.scrollHeight;
      var offsetHeight = _scrollPane.offsetHeight;

      this._isScrolledToBottom = scrollHeight - (offsetHeight + scrollTop) < 5;
    }
  }, {
    key: '_handleScrollPane',
    value: function _handleScrollPane(el) {
      this._scrollPane = el;
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
      if (!this._scrollPane || this._userIsScrolling || !this._isScrolledToBottom) {
        return;
      }
      this._scrollPane.scrollTop = this._scrollPane.scrollHeight;
    }
  }]);

  return Console;
})(_reactForAtom.React.Component);

exports['default'] = Console;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QW1CLEVBQUU7QUFDM0UsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUM7S0FDNUQ7OztTQTFFa0IsT0FBTztHQUFTLG9CQUFNLFNBQVM7O3FCQUEvQixPQUFPIiwiZmlsZSI6IkNvbnNvbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCB0eXBlIHtSZWNvcmR9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBPdXRwdXRUYWJsZSBmcm9tICcuL091dHB1dFRhYmxlJztcbmltcG9ydCBDb25zb2xlSGVhZGVyIGZyb20gJy4vQ29uc29sZUhlYWRlcic7XG5pbXBvcnQgUmVjb3JkVmlldyBmcm9tICcuL1JlY29yZFZpZXcnO1xuXG50eXBlIFByb3BzID0ge1xuICByZWNvcmRzOiBBcnJheTxSZWNvcmQ+O1xuICBjbGVhclJlY29yZHM6ICgpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25zb2xlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzLCB2b2lkPiB7XG5cbiAgX2lzU2Nyb2xsZWRUb0JvdHRvbTogYm9vbGVhbjtcbiAgX3Njcm9sbFBhbmU6ID9IVE1MRWxlbWVudDtcbiAgX3VzZXJJc1Njcm9sbGluZzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5faXNTY3JvbGxlZFRvQm90dG9tID0gdHJ1ZTtcbiAgICB0aGlzLl91c2VySXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAodGhpczogYW55KS5faGFuZGxlU2Nyb2xsUGFuZSA9IHRoaXMuX2hhbmRsZVNjcm9sbFBhbmUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlU2Nyb2xsID0gdGhpcy5faGFuZGxlU2Nyb2xsLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNjcm9sbEVuZCA9IGRlYm91bmNlKHRoaXMuX2hhbmRsZVNjcm9sbEVuZCwgMTAwKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMucmVjb3Jkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX2lzU2Nyb2xsZWRUb0JvdHRvbSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gSWYgcmVjb3JkcyBhcmUgYWRkZWQgd2hpbGUgd2UncmUgc2Nyb2xsZWQgdG8gdGhlIGJvdHRvbSAob3IgdmVyeSB2ZXJ5IGNsb3NlLCBhdCBsZWFzdCksXG4gICAgLy8gYXV0b21hdGljYWxseSBzY3JvbGwuXG4gICAgaWYgKHRoaXMucHJvcHMucmVjb3Jkcy5sZW5ndGggIT09IHByZXZQcm9wcy5yZWNvcmRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fYXV0b3Njcm9sbCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLW91dHB1dFwiPlxuICAgICAgICA8Q29uc29sZUhlYWRlciBjbGVhcj17dGhpcy5wcm9wcy5jbGVhclJlY29yZHN9IC8+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3RoaXMuX2hhbmRsZVNjcm9sbFBhbmV9XG4gICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1vdXRwdXQtc2Nyb2xsLXBhbmVcIlxuICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLl9oYW5kbGVTY3JvbGx9PlxuICAgICAgICAgIDxPdXRwdXRUYWJsZSByZWNvcmRzPXt0aGlzLnByb3BzLnJlY29yZHN9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVTY3JvbGwoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl91c2VySXNTY3JvbGxpbmcgPSB0cnVlO1xuICAgIHRoaXMuX2hhbmRsZVNjcm9sbEVuZCgpO1xuICB9XG5cbiAgX2hhbmRsZVNjcm9sbEVuZCgpOiB2b2lkIHtcbiAgICB0aGlzLl91c2VySXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuICAgIGlmICghdGhpcy5fc2Nyb2xsUGFuZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtzY3JvbGxUb3AsIHNjcm9sbEhlaWdodCwgb2Zmc2V0SGVpZ2h0fSA9IHRoaXMuX3Njcm9sbFBhbmU7XG4gICAgdGhpcy5faXNTY3JvbGxlZFRvQm90dG9tID0gc2Nyb2xsSGVpZ2h0IC0gKG9mZnNldEhlaWdodCArIHNjcm9sbFRvcCkgPCA1O1xuICB9XG5cbiAgX2hhbmRsZVNjcm9sbFBhbmUoZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5fc2Nyb2xsUGFuZSA9IGVsO1xuICAgIHRoaXMuX2F1dG9zY3JvbGwoKTtcbiAgfVxuXG4gIF9yZW5kZXJSb3cocmVjb3JkOiBSZWNvcmQsIGluZGV4OiBudW1iZXIpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiA8UmVjb3JkVmlldyBrZXk9e2luZGV4fSByZWNvcmQ9e3JlY29yZH0gLz47XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIGxpc3QgaWYgYXV0b3Njcm9sbCBpcyBhY3RpdmUuXG4gICAqL1xuICBfYXV0b3Njcm9sbCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3Njcm9sbFBhbmUgfHwgdGhpcy5fdXNlcklzU2Nyb2xsaW5nIHx8ICF0aGlzLl9pc1Njcm9sbGVkVG9Cb3R0b20pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsUGFuZS5zY3JvbGxUb3AgPSB0aGlzLl9zY3JvbGxQYW5lLnNjcm9sbEhlaWdodDtcbiAgfVxuXG59XG4iXX0=