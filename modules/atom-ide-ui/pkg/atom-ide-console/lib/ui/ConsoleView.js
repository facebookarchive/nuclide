'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _observable;





















function _load_observable() {return _observable = require('nuclide-commons/observable');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));}var _debounce;
function _load_debounce() {return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));}
var _react = _interopRequireWildcard(require('react'));
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _FilteredMessagesReminder;
function _load_FilteredMessagesReminder() {return _FilteredMessagesReminder = _interopRequireDefault(require('./FilteredMessagesReminder'));}var _OutputTable;
function _load_OutputTable() {return _OutputTable = _interopRequireDefault(require('./OutputTable'));}var _ConsoleHeader;
function _load_ConsoleHeader() {return _ConsoleHeader = _interopRequireDefault(require('./ConsoleHeader'));}var _InputArea;
function _load_InputArea() {return _InputArea = _interopRequireDefault(require('./InputArea'));}var _PromptButton;
function _load_PromptButton() {return _PromptButton = _interopRequireDefault(require('./PromptButton'));}var _NewMessagesNotification;
function _load_NewMessagesNotification() {return _NewMessagesNotification = _interopRequireDefault(require('./NewMessagesNotification'));}var _shallowequal;

function _load_shallowequal() {return _shallowequal = _interopRequireDefault(require('shallowequal'));}var _recordsChanged;
function _load_recordsChanged() {return _recordsChanged = _interopRequireDefault(require('../recordsChanged'));}var _StyleSheet;
function _load_StyleSheet() {return _StyleSheet = _interopRequireDefault(require('nuclide-commons-ui/StyleSheet'));}var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}






























