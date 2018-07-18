"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _LoadingSpinner() {
  const data = require("../../../../../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
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
const LOADING = React.createElement("div", {
  className: (0, _classnames().default)('debugger-expression-value-row', 'debugger-tree-no-frames')
}, React.createElement("span", {
  className: "debugger-expression-value-content"
}, React.createElement(_LoadingSpinner().LoadingSpinner, {
  size: "SMALL"
})));
const NO_FRAMES = React.createElement("span", {
  className: "debugger-tree-no-frames"
}, "Call frames unavailable");

class ThreadTreeNode extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelect = () => {
      if (!this.state.isCollapsed) {
        this.setState({
          isCollapsed: true
        });
      } else {
        this.setState({
          isCollapsed: false,
          childItems: _expected().Expect.pending()
        });

        this._selectTrigger.next();
      }
    };

    this.handleSelectNoChildren = () => {
      this.props.service.focusStackFrame(null, this.props.thread, null, true);
    };

    this._handleStackFrameClick = (clickedRow, callFrameIndex) => {
      this.props.service.focusStackFrame(clickedRow.frame, null, null, true);
    };

    this._selectTrigger = new _RxMin.Subject();
    this.state = this._getInitialState();
    this._disposables = new (_UniversalDisposable().default)();
  }

  _computeIsFocused() {
    const {
      service,
      thread
    } = this.props;
    const focusedThread = service.viewModel.focusedThread;
    return focusedThread != null && thread.threadId === focusedThread.threadId;
  }

  _getInitialState() {
    return {
      isCollapsed: true,
      childItems: _expected().Expect.pending()
    };
  }

  _getFrames(fetch = false) {
    const {
      thread
    } = this.props;

    const getValue = () => _RxMin.Observable.of(_expected().Expect.value(thread.getCallStack()));

    if (fetch || !this.state.childItems.isPending && !this.state.childItems.isError && this.state.childItems.value.length === 0) {
      return _RxMin.Observable.of(_expected().Expect.pending()).concat(_RxMin.Observable.fromPromise((async () => {
        await thread.fetchCallStack();
        return _expected().Expect.value(thread.getCallStack());
      })()));
    }

    return getValue();
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

    this._disposables.add(_RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel)), (0, _event().observableFromSubscribeFunction)(service.onDidChangeMode.bind(service))).subscribe(() => {
      const {
        isCollapsed
      } = this.state;
      const newIsCollapsed = isCollapsed && !this._computeIsFocused();
      this.setState({
        isCollapsed: newIsCollapsed
      });
    }), this._selectTrigger.asObservable().switchMap(() => this._getFrames(true)).subscribe(frames => {
      this.setState({
        childItems: frames
      });
    }), (0, _event().observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)).debounceTime(100).startWith(null).switchMap(() => this._getFrames().switchMap(frames => {
      if (!this.state.isCollapsed && !frames.isPending && !frames.isError && frames.value.length === 0) {
        return this._getFrames(true);
      }

      return _RxMin.Observable.of(frames);
    })).subscribe(frames => {
      const {
        isCollapsed
      } = this.state;
      this.setState({
        childItems: frames,
        isCollapsed: isCollapsed && !this._computeIsFocused()
      });
    }));
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
          line: `${frame.range.end.row}`,
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
      className: (0, _classnames().default)('debugger-container-new', {
        'debugger-container-new-disabled': service.getDebuggerMode() === _constants().DebuggerMode.RUNNING
      })
    }, React.createElement("div", {
      className: "debugger-pane-content"
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
      childItems
    } = this.state;

    const isFocused = this._computeIsFocused();

    const handleTitleClick = event => {
      service.focusStackFrame(null, thread, null, true);
      event.stopPropagation();
    };

    const formattedTitle = React.createElement("span", {
      onClick: handleTitleClick,
      className: isFocused ? (0, _classnames().default)('debugger-tree-process-thread-selected') : '',
      title: 'Thread ID: ' + thread.threadId + ', Name: ' + thread.name
    }, thread.name + (thread.stoppedDetails == null ? ' (Running)' : ' (Paused)'));

    if (!childItems.isPending && !childItems.isError && childItems.value.length === 0) {
      return React.createElement(_Tree().TreeItem, {
        onSelect: this.handleSelectNoChildren
      }, formattedTitle);
    }

    const callFramesElements = childItems.isPending ? LOADING : childItems.isError ? React.createElement("span", {
      className: "debugger-tree-no-frames"
    }, "Error fetching stack frames ", childItems.error.toString()) : childItems.value.length === 0 ? NO_FRAMES : this._generateTable(childItems.value);
    return React.createElement(_Tree().NestedTreeItem, {
      title: formattedTitle,
      collapsed: this.state.isCollapsed,
      onSelect: this.handleSelect
    }, callFramesElements);
  }

}

exports.default = ThreadTreeNode;