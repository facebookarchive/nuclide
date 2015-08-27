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

import type {Connection} from './Connection';
import type ChromeCallback from './ChromeCallback';
import type FileCache from './FileCache';
import type {EventEmitter} from 'events';

var /* const */ SESSION_END_EVENT = 'session-end-event';

// Handles all 'Debug.*' Chrome dev tools messages
class DebuggerHandler extends Handler {
  _connection: Connection;
  _files: FileCache;
  _emitter: EventEmitter;
  _statusSubscription: ?Disposable;

  constructor(callback: ChromeCallback, connection: Connection) {
    super('Debugger', callback);

    this._connection = connection;
    var FileCache = require('./FileCache');
    this._files = new FileCache(callback);
    var {EventEmitter} = require('events');
    this._emitter = new EventEmitter();
    this._statusSubscription = this._connection.onStatus(this._onStatusChanged.bind(this));
  }

  onSessionEnd(callback: () => void): void {
    log('onSessionEnd');
    this._emitter.on(SESSION_END_EVENT, callback);
  }

  async handleMethod(id: number, method: string, params: Object): Promise {

    switch (method) {

    // TODO: Add Console (aka logging) support
    case 'enable':
      await this._debuggerEnable(id);
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
      var result = await this._connection.evaluateOnCallFrame(Number(params.callFrameId), params.expression);
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

    try {
      var path = uriToPath(url);
      this._files.registerFile(path);
      var breakpointId = await this._connection.setBreakpoint(path, lineNumber + 1);
      this.replyToCommand(id, {
        breakpointId: breakpointId,
        locations: [
          {
            lineNumber,
            scriptId: path,
          },
        ]});
      } catch (e) {
        this.replyWithError(id, e.message);
      }
  }

  async _removeBreakpoint(id: number, params: Object): Promise {
    var {breakpointId} = params;
    await this._connection.removeBreakpoint(breakpointId);
    this.replyToCommand(id, {id: breakpointId});
  }

  async _debuggerEnable(id: number): Promise {
    this.replyToCommand(id, {});
    this._onStatusChanged(await this._getStatus());
  }

  async _getStackFrames(): Promise<Array<Object>> {
    var frames = await this._connection.getStackFrames();
    return await Promise.all(
      frames.stack.map((frame, frameIndex) => this._convertFrame(frame, frameIndex)));
  }

  async _convertFrame(frame: Object, frameIndex: number): Promise<Object> {
    log('Converting frame: ' + JSON.stringify(frame));
    try {
      var {
        idOfFrame,
        functionOfFrame,
        fileOfFrame,
        locationOfFrame,
      } = require('./frame');

      this._files.registerFile(fileOfFrame(frame));
      return {
        callFrameId: idOfFrame(frame),
        functionName: functionOfFrame(frame),
        location: locationOfFrame(frame),
        scopeChain: await this._connection.getScopesForFrame(frameIndex),
      };
    } catch (e) {
      logErrorAndThrow('Exception converting frame: ' + e + ' ' + e.stack);
      throw e;  // silence flow error.
    }
  }

  // Returns one of:
  //  starting, stopping, stopped, running, break
  _getStatus(): Promise<string> {
    return this._connection.getStatus();
  }

  _sendContinuationCommand(command: string): void {
    log('Sending continuation command: ' + command);
    this._connection.sendContinuationCommand(command);
  }

  async _sendBreakCommand(id: number): Promise {
    var response = await this._connection.sendBreakCommand();
    if (!response) {
      this.replyWithError(id, 'Unable to break');
    }
  }

  async _onStatusChanged(status: string): Promise {
    log('Sending status: ' + status);
    switch (status) {
    case STATUS_STARTING:
      // Starting status has no stack.
      // step before reporting initial status to get to the first instruction.
      this._sendContinuationCommand(COMMAND_STEP_INTO);
      break;
    case STATUS_BREAK:
      await this._sendPausedMessage();
      break;
    case STATUS_RUNNING:
      this.sendMethod('Debugger.resumed');
      break;
    case STATUS_STOPPING:
      // TODO: May want to enable post-mortem features?
      this._sendContinuationCommand(COMMAND_RUN);
      break;
    case STATUS_STOPPED:
    case STATUS_ERROR:
    case STATUS_END:
      this._endSession();
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

  _endSession(): void {
    log('DebuggerHandler: Ending session');
    if (this._statusSubscription) {
      this._statusSubscription.dispose();
      this._statusSubscription = null;
    }
    this._emitter.emit(SESSION_END_EVENT);
  }
}

module.exports = DebuggerHandler;
