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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _ThreadTreeNode() {
  const data = _interopRequireDefault(require("./ThreadTreeNode"));

  _ThreadTreeNode = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../constants");

  _constants = function () {
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

function _Icon() {
  const data = require("../../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
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
class ProcessTreeNode extends React.Component {
  constructor(props) {
    super(props);

    this._handleFocusChanged = () => {
      this.setState(prevState => this._getState(!(this._computeIsFocused() || !prevState.isCollapsed)));
    };

    this._handleCallStackChanged = () => {
      const {
        process
      } = this.props;
      this.setState({
        threads: process.getAllThreads()
      });
    };

    this.handleSelect = () => {
      this.setState(prevState => this._getState(!prevState.isCollapsed));
    };

    this._threadTitle = thread => {
      const stopReason = thread.stoppedDetails == null ? '' : thread.stoppedDetails.description != null ? ': ' + thread.stoppedDetails.description : thread.stoppedDetails.reason != null ? ': ' + thread.stoppedDetails.reason : '';
      return thread.name + (thread.stopped ? ` (Paused${stopReason})` : ' (Running)');
    };

    this.state = this._getState();
    this._disposables = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    const {
      service
    } = this.props;
    const model = service.getModel();
    const {
      viewModel
    } = service;

    this._disposables.add(_rxjsCompatUmdMin.Observable.merge((0, _event().observableFromSubscribeFunction)(viewModel.onDidChangeDebuggerFocus.bind(viewModel))).let((0, _observable().fastDebounce)(15)).subscribe(this._handleFocusChanged), (0, _event().observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)).let((0, _observable().fastDebounce)(15)).subscribe(this._handleCallStackChanged), (0, _event().observableFromSubscribeFunction)(service.onDidChangeProcessMode.bind(service)).subscribe(() => this.setState(prevState => this._getState(prevState.isCollapsed))));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _computeIsFocused() {
    const {
      service,
      process
    } = this.props;
    const focusedProcess = service.viewModel.focusedProcess;
    return process === focusedProcess;
  }

  _getState(shouldBeCollapsed) {
    const {
      process
    } = this.props;

    const isFocused = this._computeIsFocused();

    const pendingStart = process.debuggerMode === _constants().DebuggerMode.STARTING;

    const isCollapsed = shouldBeCollapsed != null ? shouldBeCollapsed : !isFocused;
    return {
      isFocused,
      threads: process.getAllThreads(),
      isCollapsed,
      pendingStart
    };
  }

  // Returns true if thread should be kept.
  filterThread(thread) {
    const {
      filter,
      filterRegEx
    } = this.props;

    if (this.props.showPausedThreadsOnly && !thread.stopped) {
      return false;
    }

    if (filter == null) {
      return true;
    } else if (filterRegEx == null) {
      // User entered an invalid regular expression.
      // Simply check if any thread contains the user's input.
      return this.props.title.toUpperCase().includes(filter.toUpperCase());
    } else {
      return this._threadTitle(thread).match(filterRegEx) != null || thread.getCachedCallStack().some(frame => frame.name.match(filterRegEx) || frame.source.name != null && frame.source.name.match(filterRegEx));
    }
  }

  render() {
    const {
      service,
      title,
      process
    } = this.props;
    const {
      threads,
      isFocused,
      isCollapsed
    } = this.state;
    const readOnly = service.viewModel.focusedProcess != null && service.viewModel.focusedProcess.configuration.isReadOnly;

    const handleTitleClick = event => {
      if (!this._computeIsFocused()) {
        service.viewModel.setFocusedProcess(process, true);
        event.stopPropagation();
      }
    };

    const firstExtension = this.props.process.configuration.servicedFileExtensions == null ? '' : String(this.props.process.configuration.servicedFileExtensions[0]);
    const fileIcon = this.state.pendingStart ? React.createElement("div", {
      className: "inline-block",
      title: "Starting debugger..."
    }, React.createElement(_LoadingSpinner().LoadingSpinner, {
      size: _LoadingSpinner().LoadingSpinnerSizes.EXTRA_SMALL,
      className: "inline-block"
    })) : React.createElement("span", {
      className: `debugger-tree-file-icon ${firstExtension}-icon`,
      onClick: handleTitleClick,
      title: firstExtension.toUpperCase()
    });
    const formattedTitle = React.createElement("span", null, fileIcon, React.createElement("span", {
      onClick: handleTitleClick,
      className: isFocused ? 'debugger-tree-process debugger-tree-process-thread-selected' : 'debugger-tree-process',
      title: title
    }, title, readOnly ? ' (READ ONLY)' : null));
    const filteredThreads = threads.filter(t => this.filterThread(t));
    const focusedThread = service.viewModel.focusedThread;
    const selectedThreadFiltered = threads.some(t => t === focusedThread) && !filteredThreads.some(t => t === focusedThread);
    const focusedThreadHiddenWarning = React.createElement("span", {
      className: "debugger-thread-no-match-text"
    }, React.createElement(_Icon().Icon, {
      icon: "nuclicon-warning"
    }), "The focused thread is hidden by your thread filter!");
    return threads.length === 0 ? React.createElement(_Tree().TreeItem, null, formattedTitle) : React.createElement(_Tree().NestedTreeItem, {
      title: formattedTitle,
      collapsed: isCollapsed,
      onSelect: this.handleSelect
    }, filteredThreads.length === 0 && threads.length > 0 ? selectedThreadFiltered ? focusedThreadHiddenWarning : React.createElement("span", {
      className: "debugger-thread-no-match-text"
    }, "No threads match the current filter.") : filteredThreads.map((thread, threadIndex) => React.createElement(_ThreadTreeNode().default, {
      key: threadIndex,
      thread: thread,
      service: service,
      threadTitle: this._threadTitle(thread)
    })).concat(selectedThreadFiltered ? focusedThreadHiddenWarning : null));
  }

}

exports.default = ProcessTreeNode;