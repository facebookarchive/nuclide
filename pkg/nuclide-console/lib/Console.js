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

var _nuclideCommons = require('../../nuclide-commons');

var _reactForAtom = require('react-for-atom');

var _OutputTable = require('./OutputTable');

var _OutputTable2 = _interopRequireDefault(_OutputTable);

var _ConsoleHeader = require('./ConsoleHeader');

var _ConsoleHeader2 = _interopRequireDefault(_ConsoleHeader);

var _InputArea = require('./InputArea');

var _InputArea2 = _interopRequireDefault(_InputArea);

var _PromptButton = require('./PromptButton');

var _PromptButton2 = _interopRequireDefault(_PromptButton);

var _RecordView = require('./RecordView');

var _RecordView2 = _interopRequireDefault(_RecordView);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var Console = (function (_React$Component) {
  _inherits(Console, _React$Component);

  function Console(props) {
    _classCallCheck(this, Console);

    _get(Object.getPrototypeOf(Console.prototype), 'constructor', this).call(this, props);
    this._isScrolledToBottom = true;
    this._userIsScrolling = false;
    this._handleScrollPane = this._handleScrollPane.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._handleScrollEnd = (0, _nuclideCommons.debounce)(this._handleScrollEnd, 100);
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
    key: '_renderPromptButton',
    value: function _renderPromptButton() {
      (0, _assert2['default'])(this.props.currentExecutor != null);
      var currentExecutor = this.props.currentExecutor;

      var options = Array.from(this.props.executors.values()).map(function (executor) {
        return {
          id: executor.id,
          label: executor.name
        };
      });
      return _reactForAtom.React.createElement(_PromptButton2['default'], {
        value: currentExecutor.id,
        onChange: this.props.selectExecutor,
        options: options,
        children: currentExecutor.name
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-console' },
        _reactForAtom.React.createElement(_ConsoleHeader2['default'], { clear: this.props.clearRecords }),
        _reactForAtom.React.createElement(
          'div',
          {
            ref: this._handleScrollPane,
            className: 'nuclide-console-scroll-pane',
            onScroll: this._handleScroll },
          _reactForAtom.React.createElement(_OutputTable2['default'], { records: this.props.records })
        ),
        this._renderPrompt()
      );
    }
  }, {
    key: '_renderPrompt',
    value: function _renderPrompt() {
      var currentExecutor = this.props.currentExecutor;

      if (currentExecutor == null) {
        return;
      }
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-console-prompt' },
        this._renderPromptButton(),
        _reactForAtom.React.createElement(_InputArea2['default'], {
          scopeName: currentExecutor.scopeName,
          onSubmit: this.props.execute
        })
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
//# sourceMappingURL=data:application/json;base64,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LFdBQVcsQ0FBQyxZQUFZLENBQUM7S0FDNUQ7OztTQTlHa0IsT0FBTztHQUFTLG9CQUFNLFNBQVM7O3FCQUEvQixPQUFPIiwiZmlsZSI6IkNvbnNvbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVjb3JkLCBFeGVjdXRvcn0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgT3V0cHV0VGFibGUgZnJvbSAnLi9PdXRwdXRUYWJsZSc7XG5pbXBvcnQgQ29uc29sZUhlYWRlciBmcm9tICcuL0NvbnNvbGVIZWFkZXInO1xuaW1wb3J0IElucHV0QXJlYSBmcm9tICcuL0lucHV0QXJlYSc7XG5pbXBvcnQgUHJvbXB0QnV0dG9uIGZyb20gJy4vUHJvbXB0QnV0dG9uJztcbmltcG9ydCBSZWNvcmRWaWV3IGZyb20gJy4vUmVjb3JkVmlldyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHJlY29yZHM6IEFycmF5PFJlY29yZD47XG4gIGNsZWFyUmVjb3JkczogKCkgPT4gdm9pZDtcbiAgZXhlY3V0ZTogKGNvZGU6IHN0cmluZykgPT4gdm9pZDtcbiAgY3VycmVudEV4ZWN1dG9yOiA/RXhlY3V0b3I7XG4gIGV4ZWN1dG9yczogTWFwPHN0cmluZywgRXhlY3V0b3I+O1xuICBzZWxlY3RFeGVjdXRvcjogKGV4ZWN1dG9ySWQ6IHN0cmluZykgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnNvbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX2lzU2Nyb2xsZWRUb0JvdHRvbTogYm9vbGVhbjtcbiAgX3Njcm9sbFBhbmU6ID9IVE1MRWxlbWVudDtcbiAgX3VzZXJJc1Njcm9sbGluZzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5faXNTY3JvbGxlZFRvQm90dG9tID0gdHJ1ZTtcbiAgICB0aGlzLl91c2VySXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAodGhpczogYW55KS5faGFuZGxlU2Nyb2xsUGFuZSA9IHRoaXMuX2hhbmRsZVNjcm9sbFBhbmUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlU2Nyb2xsID0gdGhpcy5faGFuZGxlU2Nyb2xsLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNjcm9sbEVuZCA9IGRlYm91bmNlKHRoaXMuX2hhbmRsZVNjcm9sbEVuZCwgMTAwKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMucmVjb3Jkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX2lzU2Nyb2xsZWRUb0JvdHRvbSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gSWYgcmVjb3JkcyBhcmUgYWRkZWQgd2hpbGUgd2UncmUgc2Nyb2xsZWQgdG8gdGhlIGJvdHRvbSAob3IgdmVyeSB2ZXJ5IGNsb3NlLCBhdCBsZWFzdCksXG4gICAgLy8gYXV0b21hdGljYWxseSBzY3JvbGwuXG4gICAgaWYgKHRoaXMucHJvcHMucmVjb3Jkcy5sZW5ndGggIT09IHByZXZQcm9wcy5yZWNvcmRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fYXV0b3Njcm9sbCgpO1xuICAgIH1cbiAgfVxuXG4gIF9yZW5kZXJQcm9tcHRCdXR0b24oKTogUmVhY3QuRWxlbWVudCB7XG4gICAgaW52YXJpYW50KHRoaXMucHJvcHMuY3VycmVudEV4ZWN1dG9yICE9IG51bGwpO1xuICAgIGNvbnN0IHtjdXJyZW50RXhlY3V0b3J9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbSh0aGlzLnByb3BzLmV4ZWN1dG9ycy52YWx1ZXMoKSlcbiAgICAgIC5tYXAoZXhlY3V0b3IgPT4gKHtcbiAgICAgICAgaWQ6IGV4ZWN1dG9yLmlkLFxuICAgICAgICBsYWJlbDogZXhlY3V0b3IubmFtZSxcbiAgICAgIH0pKTtcbiAgICByZXR1cm4gKFxuICAgICAgPFByb21wdEJ1dHRvblxuICAgICAgICB2YWx1ZT17Y3VycmVudEV4ZWN1dG9yLmlkfVxuICAgICAgICBvbkNoYW5nZT17dGhpcy5wcm9wcy5zZWxlY3RFeGVjdXRvcn1cbiAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgY2hpbGRyZW49e2N1cnJlbnRFeGVjdXRvci5uYW1lfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWNvbnNvbGVcIj5cbiAgICAgICAgPENvbnNvbGVIZWFkZXIgY2xlYXI9e3RoaXMucHJvcHMuY2xlYXJSZWNvcmRzfSAvPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXt0aGlzLl9oYW5kbGVTY3JvbGxQYW5lfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtY29uc29sZS1zY3JvbGwtcGFuZVwiXG4gICAgICAgICAgb25TY3JvbGw9e3RoaXMuX2hhbmRsZVNjcm9sbH0+XG4gICAgICAgICAgPE91dHB1dFRhYmxlIHJlY29yZHM9e3RoaXMucHJvcHMucmVjb3Jkc30gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJQcm9tcHQoKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyUHJvbXB0KCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB7Y3VycmVudEV4ZWN1dG9yfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGN1cnJlbnRFeGVjdXRvciA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtY29uc29sZS1wcm9tcHRcIj5cbiAgICAgICAge3RoaXMuX3JlbmRlclByb21wdEJ1dHRvbigpfVxuICAgICAgICA8SW5wdXRBcmVhXG4gICAgICAgICAgc2NvcGVOYW1lPXtjdXJyZW50RXhlY3V0b3Iuc2NvcGVOYW1lfVxuICAgICAgICAgIG9uU3VibWl0PXt0aGlzLnByb3BzLmV4ZWN1dGV9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVNjcm9sbChldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX3VzZXJJc1Njcm9sbGluZyA9IHRydWU7XG4gICAgdGhpcy5faGFuZGxlU2Nyb2xsRW5kKCk7XG4gIH1cblxuICBfaGFuZGxlU2Nyb2xsRW5kKCk6IHZvaWQge1xuICAgIHRoaXMuX3VzZXJJc1Njcm9sbGluZyA9IGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLl9zY3JvbGxQYW5lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3Njcm9sbFRvcCwgc2Nyb2xsSGVpZ2h0LCBvZmZzZXRIZWlnaHR9ID0gdGhpcy5fc2Nyb2xsUGFuZTtcbiAgICB0aGlzLl9pc1Njcm9sbGVkVG9Cb3R0b20gPSBzY3JvbGxIZWlnaHQgLSAob2Zmc2V0SGVpZ2h0ICsgc2Nyb2xsVG9wKSA8IDU7XG4gIH1cblxuICBfaGFuZGxlU2Nyb2xsUGFuZShlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9zY3JvbGxQYW5lID0gZWw7XG4gICAgdGhpcy5fYXV0b3Njcm9sbCgpO1xuICB9XG5cbiAgX3JlbmRlclJvdyhyZWNvcmQ6IFJlY29yZCwgaW5kZXg6IG51bWJlcik6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiA8UmVjb3JkVmlldyBrZXk9e2luZGV4fSByZWNvcmQ9e3JlY29yZH0gLz47XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIGxpc3QgaWYgYXV0b3Njcm9sbCBpcyBhY3RpdmUuXG4gICAqL1xuICBfYXV0b3Njcm9sbCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3Njcm9sbFBhbmUgfHwgdGhpcy5fdXNlcklzU2Nyb2xsaW5nIHx8ICF0aGlzLl9pc1Njcm9sbGVkVG9Cb3R0b20pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsUGFuZS5zY3JvbGxUb3AgPSB0aGlzLl9zY3JvbGxQYW5lLnNjcm9sbEhlaWdodDtcbiAgfVxuXG59XG4iXX0=