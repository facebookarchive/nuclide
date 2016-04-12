'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Disposable} = require('atom');
const {EventEmitter} = require('events');
const Constants = require('./Constants');

import type {Dispatcher} from 'flux';
import type {
  nuclide_debugger$Service,
  NuclideEvaluationExpressionProvider,
} from '../../nuclide-debugger-interfaces/service';
import type DebuggerInstance from './DebuggerInstance';
import type DebuggerProcessInfoType from './DebuggerProcessInfo';

type DebuggerModeType = 'starting' | 'running' | 'paused' | 'stopping' | 'stopped';
const DebuggerMode: {[key: string]: DebuggerModeType} = Object.freeze({
  STARTING: 'starting',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
});

/**
 * Flux style Store holding all data used by the debugger plugin.
 */
class DebuggerStore {
  _dispatcher: Dispatcher;
  _eventEmitter: EventEmitter;
  _dispatcherToken: any;

  // Stored values
  _debuggerInstance: ?DebuggerInstance;
  _error: ?string;
  _services: Set<nuclide_debugger$Service>;
  _evaluationExpressionProviders: Set<NuclideEvaluationExpressionProvider>;
  _processSocket: ?string;
  _debuggerMode: DebuggerModeType;

  constructor(dispatcher: Dispatcher) {
    this._dispatcher = dispatcher;
    this._eventEmitter = new EventEmitter();
    this._dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));

    this._debuggerInstance = null;
    this._error = null;
    this._services = new Set();
    this._evaluationExpressionProviders = new Set();
    this._processSocket = null;
    this._debuggerMode = DebuggerMode.STOPPED;
  }

  dispose() {
    this._eventEmitter.removeAllListeners();
    this._dispatcher.unregister(this._dispatcherToken);
    if (this._debuggerInstance) {
      this._debuggerInstance.dispose();
    }
  }

  getDebuggerInstance(): ?DebuggerInstance {
    return this._debuggerInstance;
  }

  getError(): ?string {
    return this._error;
  }

  /**
   * Return attachables.
   *
   * @param optional service name (e.g. lldb) to filter resulting attachables.
   */
  getProcessInfoList(serviceName?: string): Promise<Array<DebuggerProcessInfoType>> {
    return Promise.all(
        Array.from(this._services)
          .map(service => {
            if (!serviceName || service.name === serviceName) {
              return service.getProcessInfoList();
            } else {
              return Promise.resolve([]);
            }
          }))
        .then(values => [].concat.apply([], values));
  }

  getProcessSocket(): ?string {
    return this._processSocket;
  }

  getDebuggerMode(): DebuggerModeType {
    return this._debuggerMode;
  }

  getEvaluationExpressionProviders(): Set<NuclideEvaluationExpressionProvider> {
    return this._evaluationExpressionProviders;
  }

  onChange(callback: () => void): Disposable {
    const emitter = this._eventEmitter;
    this._eventEmitter.on('change', callback);
    return new Disposable(() => emitter.removeListener('change', callback));
  }

  setDebuggerMode(newMode: DebuggerModeType): void {
    this._debuggerMode = newMode;
  // Using a setter is necessary to circumvent timing issues when using the dispatcher.
    // TODO fix underlying dispatcher timing problem & move to proper Flux implementation.
    // this._dispatcher.dispatch({
    //   actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
    //   data: newMode,
    // });
  }

  _handlePayload(payload: Object) {
    switch (payload.actionType) {
      case Constants.Actions.SET_PROCESS_SOCKET:
        this._processSocket = payload.data;
        break;
      case Constants.Actions.ADD_SERVICE:
        if (this._services.has(payload.data)) {
          return;
        }
        this._services.add(payload.data);
        break;
      case Constants.Actions.REMOVE_SERVICE:
        if (!this._services.has(payload.data)) {
          return;
        }
        this._services.delete(payload.data);
        break;
      case Constants.Actions.SET_ERROR:
        this._error = payload.data;
        break;
      case Constants.Actions.SET_DEBUGGER_INSTANCE:
        this._debuggerInstance = payload.data;
        break;
      case Constants.Actions.DEBUGGER_MODE_CHANGE:
        this._debuggerMode = payload.data;
        break;
      case Constants.Actions.ADD_EVALUATION_EXPRESSION_PROVIDER:
        if (this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.add(payload.data);
        break;
      case Constants.Actions.REMOVE_EVALUATION_EXPRESSION_PROVIDER:
        if (!this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.delete(payload.data);
        break;
      default:
        return;
    }
    this._eventEmitter.emit('change');
  }
}

module.exports = {
  DebuggerMode,
  DebuggerStore,
};
