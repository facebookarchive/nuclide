'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {log, logErrorAndThrow, uriToPath} = require('./utils');
var Handler = require('./Handler');
var {
  STATUS_STARTING,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_RUNNING,
  STATUS_BREAK,
  STATUS_ERROR,
  STATUS_END,
  COMMAND_RUN,
  COMMAND_STEP_INTO,
  COMMAND_STEP_OVER,
  COMMAND_STEP_OUT,
  COMMAND_STOP,
} = require('./DbgpSocket');

import type {ConnectionMulitplexer} from './ConnectionMultiplexer';
import type ChromeCallback from './ChromeCallback';
import type FileCache from './FileCache';
import type {EventEmitter} from 'events';

var /* const */ SESSION_END_EVENT = 'session-end-event';

// Handles all 'Debug.*' Chrome dev tools messages
export class DebuggerHandler extends Handler {
  _connectionMultiplexer: ConnectionMultiplexer;
  _files: FileCache;
  _emitter: EventEmitter;
  _statusSubscription: ?Disposable;
  _hadFirstContinuationCommand: boolean;

  constructor(callback: ChromeCallback, connectionMultiplexer: ConnectionMultiplexer) {
    super('Debugger', callback);

    this._hadFirstContinuationCommand = false;
    this._connectionMultiplexer = connectionMultiplexer;
    var FileCache = require('./FileCache');
    this._files = new FileCache(callback);
    var {EventEmitter} = require('events');
    this._emitter = new EventEmitter();
    this._statusSubscription = this._connectionMultiplexer.onStatus(this._onStatusChanged.bind(this));
  }

  onSessionEnd(callback: () => void): void {
    log('onSessionEnd');
    this._emitter.on(SESSION_END_EVENT, callback);
  }

  async handleMethod(id: number, method: string, params: Object): Promise {

    switch (method) {

    // TODO: Add Console (aka logging) support
    case 'enable':
      this._debuggerEnable(id);
      break;

    case 'pause':
      await this._sendBreakCommand(id);
      break;

    case 'stepInto':
      this._sendContinuationCommand(COMMAND_STEP_INTO);
      break;

    case 'stepOut':
      this._sendContinuationCommand(COMMAND_STEP_OUT);
      break;

    case 'stepOver':
      this._sendContinuationCommand(COMMAND_STEP_OVER);
      break;

    case 'resume':
      this._sendContinuationCommand(COMMAND_RUN);
      break;

    case 'setPauseOnExceptions':
      this.replyWithError(id, 'Not implemented');
      break;

    case 'setAsyncCallStackDepth':
    case 'skipStackFrames':
      this.replyWithError(id, 'Not implemented');
      break;

    case 'getScriptSource':
      // TODO: Handle file read errors.
      // TODO: Handle non-file scriptIds
      this.replyToCommand(id, { scriptSource: await this._files.getFileSource(params.scriptId) });
      break;

    case 'setBreakpointByUrl':
      await this._setBreakpointByUrl(id, params);
      break;

    case 'removeBreakpoint':
      await this._removeBreakpoint(id, params);
      break;

    case 'evaluateOnCallFrame':
      var result = await this._connectionMultiplexer.evaluateOnCallFrame(Number(params.callFrameId), params.expression);
      this.replyToCommand(id, result);
      break;

    default:
      this.unknownMethod(id, method, params);
      break;
    }
  }

  async _setBreakpointByUrl(id: number, params: Object): Promise {
    var {lineNumber, url, columnNumber, condition} = params;
    if (!url || condition !== '' || columnNumber !== 0) {
      this.replyWithError(id, 'Invalid arguments to Debugger.setBreakpointByUrl: ' + JSON.stringify(params));
      return;
    }
    this._files.registerFile(url);

    var path = uriToPath(url);
    var breakpointId = await this._connectionMultiplexer.setBreakpoint(path, lineNumber + 1);
    this.replyToCommand(id, {
      breakpointId: breakpointId,
      locations: [
        {
          lineNumber,
          scriptId: path,
        },
      ]});
  }

  async _removeBreakpoint(id: number, params: Object): Promise {
    var {breakpointId} = params;
    await this._connectionMultiplexer.removeBreakpoint(breakpointId);
    this.replyToCommand(id, {id: breakpointId});
  }

  _debuggerEnable(id: number): void {
    this.replyToCommand(id, {});
    this._sendFakeLoaderBreakpoint();
  }

  async _getStackFrames(): Promise<Array<Object>> {
    var frames = await this._connectionMultiplexer.getStackFrames();
    return await Promise.all(
      frames.stack.map((frame, frameIndex) => this._convertFrame(frame, frameIndex)));
  }

  async _convertFrame(frame: Object, frameIndex: number): Promise<Object> {
    log('Converting frame: ' + JSON.stringify(frame));
    var {
      idOfFrame,
      functionOfFrame,
      fileUrlOfFrame,
      locationOfFrame,
    } = require('./frame');

    this._files.registerFile(fileUrlOfFrame(frame));
    return {
      callFrameId: idOfFrame(frame),
      functionName: functionOfFrame(frame),
      location: locationOfFrame(frame),
      scopeChain: await this._connectionMultiplexer.getScopesForFrame(frameIndex),
    };
  }

  // Returns one of:
  //  starting, stopping, stopped, running, break
  _getStatus(): Promise<string> {
    return this._connectionMultiplexer.getStatus();
  }

  _sendContinuationCommand(command: string): void {
    if (!this._hadFirstContinuationCommand) {
      this._hadFirstContinuationCommand = true;
      this._connectionMultiplexer.listen();
      return;
    }
    log('Sending continuation command: ' + command);
    this._connectionMultiplexer.sendContinuationCommand(command);
  }

  async _sendBreakCommand(id: number): Promise {
    var response = await this._connectionMultiplexer.sendBreakCommand();
    if (!response) {
      this.replyWithError(id, 'Unable to break');
    }
  }

  async _onStatusChanged(status: string): Promise {
    log('Sending status: ' + status);
    switch (status) {
    case STATUS_BREAK:
      await this._sendPausedMessage();
      break;
    case STATUS_RUNNING:
      this.sendMethod('Debugger.resumed');
      break;
    case STATUS_STOPPED:
    case STATUS_ERROR:
    case STATUS_END:
      this._endSession();
      break;
    case STATUS_STARTING:
    case STATUS_STOPPING:
      // These two should be hidden by the ConnectionMultiplexer
      break;
    default:
      logErrorAndThrow('Unexpected status: ' + status);
    }
  }

  // May only call when in paused state.
  async _sendPausedMessage(): Promise {
    this.sendMethod(
      'Debugger.paused',
      {
        callFrames: await this._getStackFrames(),
        reason: 'breakpoint', // TODO: better reason?
        data: {},
      });
  }

  _sendFakeLoaderBreakpoint(): void {
    this.sendMethod(
      'Debugger.paused',
      {
        callFrames: [],
        reason: 'breakpoint', // TODO: better reason?
        data: {},
      });
  }

  _endSession(): void {
    log('DebuggerHandler: Ending session');
    if (this._statusSubscription) {
      this._statusSubscription.dispose();
      this._statusSubscription = null;
    }
    this._emitter.emit(SESSION_END_EVENT);
  }
}
