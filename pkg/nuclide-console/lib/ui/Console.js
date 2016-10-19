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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeDebounce;

function _load_commonsNodeDebounce() {
  return _commonsNodeDebounce = _interopRequireDefault(require('../../../commons-node/debounce'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _OutputTable;

function _load_OutputTable() {
  return _OutputTable = _interopRequireDefault(require('./OutputTable'));
}

var _ConsoleHeader;

function _load_ConsoleHeader() {
  return _ConsoleHeader = _interopRequireDefault(require('./ConsoleHeader'));
}

var _InputArea;

function _load_InputArea() {
  return _InputArea = _interopRequireDefault(require('./InputArea'));
}

var _PromptButton;

function _load_PromptButton() {
  return _PromptButton = _interopRequireDefault(require('./PromptButton'));
}

var _UnseenMessagesNotification;

function _load_UnseenMessagesNotification() {
  return _UnseenMessagesNotification = _interopRequireDefault(require('./UnseenMessagesNotification'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var Console = (function (_React$Component) {
  _inherits(Console, _React$Component);

  function Console(props) {
    _classCallCheck(this, Console);

    _get(Object.getPrototypeOf(Console.prototype), 'constructor', this).call(this, props);
    this.state = {
      unseenMessages: false
    };
    this._shouldScrollToBottom = false;
    this._getExecutor = this._getExecutor.bind(this);
    this._getProvider = this._getProvider.bind(this);
    this._handleScrollPane = this._handleScrollPane.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._handleScrollEnd = (0, (_commonsNodeDebounce || _load_commonsNodeDebounce()).default)(this._handleScrollEnd, 100);
    this._scrollToBottom = this._scrollToBottom.bind(this);
  }

  _createClass(Console, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      // If records are added while we're scrolled to the bottom (or very very close, at least),
      // automatically scroll.
      if (this._shouldScrollToBottom) {
        this._scrollToBottom();
      }
    }
  }, {
    key: '_renderPromptButton',
    value: function _renderPromptButton() {
      (0, (_assert || _load_assert()).default)(this.props.currentExecutor != null);
      var currentExecutor = this.props.currentExecutor;

      var options = Array.from(this.props.executors.values()).map(function (executor) {
        return {
          id: executor.id,
          label: executor.name
        };
      });
      return (_reactForAtom || _load_reactForAtom()).React.createElement((_PromptButton || _load_PromptButton()).default, {
        value: currentExecutor.id,
        onChange: this.props.selectExecutor,
        options: options,
        children: currentExecutor.name
      });
    }
  }, {
    key: '_isScrolledToBottom',
    value: function _isScrolledToBottom() {
      if (this._scrollPane == null) {
        return true;
      }
      var _scrollPane = this._scrollPane;
      var scrollTop = _scrollPane.scrollTop;
      var scrollHeight = _scrollPane.scrollHeight;
      var offsetHeight = _scrollPane.offsetHeight;

      return scrollHeight - (offsetHeight + scrollTop) < 5;
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.records !== this.props.records) {
        var isScrolledToBottom = this._isScrolledToBottom();

        this._shouldScrollToBottom = isScrolledToBottom;

        // If we receive new messages after we've scrolled away from the bottom, show the
        // "new messages" notification.
        if (!isScrolledToBottom) {
          this.setState({ unseenMessages: true });
        }
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, (_shallowequal || _load_shallowequal()).default)(this.props, nextProps) || !(0, (_shallowequal || _load_shallowequal()).default)(this.state, nextState);
    }
  }, {
    key: '_getExecutor',
    value: function _getExecutor(id) {
      return this.props.executors.get(id);
    }
  }, {
    key: '_getProvider',
    value: function _getProvider(id) {
      return this.props.getProvider(id);
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-console' },
        (_reactForAtom || _load_reactForAtom()).React.createElement((_ConsoleHeader || _load_ConsoleHeader()).default, {
          clear: this.props.clearRecords,
          invalidFilterInput: this.props.invalidFilterInput,
          enableRegExpFilter: this.props.enableRegExpFilter,
          selectedSourceIds: this.props.selectedSourceIds,
          sources: this.props.sources,
          toggleRegExpFilter: this.props.toggleRegExpFilter,
          onFilterTextChange: this.props.updateFilterText,
          onSelectedSourcesChange: this.props.selectSources
        }),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-console-body' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-console-scroll-pane-wrapper' },
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'div',
              {
                ref: this._handleScrollPane,
                className: 'nuclide-console-scroll-pane',
                onScroll: this._handleScroll },
              (_reactForAtom || _load_reactForAtom()).React.createElement((_OutputTable || _load_OutputTable()).default, {
                records: this.props.records,
                showSourceLabels: this.props.selectedSourceIds.length > 1,
                getExecutor: this._getExecutor,
                getProvider: this._getProvider
              })
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement((_UnseenMessagesNotification || _load_UnseenMessagesNotification()).default, {
              visible: this.state.unseenMessages,
              onClick: this._scrollToBottom
            })
          ),
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
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-console-prompt' },
        this._renderPromptButton(),
        (_reactForAtom || _load_reactForAtom()).React.createElement((_InputArea || _load_InputArea()).default, {
          scopeName: currentExecutor.scopeName,
          onSubmit: this.props.execute,
          history: this.props.history
        })
      );
    }
  }, {
    key: '_handleScroll',
    value: function _handleScroll(event) {
      this._handleScrollEnd();
    }
  }, {
    key: '_handleScrollEnd',
    value: function _handleScrollEnd() {
      if (!this._scrollPane) {
        return;
      }

      var isScrolledToBottom = this._isScrolledToBottom();
      this.setState({ unseenMessages: this.state.unseenMessages && !isScrolledToBottom });
    }
  }, {
    key: '_handleScrollPane',
    value: function _handleScrollPane(el) {
      this._scrollPane = el;
    }
  }, {
    key: '_scrollToBottom',
    value: function _scrollToBottom() {
      if (!this._scrollPane) {
        return;
      }
      // TODO: Animate?
      this._scrollPane.scrollTop = this._scrollPane.scrollHeight;
      this.setState({ unseenMessages: false });
    }
  }]);

  return Console;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = Console;
module.exports = exports.default;
/*
 We need an extra wrapper element here in order to have the new messages notification stick
 to the bottom of the scrollable area (and not scroll with it).
*/