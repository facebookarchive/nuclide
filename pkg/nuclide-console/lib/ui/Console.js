'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../../commons-node/debounce'));
}

var _reactForAtom = require('react-for-atom');

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

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Console = class Console extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      unseenMessages: false
    };
    this._shouldScrollToBottom = false;
    this._getExecutor = this._getExecutor.bind(this);
    this._getProvider = this._getProvider.bind(this);
    this._handleScrollPane = this._handleScrollPane.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._handleScrollEnd = (0, (_debounce || _load_debounce()).default)(this._handleScrollEnd, 100);
    this._scrollToBottom = this._scrollToBottom.bind(this);
  }

  componentDidUpdate(prevProps) {
    // If records are added while we're scrolled to the bottom (or very very close, at least),
    // automatically scroll.
    if (this._shouldScrollToBottom) {
      this._scrollToBottom();
    }
  }

  _renderPromptButton() {
    if (!(this.props.currentExecutor != null)) {
      throw new Error('Invariant violation: "this.props.currentExecutor != null"');
    }

    const currentExecutor = this.props.currentExecutor;

    const options = Array.from(this.props.executors.values()).map(executor => ({
      id: executor.id,
      label: executor.name
    }));
    return _reactForAtom.React.createElement((_PromptButton || _load_PromptButton()).default, {
      value: currentExecutor.id,
      onChange: this.props.selectExecutor,
      options: options,
      children: currentExecutor.name
    });
  }

  _isScrolledToBottom() {
    if (this._scrollPane == null) {
      return true;
    }
    var _scrollPane = this._scrollPane;
    const scrollTop = _scrollPane.scrollTop,
          scrollHeight = _scrollPane.scrollHeight,
          offsetHeight = _scrollPane.offsetHeight;

    return scrollHeight - (offsetHeight + scrollTop) < 5;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.records !== this.props.records) {
      const isScrolledToBottom = this._isScrolledToBottom();

      this._shouldScrollToBottom = isScrolledToBottom;

      // If we receive new messages after we've scrolled away from the bottom, show the
      // "new messages" notification.
      if (!isScrolledToBottom) {
        this.setState({ unseenMessages: true });
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(0, (_shallowequal || _load_shallowequal()).default)(this.props, nextProps) || !(0, (_shallowequal || _load_shallowequal()).default)(this.state, nextState);
  }

  _getExecutor(id) {
    return this.props.executors.get(id);
  }

  _getProvider(id) {
    return this.props.getProvider(id);
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-console' },
      _reactForAtom.React.createElement((_ConsoleHeader || _load_ConsoleHeader()).default, {
        clear: this.props.clearRecords,
        invalidFilterInput: this.props.invalidFilterInput,
        enableRegExpFilter: this.props.enableRegExpFilter,
        selectedSourceIds: this.props.selectedSourceIds,
        sources: this.props.sources,
        toggleRegExpFilter: this.props.toggleRegExpFilter,
        onFilterTextChange: this.props.updateFilterText,
        onSelectedSourcesChange: this.props.selectSources
      }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-console-body' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-console-scroll-pane-wrapper' },
          _reactForAtom.React.createElement(
            'div',
            {
              ref: this._handleScrollPane,
              className: 'nuclide-console-scroll-pane',
              onScroll: this._handleScroll },
            _reactForAtom.React.createElement((_OutputTable || _load_OutputTable()).default, {
              records: this.props.records,
              showSourceLabels: this.props.selectedSourceIds.length > 1,
              getExecutor: this._getExecutor,
              getProvider: this._getProvider
            })
          ),
          _reactForAtom.React.createElement((_UnseenMessagesNotification || _load_UnseenMessagesNotification()).default, {
            visible: this.state.unseenMessages,
            onClick: this._scrollToBottom
          })
        ),
        this._renderPrompt()
      )
    );
  }

  _renderPrompt() {
    const currentExecutor = this.props.currentExecutor;

    if (currentExecutor == null) {
      return;
    }
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-console-prompt' },
      this._renderPromptButton(),
      _reactForAtom.React.createElement((_InputArea || _load_InputArea()).default, {
        scopeName: currentExecutor.scopeName,
        onSubmit: this.props.execute,
        history: this.props.history
      })
    );
  }

  _handleScroll(event) {
    this._handleScrollEnd();
  }

  _handleScrollEnd() {
    if (!this._scrollPane) {
      return;
    }

    const isScrolledToBottom = this._isScrolledToBottom();
    this.setState({ unseenMessages: this.state.unseenMessages && !isScrolledToBottom });
  }

  _handleScrollPane(el) {
    this._scrollPane = el;
  }

  _scrollToBottom() {
    if (!this._scrollPane) {
      return;
    }
    // TODO: Animate?
    this._scrollPane.scrollTop = this._scrollPane.scrollHeight;
    this.setState({ unseenMessages: false });
  }

};
exports.default = Console;
module.exports = exports['default'];