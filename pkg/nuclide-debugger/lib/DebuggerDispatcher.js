Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeDispatcher;

function _load_commonsNodeDispatcher() {
  return _commonsNodeDispatcher = _interopRequireDefault(require('../../commons-node/Dispatcher'));
}

var ActionTypes = Object.freeze({
  SET_DEBUGGER_INSTANCE: 'SET_DEBUGGER_INSTANCE',
  SET_ERROR: 'SET_ERROR',
  SET_PROCESS_SOCKET: 'SET_PROCESS_SOCKET',
  DEBUGGER_MODE_CHANGE: 'DEBUGGER_MODE_CHANGE',
  ADD_DEBUGGER_PROVIDER: 'ADD_DEBUGGER_PROVIDER',
  REMOVE_DEBUGGER_PROVIDER: 'REMOVE_DEBUGGER_PROVIDER',
  UPDATE_CONNECTIONS: 'UPDATE_CONNECTIONS',
  ADD_EVALUATION_EXPRESSION_PROVIDER: 'ADD_EVALUATION_EXPRESSION_PROVIDER',
  REMOVE_EVALUATION_EXPRESSION_PROVIDER: 'REMOVE_EVALUATION_EXPRESSION_PROVIDER',
  ADD_WATCH_EXPRESSION: 'ADD_WATCH_EXPRESSION',
  REMOVE_WATCH_EXPRESSION: 'REMOVE_WATCH_EXPRESSION',
  UPDATE_WATCH_EXPRESSION: 'UPDATE_WATCH_EXPRESSION',
  TRIGGER_DEBUGGER_ACTION: 'TRIGGER_DEBUGGER_ACTION',
  ADD_REGISTER_EXECUTOR: 'ADD_REGISTER_EXECUTOR',
  REMOVE_REGISTER_EXECUTOR: 'REMOVE_REGISTER_EXECUTOR',
  REGISTER_CONSOLE: 'REGISTER_CONSOLE',
  UNREGISTER_CONSOLE: 'UNREGISTER_CONSOLE',
  UPDATE_CALLSTACK: 'UPDATE_CALLSTACK',
  OPEN_SOURCE_LOCATION: 'OPEN_SOURCE_LOCATION',
  CLEAR_INTERFACE: 'CLEAR_INTERFACE',
  SET_SELECTED_CALLFRAME_LINE: 'SET_SELECTED_CALLFRAME_LINE',
  ADD_BREAKPOINT: 'ADD_BREAKPOINT',
  UPDATE_BREAKPOINT_CONDITION: 'UPDATE_BREAKPOINT_CONDITION',
  UPDATE_BREAKPOINT_ENABLED: 'UPDATE_BREAKPOINT_ENABLED',
  DELETE_BREAKPOINT: 'DELETE_BREAKPOINT',
  DELETE_ALL_BREAKPOINTS: 'DELETE_ALL_BREAKPOINTS',
  TOGGLE_BREAKPOINT: 'TOGGLE_BREAKPOINT',
  DELETE_BREAKPOINT_IPC: 'DELETE_BREAKPOINT_IPC',
  BIND_BREAKPOINT_IPC: 'BIND_BREAKPOINT_IPC',
  UPDATE_LOCALS: 'UPDATE_LOCALS',
  TOGGLE_PAUSE_ON_EXCEPTION: 'TOGGLE_PAUSE_ON_EXCEPTION',
  TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION: 'TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION',
  UPDATE_THREADS: 'UPDATE_THREADS',
  UPDATE_THREAD: 'UPDATE_THREAD',
  UPDATE_STOP_THREAD: 'UPDATE_STOP_THREAD',
  NOTIFY_THREAD_SWITCH: 'NOTIFY_THREAD_SWITCH',
  TOGGLE_SINGLE_THREAD_STEPPING: 'TOGGLE_SINGLE_THREAD_STEPPING',
  RECEIVED_EXPRESSION_EVALUATION_RESPONSE: 'RECEIVED_EXPRESSION_EVALUATION_RESPONSE',
  RECEIVED_GET_PROPERTIES_RESPONSE: 'RECEIVED_GET_PROPERTIES_RESPONSE',
  ADD_CUSTOM_CONTROL_BUTTONS: 'ADD_CUSTOM_CONTROL_BUTTONS'
});

exports.ActionTypes = ActionTypes;
// Flow hack: Every DebuggerAction actionType must be in ActionTypes.
'';

var DebuggerDispatcher = (function (_default) {
  _inherits(DebuggerDispatcher, _default);

  function DebuggerDispatcher() {
    _classCallCheck(this, DebuggerDispatcher);

    _get(Object.getPrototypeOf(DebuggerDispatcher.prototype), 'constructor', this).apply(this, arguments);
  }

  return DebuggerDispatcher;
})((_commonsNodeDispatcher || _load_commonsNodeDispatcher()).default);

exports.default = DebuggerDispatcher;