'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../../commons-node/debounce'));
}

var _react = _interopRequireDefault(require('react'));

var _FilteredMessagesReminder;

function _load_FilteredMessagesReminder() {
  return _FilteredMessagesReminder = _interopRequireDefault(require('./FilteredMessagesReminder'));
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

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Console extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      unseenMessages: false
    };
    this._isScrolledNearBottom = false;
    this._getExecutor = this._getExecutor.bind(this);
    this._getProvider = this._getProvider.bind(this);
    this._handleOutputTable = this._handleOutputTable.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._handleScrollEnd = (0, (_debounce || _load_debounce()).default)(this._handleScrollEnd, 100);
    this._scrollToBottom = this._scrollToBottom.bind(this);
  }

  componentDidUpdate(prevProps) {
    // If records are added while we're scrolled to the bottom (or very very close, at least),
    // automatically scroll.
    if (this._isScrolledNearBottom && this.props.displayableRecords.length > prevProps.displayableRecords.length) {
      this._scrollToBottom();
    }
  }

  _renderPromptButton() {
    if (!(this.props.currentExecutor != null)) {
      throw new Error('Invariant violation: "this.props.currentExecutor != null"');
    }

    const { currentExecutor } = this.props;
    const options = Array.from(this.props.executors.values()).map(executor => ({
      id: executor.id,
      label: executor.name
    }));
    return _react.default.createElement((_PromptButton || _load_PromptButton()).default, {
      value: currentExecutor.id,
      onChange: this.props.selectExecutor,
      options: options,
      children: currentExecutor.name
    });
  }

  _isScrolledToBottom(offsetHeight, scrollHeight, scrollTop) {
    return scrollHeight - (offsetHeight + scrollTop) < 5;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.displayableRecords.length > this.props.displayableRecords.length) {
      // If we receive new messages after we've scrolled away from the bottom, show the
      // "new messages" notification.
      if (!this._isScrolledNearBottom) {
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
    return _react.default.createElement(
      'div',
      { className: 'nuclide-console' },
      _react.default.createElement((_ConsoleHeader || _load_ConsoleHeader()).default, {
        clear: this.props.clearRecords,
        invalidFilterInput: this.props.invalidFilterInput,
        enableRegExpFilter: this.props.enableRegExpFilter,
        filterText: this.props.filterText,
        selectedSourceIds: this.props.selectedSourceIds,
        sources: this.props.sources,
        toggleRegExpFilter: this.props.toggleRegExpFilter,
        onFilterTextChange: this.props.updateFilterText,
        onSelectedSourcesChange: this.props.selectSources
      }),
      _react.default.createElement(
        'div',
        { className: 'nuclide-console-body' },
        _react.default.createElement(
          'div',
          { className: 'nuclide-console-scroll-pane-wrapper' },
          _react.default.createElement((_FilteredMessagesReminder || _load_FilteredMessagesReminder()).default, {
            filteredRecordCount: this.props.filteredRecordCount,
            onReset: this.props.resetAllFilters
          }),
          _react.default.createElement((_OutputTable || _load_OutputTable()).default, {
            ref: this._handleOutputTable,
            displayableRecords: this.props.displayableRecords,
            showSourceLabels: this.props.selectedSourceIds.length > 1,
            getExecutor: this._getExecutor,
            getProvider: this._getProvider,
            onScroll: this._handleScroll,
            onDisplayableRecordHeightChange: this.props.onDisplayableRecordHeightChange
          }),
          _react.default.createElement((_UnseenMessagesNotification || _load_UnseenMessagesNotification()).default, {
            visible: this.state.unseenMessages,
            onClick: this._scrollToBottom
          })
        ),
        this._renderPrompt()
      )
    );
  }

  _renderPrompt() {
    const { currentExecutor } = this.props;
    if (currentExecutor == null) {
      return;
    }
    return _react.default.createElement(
      'div',
      { className: 'nuclide-console-prompt' },
      this._renderPromptButton(),
      _react.default.createElement((_InputArea || _load_InputArea()).default, {
        scopeName: currentExecutor.scopeName,
        onSubmit: this.props.execute,
        history: this.props.history
      })
    );
  }

  _handleScroll(offsetHeight, scrollHeight, scrollTop) {
    this._handleScrollEnd(offsetHeight, scrollHeight, scrollTop);
  }

  _handleScrollEnd(offsetHeight, scrollHeight, scrollTop) {
    this._isScrolledNearBottom = this._isScrolledToBottom(offsetHeight, scrollHeight, scrollTop);
    this.setState({ unseenMessages: this.state.unseenMessages && !this._isScrolledNearBottom });
  }

  _handleOutputTable(ref) {
    this._outputTable = ref;
  }

  _scrollToBottom() {
    if (!this._outputTable) {
      return;
    }
    this._outputTable.scrollToBottom();
    this.setState({ unseenMessages: false });
  }
}
exports.default = Console;