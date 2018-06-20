'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _event;

function _load_event() {
  return _event = require('../../../../../nuclide-commons/event');
}

var _react = _interopRequireWildcard(require('react'));

var _Tree;

function _load_Tree() {
  return _Tree = require('../../../../../nuclide-commons-ui/Tree');
}

var _FrameTreeNode;

function _load_FrameTreeNode() {
  return _FrameTreeNode = _interopRequireDefault(require('./FrameTreeNode'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../../../nuclide-commons/observable');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ProcessTreeNode;

function _load_ProcessTreeNode() {
  return _ProcessTreeNode = _interopRequireDefault(require('./ProcessTreeNode'));
}

var _ThreadTreeNode;

function _load_ThreadTreeNode() {
  return _ThreadTreeNode = _interopRequireDefault(require('./ThreadTreeNode'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class DebuggerProcessComponent extends _react.PureComponent {

  constructor(props) {
    super(props);

    this._handleThreadsChanged = () => {
      this.setState(this._getState());
    };

    this.state = this._getState();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    const { service } = this.props;
    const { viewModel } = service;
    const model = service.getModel();
    this._disposables.add(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel)), (0, (_event || _load_event()).observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)), (0, (_event || _load_event()).observableFromSubscribeFunction)(service.onDidChangeMode.bind(service))).let((0, (_observable || _load_observable()).fastDebounce)(150)).subscribe(this._handleThreadsChanged));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _getState() {
    return {
      processList: this.props.service.getModel().getProcesses().slice()
    };
  }

  render() {
    const { processList } = this.state;
    const { service } = this.props;

    const processElements = processList.map((process, processIndex) => {
      const { adapterType, processName } = process.configuration;
      const threadElements = process.getAllThreads().map((thread, threadIndex) => {
        const stackFrameElements = thread.getCallStack().map((frame, frameIndex) => {
          return _react.createElement((_FrameTreeNode || _load_FrameTreeNode()).default, {
            text: 'Frame ID: ' + frame.frameId + ', Name: ' + frame.name,
            frame: frame,
            key: frameIndex,
            service: service
          });
        });
        return _react.createElement((_ThreadTreeNode || _load_ThreadTreeNode()).default, {
          title: 'Thread ID: ' + thread.threadId + ', Name: ' + thread.name,
          key: threadIndex,
          childItems: stackFrameElements,
          thread: thread,
          service: service
        });
      });
      return process == null ? 'No processes are currently being debugged' : _react.createElement((_ProcessTreeNode || _load_ProcessTreeNode()).default, {
        title: processName != null ? processName : adapterType,
        key: processIndex,
        childItems: threadElements,
        process: process,
        service: service
      });
    });

    return _react.createElement(
      (_Tree || _load_Tree()).TreeList,
      { showArrows: true },
      processElements
    );
  }
}
exports.default = DebuggerProcessComponent;