"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _AtomInput() {
  const data = require("../../../../../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../../../../../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _scrollIntoView() {
  const data = require("../../../../../nuclide-commons-ui/scrollIntoView");

  _scrollIntoView = function () {
    return data;
  };

  return data;
}

function _Table() {
  const data = require("../../../../../nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

function _Tree() {
  const data = require("../../../../../nuclide-commons-ui/Tree");

  _Tree = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _constants() {
  const data = require("../constants");

  _constants = function () {
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

function _expected() {
  const data = require("../../../../../nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/* globals Element */
class ThreadTreeNode extends React.Component {
  // Subject that emits every time this node transitions from collapsed
  // to expanded.
  constructor(props) {
    super(props);

    this.handleSelectThread = () => {
      const newCollapsed = !this.state.isCollapsed;

      this._setCollapsed(newCollapsed);
    };

    this._handleStackFrameClick = (clickedRow, callFrameIndex) => {
      this.props.service.viewModel.setFocusedStackFrame(clickedRow.frame, true);
    };

    this._expandedSubject = new _RxMin.Subject();
    this.state = {
      isCollapsed: true,
      stackFrames: _expected().Expect.pending(),
      callStackLevels: 20,
      additionalCallStackLevels: 20
    };
    this._disposables = new (_UniversalDisposable().default)();
  }

  _threadIsFocused() {
    const {
      service,
      thread
    } = this.props;
    const focusedThread = service.viewModel.focusedThread;
    return focusedThread != null && thread.threadId === focusedThread.threadId;
  }

  _getFrames(levels) {
    // TODO: support frame paging - fetch ~20 frames here and offer
    // a way in the UI for the user to ask for more
    return levels != null ? this.props.thread.getFullCallStack(levels) : this.props.thread.getFullCallStack();
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  componentDidMount() {
    const {
      service
    } = this.props;
    const model = service.getModel();
    const {
      viewModel
    } = service;
    const changedCallStack = (0, _event().observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)); // The React element may have subscribed to the event (call stack
    // changed) after the event occurred.

    const additionalFocusedCheck = this._threadIsFocused() ? changedCallStack.startWith(null) : changedCallStack;

    this._disposables.add(_RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(viewModel.onDidChangeDebuggerFocus.bind(viewModel))).subscribe(() => {
      const {
        isCollapsed
      } = this.state;
      const newIsCollapsed = isCollapsed && !this._threadIsFocused();

      this._setCollapsed(newIsCollapsed);
    }), this._expandedSubject.asObservable().let((0, _observable().fastDebounce)(100)).switchMap(() => {
      return this._getFrames(this.state.callStackLevels);
    }).subscribe(frames => {
      this.setState({
        stackFrames: frames
      });
    }), additionalFocusedCheck.let((0, _observable().fastDebounce)(100)).switchMap(() => {
      // If this node was already collapsed, it stays collapsed
      // unless this thread just became the focused thread, in
      // which case it auto-expands. If this node was already
      // expanded by the user, it stays expanded.
      const newIsCollapsed = this.state.isCollapsed && !this._threadIsFocused(); // If the node is collapsed, we only need to fetch the first call
      // frame to display the stop location (if any). Otherwise, we need
      // to fetch the call stack.

      return this._getFrames(newIsCollapsed ? 1 : this.state.callStackLevels).switchMap(frames => _RxMin.Observable.of({
        frames,
        newIsCollapsed
      }));
    }).subscribe(result => {
      const {
        frames,
        newIsCollapsed
      } = result;
      this.setState({
        stackFrames: frames,
        isCollapsed: newIsCollapsed
      });
    }), (0, _event().observableFromSubscribeFunction)(service.onDidChangeActiveThread.bind(service)).subscribe(() => {
      if (this._threadIsFocused() && this._nestedTreeItem != null) {
        const el = _reactDom.default.findDOMNode(this._nestedTreeItem);

        if (el instanceof Element) {
          (0, _scrollIntoView().scrollIntoViewIfNeeded)(el, false);
        }
      }
    }));
  }

  _setCollapsed(isCollapsed) {
    this.setState({
      isCollapsed
    });

    if (!isCollapsed) {
      this._expandedSubject.next();
    }
  }

  _generateTable(childItems) {
    const {
      service
    } = this.props;
    const rows = childItems.map((frame, frameIndex) => {
      const activeFrame = service.viewModel.focusedStackFrame;
      const isSelected = activeFrame != null ? frame === activeFrame : false;
      const cellData = {
        data: {
          name: frame.name,
          source: frame.source != null && frame.source.name != null ? `${frame.source.name}` : '',
          // VSP line numbers start at 0.
          line: `${frame.range.end.row + 1}`,
          frame,
          isSelected
        },
        className: isSelected ? 'debugger-callstack-item-selected' : undefined
      };
      return cellData;
    });
    const columns = [{
      title: 'Name',
      key: 'name',
      width: 0.5
    }, {
      title: 'Source',
      key: 'source',
      width: 0.35
    }, {
      title: 'Line',
      key: 'line',
      width: 0.15
    }];
    return React.createElement("div", {
      className: (0, _classnames().default)({
        'debugger-container-new-disabled': this.props.thread.process.debuggerMode === _constants().DebuggerMode.RUNNING
      })
    }, React.createElement("div", {
      className: "debugger-callstack-table-div"
    }, React.createElement(_Table().Table, {
      className: "debugger-callstack-table",
      columns: columns,
      rows: rows,
      selectable: cellData => cellData.frame.source.available,
      resizable: true,
      onSelect: this._handleStackFrameClick,
      sortable: false
    })));
  }

  render() {
    const {
      thread,
      service
    } = this.props;
    const {
      stackFrames,
      isCollapsed
    } = this.state;

    const isFocused = this._threadIsFocused();

    const handleTitleClick = event => {
      if (thread.stopped) {
        service.viewModel.setFocusedThread(thread, true);
      }

      event.stopPropagation();
    };

    const formattedTitle = React.createElement("span", {
      onClick: handleTitleClick,
      className: isFocused ? (0, _classnames().default)('debugger-tree-process-thread-selected') : '',
      title: 'Thread ID: ' + thread.threadId + ', Name: ' + thread.name
    }, thread.name + (thread.stoppedDetails == null ? ' (Running)' : ' (Paused)'));

    if (thread.stoppedDetails == null || !stackFrames.isPending && !stackFrames.isError && stackFrames.value.length === 0) {
      return React.createElement(_Tree().TreeItem, {
        className: "debugger-tree-no-frames"
      }, formattedTitle);
    }

    const LOADING = React.createElement("div", {
      className: (0, _classnames().default)('debugger-expression-value-row', 'debugger-tree-no-frames')
    }, React.createElement("span", {
      className: "debugger-expression-value-content"
    }, React.createElement(_LoadingSpinner().LoadingSpinner, {
      size: "SMALL"
    })));
    const ERROR = React.createElement("span", {
      className: "debugger-tree-no-frames"
    }, "Error fetching stack frames", ' ', stackFrames.isError ? stackFrames.error.toString() : null);
    const callFramesElements = stackFrames.isPending ? LOADING : stackFrames.isError ? ERROR : this._generateTable(stackFrames.value);
    return React.createElement("div", {
      className: "debugger-tree-frame"
    }, React.createElement(_Tree().NestedTreeItem, {
      title: formattedTitle,
      collapsed: this.state.isCollapsed,
      onSelect: this.handleSelectThread,
      ref: elem => this._nestedTreeItem = elem
    }, callFramesElements), isCollapsed ? null : this._renderLoadMoreStackFrames());
  }

  _renderLoadMoreStackFrames() {
    const {
      thread
    } = this.props;
    const {
      stackFrames,
      callStackLevels,
      additionalCallStackLevels
    } = this.state;

    if (!thread.additionalFramesAvailable(callStackLevels + 1)) {
      return null;
    }

    return React.createElement("div", {
      style: {
        display: 'flex'
      }
    }, React.createElement(_Button().Button, {
      size: _Button().ButtonSizes.EXTRA_SMALL,
      disabled: stackFrames.isPending || stackFrames.isError,
      onClick: () => {
        this.setState({
          stackFrames: _expected().Expect.pending(),
          callStackLevels: callStackLevels + additionalCallStackLevels
        });

        this._expandedSubject.next();
      }
    }, "More Stack Frames"), React.createElement(_AtomInput().AtomInput, {
      style: {
        'flex-grow': '1'
      },
      placeholderText: "Number of stack frames",
      initialValue: String(this.state.additionalCallStackLevels),
      size: "xs",
      onDidChange: value => {
        if (!isNaN(parseInt(value, 10))) {
          this.setState({
            additionalCallStackLevels: parseInt(value, 10)
          });
        }
      }
    }), React.createElement(_AtomInput().AtomInput, null));
  }

}

exports.default = ThreadTreeNode;