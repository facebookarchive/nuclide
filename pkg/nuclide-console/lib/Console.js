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