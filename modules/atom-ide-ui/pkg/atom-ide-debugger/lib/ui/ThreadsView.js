'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _classnames;













function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _event;
function _load_event() {return _event = require('../../../../../nuclide-commons/event');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireWildcard(require('react'));var _DebuggerThreadsComponent;
function _load_DebuggerThreadsComponent() {return _DebuggerThreadsComponent = _interopRequireDefault(require('./DebuggerThreadsComponent'));}var _constants;
function _load_constants() {return _constants = require('../constants');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}





class ThreadsView extends _react.PureComponent




{


  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      mode: props.service.getDebuggerMode() };

  }

  componentDidMount() {
    const { service } = this.props;
    this._disposables.add(
    (0, (_event || _load_event()).observableFromSubscribeFunction)(
    service.onDidChangeMode.bind(service)).
    subscribe(mode => this.setState({ mode })));

  }

  componentWillUnmount() {
    this._dispose();
  }

  _dispose() {
    this._disposables.dispose();
  }

  render() {
    const { service } = this.props;
    const { mode } = this.state;
    const disabledClass =
    mode !== (_constants || _load_constants()).DebuggerMode.RUNNING ? '' : ' debugger-container-new-disabled';

    return (
      _react.createElement('div', { className: (0, (_classnames || _load_classnames()).default)('debugger-container-new', disabledClass) },
        _react.createElement('div', { className: 'debugger-pane-content' },
          _react.createElement((_DebuggerThreadsComponent || _load_DebuggerThreadsComponent()).default, { service: service }))));



  }}exports.default = ThreadsView; /**
                                    * Copyright (c) 2017-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the BSD-style license found in the
                                    * LICENSE file in the root directory of this source tree. An additional grant
                                    * of patent rights can be found in the PATENTS file in the same directory.
                                    *
                                    *  strict-local
                                    * @format
                                    */