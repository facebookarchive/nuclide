"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Tree() {
  const data = require("../../../../../nuclide-commons-ui/Tree");

  _Tree = function () {
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

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _ProcessTreeNode() {
  const data = _interopRequireDefault(require("./ProcessTreeNode"));

  _ProcessTreeNode = function () {
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
class DebuggerProcessComponent extends React.PureComponent {
  constructor(props) {
    super(props);

    this._handleThreadsChanged = () => {
      this.setState(this._getState());
    };

    this.state = this._getState();
    this._disposables = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    const {
      service
    } = this.props;
    const {
      viewModel
    } = service;
    const model = service.getModel();

    this._disposables.add(_RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel)), (0, _event().observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)), (0, _event().observableFromSubscribeFunction)(service.onDidChangeMode.bind(service))).let((0, _observable().fastDebounce)(150)).subscribe(this._handleThreadsChanged));
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
    const {
      processList
    } = this.state;
    const {
      service
    } = this.props;
    const processElements = processList.map((process, processIndex) => {
      const {
        adapterType,
        processName
      } = process.configuration;
      return process == null ? 'No processes are currently being debugged' : React.createElement(_ProcessTreeNode().default, {
        title: processName != null ? processName : adapterType,
        key: processIndex,
        childItems: process.getAllThreads(),
        process: process,
        service: service
      });
    });
    return React.createElement(_Tree().TreeList, {
      showArrows: true
    }, processElements);
  }

}

exports.default = DebuggerProcessComponent;