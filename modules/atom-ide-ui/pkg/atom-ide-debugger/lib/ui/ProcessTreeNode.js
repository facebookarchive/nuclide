"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _ThreadTreeNode() {
  const data = _interopRequireDefault(require("./ThreadTreeNode"));

  _ThreadTreeNode = function () {
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

    this._handleThreadsChanged = () => {
      this.setState(prevState => this._getState(!(this._computeIsFocused() || !prevState.isCollapsed)));
    };

    this.handleSelect = () => {
      this.setState(prevState => this._getState(!prevState.isCollapsed));
    };

    this.state = this._getState();
    this._disposables = new (_UniversalDisposable().default)();
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    const {
      service
    } = this.props;
    const model = service.getModel();
    const {
      viewModel
    } = service;

    this._disposables.add(_RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)), (0, _event().observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel)), (0, _event().observableFromSubscribeFunction)(service.onDidChangeMode.bind(service))).let((0, _observable().fastDebounce)(15)).subscribe(this._handleThreadsChanged));
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

    const isCollapsed = shouldBeCollapsed != null ? shouldBeCollapsed : !isFocused;
    return {
      isFocused,
      childItems: process.getAllThreads(),
      isCollapsed
    };
  }

  render() {
    const {
      service,
      title,
      process
    } = this.props;
    const {
      childItems,
      isFocused
    } = this.state;
    const tooltipTitle = service.viewModel.focusedProcess == null || service.viewModel.focusedProcess.configuration.adapterExecutable == null ? 'Unknown Command' : service.viewModel.focusedProcess.configuration.adapterExecutable.command + service.viewModel.focusedProcess.configuration.adapterExecutable.args.join(' ');

    const handleTitleClick = event => {
      service.focusStackFrame(null, null, process, true);
      event.stopPropagation();
    };

    const formattedTitle = React.createElement("span", {
      onClick: handleTitleClick,
      className: isFocused ? 'debugger-tree-process-thread-selected' : '',
      title: tooltipTitle
    }, title);
    return childItems == null || childItems.length === 0 ? React.createElement(_Tree().TreeItem, null, formattedTitle) : React.createElement(_Tree().NestedTreeItem, {
      title: formattedTitle,
      collapsed: this.state.isCollapsed,
      onSelect: this.handleSelect
    }, childItems.map((thread, threadIndex) => {
      return React.createElement(_ThreadTreeNode().default, {
        key: threadIndex,
        childItems: thread.getCallStack(),
        thread: thread,
        service: service
      });
    }));
  }

}

exports.default = ProcessTreeNode;