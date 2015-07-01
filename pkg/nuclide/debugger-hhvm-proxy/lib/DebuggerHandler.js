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
  COMMAND_RUN,
  COMMAND_STEP_INTO,
  COMMAND_STEP_OVER,
  COMMAND_STEP_OUT,
  COMMAND_STOP,
} = require('./DbgpSocket');

const SESSION_END_EVENT = 'session-end-event';

// Handles all 'Debug.*' Chrome dev tools messages
class DebuggerHandler extends Handler {
  _socket: DbgpSocket;
  _dataCache: DataCache;
  _files: FileCache;
  _emitter: EventEmitter;

  constructor(callback: ChromeCallback, socket: DbgpSocket, dataCache: DataCache) {
    super('Debugger', callback);

    this._socket = socket;
    this._dataCache = dataCache;
    var FileCache = require('./FileCache');
    this._files = new FileCache(callback);
    var {EventEmitter} = require('events');
    this._emitter = new EventEmitter();
  }

  onSessionEnd(callback: () => void): void {
    log('onSessionEnd');
    this._emitter.on(SESSION_END_EVENT, callback);
  }

  async handleMethod(id: number, method: string, params: ?Object): Promise {

    switch (method) {

    // TODO: Add Console (aka logging) support
    case 'enable':
      await this._debuggerEnable(id);
      break;

    case 'pause':
      await this._sendBreakCommand(id);
      break;

    case 'stepInto':
      await this._sendContinuationCommand(COMMAND_STEP_INTO);
      break;

    case 'stepOut':
      await this._sendContinuationCommand(COMMAND_STEP_OUT);
      break;

    case 'stepOver':
      await this._sendContinuationCommand(COMMAND_STEP_OVER);
      break;

    case 'resume':
      await this._sendContinuationCommand(COMMAND_RUN);
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
      var breakpointId = await this._socket.setBreakpoint(path, lineNumber + 1);
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
    await this._socket.removeBreakpoint(breakpointId);
    this.replyToCommand(id, {id: breakpointId});
  }

  async _debuggerEnable(id: number): Promise {
    await this._sendStatus(await this._getStatus());
    this.replyToCommand(id, {});
  }

  async _getStackFrames(): Promise<Array<Object>> {
    var frames = await this._socket.getStackFrames();
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
        scopeChain: await this._dataCache.getScopesForFrame(frameIndex),
      };
    } catch (e) {
      logErrorAndThrow('Exception converting frame: ' + e + ' ' + e.stack);
    }
  }

  // Returns one of:
  //  starting, stopping, stopped, running, break
  _getStatus(): Promise<string> {
    return this._socket.getStatus();
  }

  // Continuation commands get a response, but that response
  // is a status message which occurs after execution stops.
  async _sendContinuationCommand(command: string): Promise {
    log('Sending continuation command: ' + command);
    this._dataCache.disable();
    var statusPromise = this._socket.sendContinuationCommand(command);
    this.sendMethod('Debugger.resumed');
    await this._sendStatus(await statusPromise);
  }

  async _sendBreakCommand(id: number): Promise {
    var response = await this._socket.sendBreakCommand();
    if (!response) {
      this.replyWithError(id, 'Unable to break');
    }
  }

  async _sendStatus(status: string): Promise {
    log('Sending status: ' + status);
    switch (status) {
    case STATUS_STARTING:
      // Starting status has no stack.
      // step before reporting initial status to get to the first instruction.
      await this._sendContinuationCommand(COMMAND_STEP_INTO);
      break;
    case STATUS_BREAK:
      this._dataCache.enable();
      await this._sendPausedMessage();
      break;
    case STATUS_RUNNING:
      logErrorAndThrow('Unexpected running status');
      break;
    case STATUS_STOPPING:
      // TODO: May want to enable post-mortem features?
      await this._sendContinuationCommand(COMMAND_STOP);
      break;
    case STATUS_STOPPED:
      this.sendMethod(
        'Debugger.paused',
        {
          callFrames: [],
          reason: 'breakpoint', // TODO: better reason?
          data: {},
        });
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
    this._emitter.emit(SESSION_END_EVENT);
  }
}

module.exports = DebuggerHandler;