// Maximum time (ms) for the console to try scrolling to the bottom.
const MAXIMUM_SCROLLING_TIME = 3000; /**
                                      * Copyright (c) 2017-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the BSD-style license found in the
                                      * LICENSE file in the root directory of this source tree. An additional grant
                                      * of patent rights can be found in the PATENTS file in the same directory.
                                      *
                                      * 
                                      * @format
                                      */let count = 0;class ConsoleView extends _react.Component {






  constructor(props) {
    super(props);this.































































































    _getExecutor = id => {
      return this.props.executors.get(id);
    };this.

    _getProvider = id => {
      return this.props.getProvider(id);
    };this.














































































































    _executePrompt = code => {
      this.props.execute(code);
      // Makes the console to scroll to the bottom.
      this._isScrolledNearBottom = true;
    };this.

    _handleScroll = (
    offsetHeight,
    scrollHeight,
    scrollTop) =>
    {
      this._handleScrollEnd(offsetHeight, scrollHeight, scrollTop);
    };this.
























    _handleOutputTable = ref => {
      this._outputTable = ref;
    };this.

    _scrollToBottom = () => {
      if (!this._outputTable) {
        return;
      }

      this._outputTable.scrollToBottom();

      this.setState({ unseenMessages: false });
    };this.

    _startScrollToBottom = () => {
      if (!this._continuouslyScrollToBottom) {
        this._continuouslyScrollToBottom = true;

        this._scrollingThrottle = _rxjsBundlesRxMinJs.Observable.timer(
        MAXIMUM_SCROLLING_TIME).
        subscribe(() => {
          this._stopScrollToBottom();
        });
      }

      this._scrollToBottom();
    };this.

    _stopScrollToBottom = () => {
      this._continuouslyScrollToBottom = false;
      if (this._scrollingThrottle != null) {
        this._scrollingThrottle.unsubscribe();
      }
    };this.

    _shouldScrollToBottom = () => {
      return this._isScrolledNearBottom || this._continuouslyScrollToBottom;
    };this.state = { unseenMessages: false, promptBufferChanged: false };this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();this._isScrolledNearBottom = true;this._continuouslyScrollToBottom = false;this._handleScrollEnd = (0, (_debounce || _load_debounce()).default)(this._handleScrollEnd, 100);this._id = count++;} // Used when _scrollToBottom is called. The console optimizes message loading
  // so scrolling to the bottom once doesn't always scroll to the bottom since
  // more messages can be loaded after.
  componentDidMount() {this._disposables.add( // Wait for `<OutputTable />` to render itself via react-virtualized before scrolling and
    // re-measuring; Otherwise, the scrolled location will be inaccurate, preventing the Console
    // from auto-scrolling.
    (_observable || _load_observable()).macrotask.subscribe(() => {this._startScrollToBottom();}), () => {if (this._scrollingThrottle != null) {this._scrollingThrottle.unsubscribe();}});}componentWillUnmount() {this._disposables.dispose();}componentDidUpdate(prevProps) {// If records are added while we're scrolled to the bottom (or very very close, at least),
    // automatically scroll.
    if (this._isScrolledNearBottom && (0, (_recordsChanged || _load_recordsChanged()).default)(prevProps.displayableRecords, this.props.displayableRecords)) {this._startScrollToBottom();}}_renderPromptButton() {if (!(this.props.currentExecutor != null)) {throw new Error('Invariant violation: "this.props.currentExecutor != null"');}const { currentExecutor } = this.props;const options = Array.from(this.props.executors.values()).map(executor => ({ id: executor.id, label: executor.name }));return _react.createElement((_PromptButton || _load_PromptButton()).default, { value: currentExecutor.id, onChange: this.props.selectExecutor, options: options, children: currentExecutor.name });}_isScrolledToBottom(offsetHeight, scrollHeight, scrollTop) {return scrollHeight - (offsetHeight + scrollTop) < 5;}componentWillReceiveProps(nextProps) {// If the messages were cleared, hide the notification.
    if (nextProps.displayableRecords.length === 0) {this._isScrolledNearBottom = true;this.setState({ unseenMessages: false });} else if ( // If we receive new messages after we've scrolled away from the bottom, show the "new
    // messages" notification.
    !this._isScrolledNearBottom && (0, (_recordsChanged || _load_recordsChanged()).default)(this.props.displayableRecords, nextProps.displayableRecords)) {this.setState({ unseenMessages: true });}}shouldComponentUpdate(nextProps, nextState) {return !(0, (_shallowequal || _load_shallowequal()).default)(this.props, nextProps) || !(0, (_shallowequal || _load_shallowequal()).default)(this.state, nextState);}render() {return _react.createElement('div', { className: 'console' }, _react.createElement((_StyleSheet || _load_StyleSheet()).default, { sourcePath: 'console-font-style', priority: -1, css: `
            #console-font-size-${this._id} {
              font-size: ${this.props.fontSize}px;
            }
          ` }), _react.createElement((_ConsoleHeader || _load_ConsoleHeader()).default, { clear: this.props.clearRecords, createPaste: this.props.createPaste, invalidFilterInput: this.props.invalidFilterInput, enableRegExpFilter: this.props.enableRegExpFilter, filterText: this.props.filterText, selectedSourceIds: this.props.selectedSourceIds, sources: this.props.sources, onFilterChange: this.props.updateFilter, onSelectedSourcesChange: this.props.selectSources }), _react.createElement('div', { className: 'console-body', id: 'console-font-size-' + this._id }, _react.createElement('div', { className: 'console-scroll-pane-wrapper' }, _react.createElement((_FilteredMessagesReminder || _load_FilteredMessagesReminder()).default, { filteredRecordCount: this.props.filteredRecordCount, onReset: this.props.resetAllFilters }), _react.createElement((_OutputTable || _load_OutputTable()).default // $FlowFixMe(>=0.53.0) Flow suppress
          , { ref: this._handleOutputTable, displayableRecords: this.props.displayableRecords, showSourceLabels: this.props.selectedSourceIds.length > 1, fontSize: this.props.fontSize, getExecutor: this._getExecutor, getProvider: this._getProvider, onScroll: this._handleScroll, onDisplayableRecordHeightChange: this.props.onDisplayableRecordHeightChange, shouldScrollToBottom: this._shouldScrollToBottom }), _react.createElement((_NewMessagesNotification || _load_NewMessagesNotification()).default, { visible: this.state.unseenMessages, onClick: this._startScrollToBottom })), this._renderPrompt(), this._renderMultilineTip()));}_renderMultilineTip() {const { currentExecutor } = this.props;if (currentExecutor == null) {return;}const keyCombo = process.platform === 'darwin' ? // Option + Enter on Mac
    _react.createElement('span', null, '\u2325 + \u23CE') : // Shift + Enter on Windows and Linux.
    _react.createElement('span', null, 'Shift + Enter');return _react.createElement('div', { className: (0, (_classnames || _load_classnames()).default)('console-multiline-tip', this.state.promptBufferChanged ? 'console-multiline-tip-dim' : 'console-multiline-tip-not-dim') }, 'Tip: ', keyCombo, ' to insert a newline');}_renderPrompt() {const { currentExecutor } = this.props;if (currentExecutor == null) {return;}return _react.createElement('div', { className: 'console-prompt' }, this._renderPromptButton(), _react.createElement((_InputArea || _load_InputArea()).default, { scopeName: currentExecutor.scopeName, onSubmit: this._executePrompt, history: this.props.history, watchEditor: this.props.watchEditor, onDidTextBufferChange: () => {this.setState({ promptBufferChanged: true });} }));}_handleScrollEnd(offsetHeight, scrollHeight, scrollTop) {const isScrolledToBottom = this._isScrolledToBottom(offsetHeight, scrollHeight, scrollTop);if (this._continuouslyScrollToBottom && !isScrolledToBottom) {this._scrollToBottom();} else {this._isScrolledNearBottom = isScrolledToBottom;this._stopScrollToBottom();this.setState({ unseenMessages: this.state.unseenMessages && !this._isScrolledNearBottom });}}}exports.default = ConsoleView;