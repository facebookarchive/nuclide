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

      var options = _nuclideCommons.array.from(this.props.executors.values()).map(function (executor) {
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
          _reactForAtom.React.createElement(_OutputTable2['default'], { records: this.props.records }),
          this._renderPrompt()
        )
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
//# sourceMappingURL=data:application/json;base64,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VyxDQUFDLFlBQVksQ0FBQztLQUM1RDs7O1NBOUdrQixPQUFPO0dBQVMsb0JBQU0sU0FBUzs7cUJBQS9CLE9BQU8iLCJmaWxlIjoiQ29uc29sZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZWNvcmQsIEV4ZWN1dG9yfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHthcnJheSwgZGVib3VuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgT3V0cHV0VGFibGUgZnJvbSAnLi9PdXRwdXRUYWJsZSc7XG5pbXBvcnQgQ29uc29sZUhlYWRlciBmcm9tICcuL0NvbnNvbGVIZWFkZXInO1xuaW1wb3J0IElucHV0QXJlYSBmcm9tICcuL0lucHV0QXJlYSc7XG5pbXBvcnQgUHJvbXB0QnV0dG9uIGZyb20gJy4vUHJvbXB0QnV0dG9uJztcbmltcG9ydCBSZWNvcmRWaWV3IGZyb20gJy4vUmVjb3JkVmlldyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHJlY29yZHM6IEFycmF5PFJlY29yZD47XG4gIGNsZWFyUmVjb3JkczogKCkgPT4gdm9pZDtcbiAgZXhlY3V0ZTogKGNvZGU6IHN0cmluZykgPT4gdm9pZDtcbiAgY3VycmVudEV4ZWN1dG9yOiA/RXhlY3V0b3I7XG4gIGV4ZWN1dG9yczogTWFwPHN0cmluZywgRXhlY3V0b3I+O1xuICBzZWxlY3RFeGVjdXRvcjogKGV4ZWN1dG9ySWQ6IHN0cmluZykgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnNvbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX2lzU2Nyb2xsZWRUb0JvdHRvbTogYm9vbGVhbjtcbiAgX3Njcm9sbFBhbmU6ID9IVE1MRWxlbWVudDtcbiAgX3VzZXJJc1Njcm9sbGluZzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5faXNTY3JvbGxlZFRvQm90dG9tID0gdHJ1ZTtcbiAgICB0aGlzLl91c2VySXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAodGhpczogYW55KS5faGFuZGxlU2Nyb2xsUGFuZSA9IHRoaXMuX2hhbmRsZVNjcm9sbFBhbmUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlU2Nyb2xsID0gdGhpcy5faGFuZGxlU2Nyb2xsLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNjcm9sbEVuZCA9IGRlYm91bmNlKHRoaXMuX2hhbmRsZVNjcm9sbEVuZCwgMTAwKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMucmVjb3Jkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX2lzU2Nyb2xsZWRUb0JvdHRvbSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gSWYgcmVjb3JkcyBhcmUgYWRkZWQgd2hpbGUgd2UncmUgc2Nyb2xsZWQgdG8gdGhlIGJvdHRvbSAob3IgdmVyeSB2ZXJ5IGNsb3NlLCBhdCBsZWFzdCksXG4gICAgLy8gYXV0b21hdGljYWxseSBzY3JvbGwuXG4gICAgaWYgKHRoaXMucHJvcHMucmVjb3Jkcy5sZW5ndGggIT09IHByZXZQcm9wcy5yZWNvcmRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fYXV0b3Njcm9sbCgpO1xuICAgIH1cbiAgfVxuXG4gIF9yZW5kZXJQcm9tcHRCdXR0b24oKTogUmVhY3RFbGVtZW50IHtcbiAgICBpbnZhcmlhbnQodGhpcy5wcm9wcy5jdXJyZW50RXhlY3V0b3IgIT0gbnVsbCk7XG4gICAgY29uc3Qge2N1cnJlbnRFeGVjdXRvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhcnJheS5mcm9tKHRoaXMucHJvcHMuZXhlY3V0b3JzLnZhbHVlcygpKVxuICAgICAgLm1hcChleGVjdXRvciA9PiAoe1xuICAgICAgICBpZDogZXhlY3V0b3IuaWQsXG4gICAgICAgIGxhYmVsOiBleGVjdXRvci5uYW1lLFxuICAgICAgfSkpO1xuICAgIHJldHVybiAoXG4gICAgICA8UHJvbXB0QnV0dG9uXG4gICAgICAgIHZhbHVlPXtjdXJyZW50RXhlY3V0b3IuaWR9XG4gICAgICAgIG9uQ2hhbmdlPXt0aGlzLnByb3BzLnNlbGVjdEV4ZWN1dG9yfVxuICAgICAgICBvcHRpb25zPXtvcHRpb25zfVxuICAgICAgICBjaGlsZHJlbj17Y3VycmVudEV4ZWN1dG9yLm5hbWV9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1jb25zb2xlXCI+XG4gICAgICAgIDxDb25zb2xlSGVhZGVyIGNsZWFyPXt0aGlzLnByb3BzLmNsZWFyUmVjb3Jkc30gLz5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17dGhpcy5faGFuZGxlU2Nyb2xsUGFuZX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWNvbnNvbGUtc2Nyb2xsLXBhbmVcIlxuICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLl9oYW5kbGVTY3JvbGx9PlxuICAgICAgICAgIDxPdXRwdXRUYWJsZSByZWNvcmRzPXt0aGlzLnByb3BzLnJlY29yZHN9IC8+XG4gICAgICAgICAge3RoaXMuX3JlbmRlclByb21wdCgpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyUHJvbXB0KCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtjdXJyZW50RXhlY3V0b3J9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoY3VycmVudEV4ZWN1dG9yID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1jb25zb2xlLXByb21wdFwiPlxuICAgICAgICB7dGhpcy5fcmVuZGVyUHJvbXB0QnV0dG9uKCl9XG4gICAgICAgIDxJbnB1dEFyZWFcbiAgICAgICAgICBzY29wZU5hbWU9e2N1cnJlbnRFeGVjdXRvci5zY29wZU5hbWV9XG4gICAgICAgICAgb25TdWJtaXQ9e3RoaXMucHJvcHMuZXhlY3V0ZX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlU2Nyb2xsKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5fdXNlcklzU2Nyb2xsaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl9oYW5kbGVTY3JvbGxFbmQoKTtcbiAgfVxuXG4gIF9oYW5kbGVTY3JvbGxFbmQoKTogdm9pZCB7XG4gICAgdGhpcy5fdXNlcklzU2Nyb2xsaW5nID0gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMuX3Njcm9sbFBhbmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7c2Nyb2xsVG9wLCBzY3JvbGxIZWlnaHQsIG9mZnNldEhlaWdodH0gPSB0aGlzLl9zY3JvbGxQYW5lO1xuICAgIHRoaXMuX2lzU2Nyb2xsZWRUb0JvdHRvbSA9IHNjcm9sbEhlaWdodCAtIChvZmZzZXRIZWlnaHQgKyBzY3JvbGxUb3ApIDwgNTtcbiAgfVxuXG4gIF9oYW5kbGVTY3JvbGxQYW5lKGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuX3Njcm9sbFBhbmUgPSBlbDtcbiAgICB0aGlzLl9hdXRvc2Nyb2xsKCk7XG4gIH1cblxuICBfcmVuZGVyUm93KHJlY29yZDogUmVjb3JkLCBpbmRleDogbnVtYmVyKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gPFJlY29yZFZpZXcga2V5PXtpbmRleH0gcmVjb3JkPXtyZWNvcmR9IC8+O1xuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbCB0byB0aGUgYm90dG9tIG9mIHRoZSBsaXN0IGlmIGF1dG9zY3JvbGwgaXMgYWN0aXZlLlxuICAgKi9cbiAgX2F1dG9zY3JvbGwoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9zY3JvbGxQYW5lIHx8IHRoaXMuX3VzZXJJc1Njcm9sbGluZyB8fCAhdGhpcy5faXNTY3JvbGxlZFRvQm90dG9tKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3Njcm9sbFBhbmUuc2Nyb2xsVG9wID0gdGhpcy5fc2Nyb2xsUGFuZS5zY3JvbGxIZWlnaHQ7XG4gIH1cblxufVxuIl19