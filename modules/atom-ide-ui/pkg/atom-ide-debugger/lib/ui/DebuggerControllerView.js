'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _event;













function _load_event() {return _event = require('../../../../../nuclide-commons/event');}
var _react = _interopRequireWildcard(require('react'));var _LoadingSpinner;
function _load_LoadingSpinner() {return _LoadingSpinner = require('../../../../../nuclide-commons-ui/LoadingSpinner');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _constants;
function _load_constants() {return _constants = require('../constants');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                        * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                        * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                        *  strict-local
                                                                                                                                                                                                                                                                                                                                                                                                                                        * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                        */class DebuggerControllerView extends _react.Component {constructor(props) {super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    const { service } = this.props;
    this._disposables.add(
    (0, (_event || _load_event()).observableFromSubscribeFunction)(
    service.onDidChangeMode.bind(service)).
    subscribe(mode => this.forceUpdate()));

  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    if (this.props.service.getDebuggerMode() === (_constants || _load_constants()).DebuggerMode.STARTING) {
      return (
        _react.createElement('div', { className: 'debugger-starting-message' },
          _react.createElement('div', null,
            _react.createElement('span', { className: 'inline-block' }, 'Starting Debugger...'),
            _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { className: 'inline-block', size: 'EXTRA_SMALL' }))));



    }
    return null;
  }}exports.default = DebuggerControllerView;