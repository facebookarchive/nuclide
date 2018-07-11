"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _FilteredMessagesReminder() {
  const data = _interopRequireDefault(require("./FilteredMessagesReminder"));

  _FilteredMessagesReminder = function () {
    return data;
  };

  return data;
}

function _OutputTable() {
  const data = _interopRequireDefault(require("./OutputTable"));

  _OutputTable = function () {
    return data;
  };

  return data;
}

function _ConsoleHeader() {
  const data = _interopRequireDefault(require("./ConsoleHeader"));

  _ConsoleHeader = function () {
    return data;
  };

  return data;
}

function _InputArea() {
  const data = _interopRequireDefault(require("./InputArea"));

  _InputArea = function () {
    return data;
  };

  return data;
}

function _PromptButton() {
  const data = _interopRequireDefault(require("./PromptButton"));

  _PromptButton = function () {
    return data;
  };

  return data;
}

function _NewMessagesNotification() {
  const data = _interopRequireDefault(require("./NewMessagesNotification"));

  _NewMessagesNotification = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _recordsChanged() {
  const data = _interopRequireDefault(require("../recordsChanged"));

  _recordsChanged = function () {
    return data;
  };

  return data;
}

function _StyleSheet() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/StyleSheet"));

  _StyleSheet = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// Maximum time (ms) for the console to try scrolling to the bottom.
const MAXIMUM_SCROLLING_TIME = 3000;
let count = 0;

class ConsoleView extends React.Component {
  // Used when _scrollToBottom is called. The console optimizes message loading
  // so scrolling to the bottom once doesn't always scroll to the bottom since
  // more messages can be loaded after.
  constructor(props) {
    super(props);

    this._getExecutor = id => {
      return this.props.executors.get(id);
    };

    this._getProvider = id => {
      return this.props.getProvider(id);
    };

    this._executePrompt = code => {
      this.props.execute(code); // Makes the console to scroll to the bottom.

      this._isScrolledNearBottom = true;
    };

    this._handleScroll = (offsetHeight, scrollHeight, scrollTop) => {
      this._handleScrollEnd(offsetHeight, scrollHeight, scrollTop);
    };

    this._handleOutputTable = ref => {
      this._outputTable = ref;
    };

    this._scrollToBottom = () => {
      if (!this._outputTable) {
        return;
      }

      this._outputTable.scrollToBottom();

      this.setState({
        unseenMessages: false
      });
    };

    this._startScrollToBottom = () => {
      if (!this._continuouslyScrollToBottom) {
        this._continuouslyScrollToBottom = true;
        this._scrollingThrottle = _RxMin.Observable.timer(MAXIMUM_SCROLLING_TIME).subscribe(() => {
          this._stopScrollToBottom();
        });
      }

      this._scrollToBottom();
    };

    this._stopScrollToBottom = () => {
      this._continuouslyScrollToBottom = false;

      if (this._scrollingThrottle != null) {
        this._scrollingThrottle.unsubscribe();
      }
    };

    this._shouldScrollToBottom = () => {
      return this._isScrolledNearBottom || this._continuouslyScrollToBottom;
    };

    this.state = {
      unseenMessages: false
    };
    this._disposables = new (_UniversalDisposable().default)();
    this._isScrolledNearBottom = true;
    this._continuouslyScrollToBottom = false;
    this._id = count++;
  }

  componentDidMount() {
    this._disposables.add( // Wait for `<OutputTable />` to render itself via react-virtualized before scrolling and
    // re-measuring; Otherwise, the scrolled location will be inaccurate, preventing the Console
    // from auto-scrolling.
    _observable().macrotask.subscribe(() => {
      this._startScrollToBottom();
    }), () => {
      if (this._scrollingThrottle != null) {
        this._scrollingThrottle.unsubscribe();
      }
    }, atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/atom-apis
      'atom-ide-console:focus-console-prompt': () => {
        if (this._inputArea != null) {
          this._inputArea.focus();
        }
      }
    }), atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/atom-apis
      'atom-ide-console:scroll-to-bottom': () => {
        this._scrollToBottom();
      }
    }), atom.commands.add((0, _nullthrows().default)(this._consoleScrollPaneEl), 'atom-ide:filter', () => this._focusFilter()));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  componentDidUpdate(prevProps) {
    // If records are added while we're scrolled to the bottom (or very very close, at least),
    // automatically scroll.
    if (this._isScrolledNearBottom && (0, _recordsChanged().default)(prevProps.displayableRecords, this.props.displayableRecords)) {
      this._startScrollToBottom();
    }
  }

  _focusFilter() {
    if (this._consoleHeaderComponent != null) {
      this._consoleHeaderComponent.focusFilter();
    }
  }

  _renderPromptButton() {
    if (!(this.props.currentExecutor != null)) {
      throw new Error("Invariant violation: \"this.props.currentExecutor != null\"");
    }

    const {
      currentExecutor
    } = this.props;
    const options = Array.from(this.props.executors.values()).map(executor => ({
      id: executor.id,
      label: executor.name
    }));
    return React.createElement(_PromptButton().default, {
      value: currentExecutor.id,
      onChange: this.props.selectExecutor,
      options: options,
      children: currentExecutor.name
    });
  }

  _isScrolledToBottom(offsetHeight, scrollHeight, scrollTop) {
    return scrollHeight - (offsetHeight + scrollTop) < 5;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // If the messages were cleared, hide the notification.
    if (nextProps.displayableRecords.length === 0) {
      this._isScrolledNearBottom = true;
      this.setState({
        unseenMessages: false
      });
    } else if ( // If we receive new messages after we've scrolled away from the bottom, show the "new
    // messages" notification.
    !this._isScrolledNearBottom && (0, _recordsChanged().default)(this.props.displayableRecords, nextProps.displayableRecords)) {
      this.setState({
        unseenMessages: true
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(0, _shallowequal().default)(this.props, nextProps) || !(0, _shallowequal().default)(this.state, nextState);
  }

  render() {
    return React.createElement("div", {
      className: "console"
    }, React.createElement(_StyleSheet().default, {
      sourcePath: "console-font-style",
      priority: -1,
      css: `
            #console-font-size-${this._id} {
              font-size: ${this.props.fontSize}px;
            }
          `
    }), React.createElement(_ConsoleHeader().default, {
      clear: this.props.clearRecords,
      createPaste: this.props.createPaste,
      invalidFilterInput: this.props.invalidFilterInput,
      enableRegExpFilter: this.props.enableRegExpFilter,
      filterText: this.props.filterText,
      ref: component => this._consoleHeaderComponent = component,
      selectedSourceIds: this.props.selectedSourceIds,
      sources: this.props.sources,
      onFilterChange: this.props.updateFilter,
      onSelectedSourcesChange: this.props.selectSources
    }), React.createElement("div", {
      className: "console-body",
      id: 'console-font-size-' + this._id
    }, React.createElement("div", {
      className: "console-scroll-pane-wrapper atom-ide-filterable",
      ref: el => this._consoleScrollPaneEl = el
    }, React.createElement(_FilteredMessagesReminder().default, {
      filteredRecordCount: this.props.filteredRecordCount,
      onReset: this.props.resetAllFilters
    }), React.createElement(_OutputTable().default // $FlowFixMe(>=0.53.0) Flow suppress
    , {
      ref: this._handleOutputTable,
      displayableRecords: this.props.displayableRecords,
      showSourceLabels: this.props.selectedSourceIds.length > 1,
      fontSize: this.props.fontSize,
      getExecutor: this._getExecutor,
      getProvider: this._getProvider,
      onScroll: this._handleScroll,
      onDisplayableRecordHeightChange: this.props.onDisplayableRecordHeightChange,
      shouldScrollToBottom: this._shouldScrollToBottom
    }), React.createElement(_NewMessagesNotification().default, {
      visible: this.state.unseenMessages,
      onClick: this._startScrollToBottom
    })), this._renderPrompt()));
  }

  _getMultiLineTip() {
    const {
      currentExecutor
    } = this.props;

    if (currentExecutor == null) {
      return '';
    }

    const keyCombo = process.platform === 'darwin' ? // Option + Enter on Mac
    '\u2325  + \u23CE' : // Shift + Enter on Windows and Linux.
    'Shift + Enter';
    return `Tip: ${keyCombo} to insert a newline`;
  }

  _renderPrompt() {
    const {
      currentExecutor
    } = this.props;

    if (currentExecutor == null) {
      return;
    }

    return React.createElement("div", {
      className: "console-prompt"
    }, this._renderPromptButton(), React.createElement(_InputArea().default, {
      ref: component => this._inputArea = component,
      scopeName: currentExecutor.scopeName,
      onSubmit: this._executePrompt,
      history: this.props.history,
      watchEditor: this.props.watchEditor,
      placeholderText: this._getMultiLineTip()
    }));
  }

  _handleScrollEnd(offsetHeight, scrollHeight, scrollTop) {
    const isScrolledToBottom = this._isScrolledToBottom(offsetHeight, scrollHeight, scrollTop);

    this._isScrolledNearBottom = isScrolledToBottom;

    this._stopScrollToBottom();

    this.setState({
      // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      unseenMessages: this.state.unseenMessages && !this._isScrolledNearBottom
    });
  }

}

exports.default = ConsoleView;