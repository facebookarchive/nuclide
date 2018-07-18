"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
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

function _bindObservableAsProps() {
  const data = require("../../../../../nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _WatchExpressionComponent() {
  const data = _interopRequireDefault(require("./WatchExpressionComponent"));

  _WatchExpressionComponent = function () {
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
class WatchView extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      service
    } = props;
    const {
      viewModel
    } = service;
    const model = service.getModel();
    const watchExpressionChanges = (0, _event().observableFromSubscribeFunction)(model.onDidChangeWatchExpressions.bind(model));
    const focusedProcessChanges = (0, _event().observableFromSubscribeFunction)(viewModel.onDidFocusProcess.bind(viewModel));
    const focusedStackFrameChanges = (0, _event().observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel));
    const expressionContextChanges = (0, _event().observableFromSubscribeFunction)(viewModel.onDidChangeExpressionContext.bind(viewModel));
    this._watchExpressionComponentWrapped = (0, _bindObservableAsProps().bindObservableAsProps)(_RxMin.Observable.merge(watchExpressionChanges, focusedProcessChanges, focusedStackFrameChanges, expressionContextChanges).startWith(null).map(() => ({
      focusedProcess: viewModel.focusedProcess,
      focusedStackFrame: viewModel.focusedStackFrame,
      watchExpressions: model.getWatchExpressions()
    })), _WatchExpressionComponent().default);
  }

  render() {
    const {
      service
    } = this.props;
    const WatchExpressionComponentWrapped = this._watchExpressionComponentWrapped;
    return React.createElement("div", {
      className: (0, _classnames().default)('debugger-container-new')
    }, React.createElement("div", {
      className: "debugger-pane-content"
    }, React.createElement(WatchExpressionComponentWrapped, {
      onAddWatchExpression: service.addWatchExpression.bind(service),
      onRemoveWatchExpression: service.removeWatchExpressions.bind(service),
      onUpdateWatchExpression: service.renameWatchExpression.bind(service)
    })));
  }

}

exports.default = WatchView;