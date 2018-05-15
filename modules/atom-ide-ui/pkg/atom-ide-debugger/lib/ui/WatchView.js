'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _classnames;













function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireWildcard(require('react'));var _bindObservableAsProps;
function _load_bindObservableAsProps() {return _bindObservableAsProps = require('../../../../../nuclide-commons-ui/bindObservableAsProps');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _WatchExpressionComponent;
function _load_WatchExpressionComponent() {return _WatchExpressionComponent = _interopRequireDefault(require('./WatchExpressionComponent'));}var _event;
function _load_event() {return _event = require('../../../../../nuclide-commons/event');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                        */class WatchView extends _react.PureComponent {constructor(props) {
    super(props);
    const { service } = props;
    const { viewModel } = service;
    const model = service.getModel();
    const watchExpressionChanges = (0, (_event || _load_event()).observableFromSubscribeFunction)(
    model.onDidChangeWatchExpressions.bind(model));

    const focusedProcessChanges = (0, (_event || _load_event()).observableFromSubscribeFunction)(
    viewModel.onDidFocusProcess.bind(viewModel));

    const focusedStackFrameChanges = (0, (_event || _load_event()).observableFromSubscribeFunction)(
    viewModel.onDidFocusStackFrame.bind(viewModel));

    const expressionContextChanges = (0, (_event || _load_event()).observableFromSubscribeFunction)(
    viewModel.onDidChangeExpressionContext.bind(viewModel));

    this._watchExpressionComponentWrapped = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
    _rxjsBundlesRxMinJs.Observable.merge(
    watchExpressionChanges,
    focusedProcessChanges,
    focusedStackFrameChanges,
    expressionContextChanges).

    startWith(null).
    map(() => ({
      focusedProcess: viewModel.focusedProcess,
      focusedStackFrame: viewModel.focusedStackFrame,
      watchExpressions: model.getWatchExpressions() })), (_WatchExpressionComponent || _load_WatchExpressionComponent()).default);



  }

  render() {
    const { service } = this.props;
    const WatchExpressionComponentWrapped = this.
    _watchExpressionComponentWrapped;

    return (
      _react.createElement('div', { className: (0, (_classnames || _load_classnames()).default)('debugger-container-new') },
        _react.createElement('div', { className: 'debugger-pane-content' },
          _react.createElement(WatchExpressionComponentWrapped, {
            onAddWatchExpression: service.addWatchExpression.bind(service),
            onRemoveWatchExpression: service.removeWatchExpressions.bind(
            service),

            onUpdateWatchExpression: service.renameWatchExpression.bind(
            service) }))));





  }}exports.default = WatchView;