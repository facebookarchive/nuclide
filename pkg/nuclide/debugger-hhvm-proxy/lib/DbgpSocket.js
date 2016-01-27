'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import logger from './utils';
import {EventEmitter} from 'events';
import {DbgpMessageHandler, getDbgpMessageHandlerInstance} from './DbgpMessageHandler';
import type {Socket} from 'net';

// Responses to the DBGP 'status' command
const STATUS_STARTING = 'starting';
const STATUS_STOPPING = 'stopping';
const STATUS_STOPPED = 'stopped';
const STATUS_RUNNING = 'running';
const STATUS_BREAK = 'break';
// Error and End are not dbgp status codes, they relate to socket states.
const STATUS_ERROR = 'error';
const STATUS_END = 'end';

// Valid continuation commands
const COMMAND_RUN = 'run';
const COMMAND_STEP_INTO = 'step_into';
const COMMAND_STEP_OVER = 'step_over';
const COMMAND_STEP_OUT = 'step_out';
const COMMAND_STOP = 'stop';
const COMMAND_DETACH = 'detach';

const DBGP_SOCKET_STATUS_EVENT = 'dbgp-socket-status';

export type DbgpContext = {
  name: string;
  id: string;
};

export type DbgpProperty = {
  $: {
    name: string;
    fullname: string;
    address: string;
    type: string;

    // array or object
    classname?: string;
    children?: boolean;
    numChildren?: number;
    page?: number;
    pagesize?: number;

    // string
    size?: number;
    encoding?: string;
  };

  // Value if present, subject to encoding if present
  _?: string;

  // array or object members
  property?: Array<DbgpProperty>;
};

type EvaluationResult = {
  error?: Object;
  result?: ?DbgpProperty;
  wasThrown: boolean;
};

/**
 * Handles sending and recieving dbgp messages over a net Socket.
 * Dbgp documentation can be found at http://xdebug.org/docs-dbgp.php
 */
class DbgpSocket {
  _socket: ?Socket;
  _transactionId: number;
  // Maps from transactionId -> call
  _calls: Map<number, {command: string; complete: (results: Object) => void}>;
  _emitter: EventEmitter;
  _isClosed: boolean;
  _messageHandler: DbgpMessageHandler;

  constructor(socket: Socket) {
    this._socket = socket;
    this._transactionId = 0;
    this._calls = new Map();
    this._emitter = new EventEmitter();
    this._isClosed = false;
    this._messageHandler = getDbgpMessageHandlerInstance();

    socket.on('end', this._onEnd.bind(this));
    socket.on('error', this._onError.bind(this));
    socket.on('data', this._onData.bind(this));
  }

  onStatus(callback: (status: string) => mixed): IDisposable {
    return require('../../commons').event
      .attachEvent(this._emitter, DBGP_SOCKET_STATUS_EVENT, callback);
  }

  _onError(error: {code: number}): void {
    // Not sure if hhvm is alive or not
    // do not set _isClosed flag so that detach will be sent before dispose().
    logger.logError('socket error ' + error.code);
    this._emitStatus(STATUS_ERROR);
  }

  _onEnd(): void {
    this._isClosed = true;
    this.dispose();
    this._emitStatus(STATUS_END);
  }

  _onData(data: Buffer | string): void {
    const message = data.toString();
    logger.log('Recieved data: ' + message);
    const responses = this._messageHandler.parseMessages(message);
    responses.forEach(r => {
      const response = r.response;
      if (response) {
        const responseAttributes = response.$;
        const {command, transaction_id} = responseAttributes;
        const transactionId = Number(transaction_id);
        const call = this._calls.get(transactionId);
        if (!call) {
          logger.logError('Missing call for response: ' + message);
          return;
        }
        this._calls.delete(transactionId);

        if (call.command !== command) {
          logger.logError('Bad command in response. Found ' +
            command + '. expected ' + call.command);
          return;
        }
        try {
          logger.log('Completing call: ' + message);
          call.complete(response);
        } catch (e) {
          logger.logError('Exception: ' + e.toString() + ' handling call: ' + message);
        }
      } else {
        logger.logError('Unexpected socket message: ' + message);
      }
    });
  }

  getStackFrames(): Promise<Object> {
    return this._callDebugger('stack_get');
  }

  async getContextsForFrame(frameIndex: number): Promise<Array<DbgpContext>> {
    const result = await this._callDebugger('context_names', `-d ${frameIndex}`);
    return result.context.map(context => context.$);
  }

  async getContextProperties(frameIndex: number, contextId: string): Promise<Array<DbgpProperty>> {
    const result = await this._callDebugger('context_get', `-d ${frameIndex} -c ${contextId}`);
    // 0 results yields missing 'property' member
    return result.property || [];
  }

  async getPropertiesByFullname(frameIndex: number, contextId: string, fullname: string,
      page: number): Promise<Array<DbgpProperty>> {
    const result = await this._callDebugger(
      'property_value', `-d ${frameIndex} -c ${contextId} -n ${fullname} -p ${page}`);
    // property_value returns the outer property, we want the children ...
    // 0 results yields missing 'property' member
    return result.property[0].property || [];
  }

  async getPropertiesByFullnameAllConexts(
    frameIndex: number,
    fullname: string,
    page: number,
  ): Promise<Array<DbgpProperty>> {
    // Pass zero as contextId to search all contexts.
    return await this.getPropertiesByFullname(frameIndex, /*contextId*/'0', fullname, page);
  }

  async evaluateOnCallFrame(frameIndex: number, expression: string): Promise<EvaluationResult> {
    // Escape any double quote in the expression.
    const escapedExpression = expression.replace(/"/g, '\\"');
    // Quote the input expression so that we can support expression with
    // space in it(e.g. function evaluation).
    const result = await this._callDebugger(
      'property_value',
      `-d ${frameIndex} -n "${escapedExpression}"`
    );
    if (result.error && result.error.length > 0) {
      return {
        error: result.error[0],
        wasThrown: true,
      };
    }
    return {
      result: result.property[0] || [],
      wasThrown: false,
    };
  }

  // Returns one of:
  //  starting, stopping, stopped, running, break
  async getStatus(): Promise<string> {
    const response = await this._callDebugger('status');
    // TODO: Do we ever care about response.$.reason?
    return response.$.status;
  }

  // Continuation commands get a response, but that response
  // is a status message which occurs after execution stops.
  async sendContinuationCommand(command: string): Promise<string> {
    this._emitStatus(STATUS_RUNNING);
    const response = await this._callDebugger(command);
    const status = response.$.status;
    this._emitStatus(status);
    return status;
  }

  async sendBreakCommand(): Promise<boolean> {
    const response = await this._callDebugger('break');
    return response.$.success !== '0';
  }

  /**
   * Returns the exception breakpoint id.
   */
  async setExceptionBreakpoint(exceptionName: string): Promise<string> {
    const response = await this._callDebugger('breakpoint_set', `-t exception -x ${exceptionName}`);
    if (response.error) {
      throw new Error('Error from setPausedOnExceptions: ' + JSON.stringify(response));
    }
    // TODO: Validate that response.$.state === 'enabled'
    return response.$.id;
  }

  /**
   * Returns a breakpoint id
   */
  async setBreakpoint(filename: string, lineNumber: number): Promise<string> {
    const response = await this._callDebugger(
      'breakpoint_set',
      `-t line -f ${filename} -n ${lineNumber}`
    );
    if (response.error) {
      throw new Error('Error setting breakpoint: ' + JSON.stringify(response));
    }
    // TODO: Validate that response.$.state === 'enabled'
    return response.$.id;
  }

  async removeBreakpoint(breakpointId: string): Promise {
    const response = await this._callDebugger('breakpoint_remove', `-d ${breakpointId}`);
    if (response.error) {
      throw new Error('Error removing breakpoint: ' + JSON.stringify(response));
    }
  }

  // Sends command to hhvm.
  // Returns an object containing the resulting attributes.
  _callDebugger(command: string, params: ?string): Promise<Object> {
    const transactionId = this._sendCommand(command, params);
    return new Promise((resolve, reject) => {
      this._calls.set(transactionId, {
        command,
        complete: result => resolve(result),
      });
    });
  }

  _sendCommand(command: string, params: ?string): number {
    const id = ++this._transactionId;
    let message = `${command} -i ${id}`;
    if (params) {
      message += ' ' + params;
    }
    this._sendMessage(message);
    return id;
  }

  _sendMessage(message: string): void {
    const socket = this._socket;
    if (socket != null) {
      logger.log('Sending message: ' + message);
      socket.write(message + '\x00');
    } else {
      logger.logError('Attempt to send message after dispose: ' + message);
    }
  }

  _emitStatus(status: string): void {
    logger.log('Emitting status: ' + status);
    this._emitter.emit(DBGP_SOCKET_STATUS_EVENT, status);
  }

  dispose(): void {
    if (!this._isClosed) {
      // TODO[jeffreytan]: workaround a crash(t8181538) in hhvm
      this.sendContinuationCommand(COMMAND_DETACH);
    }

    const socket = this._socket;
    if (socket) {
      // end - Sends the FIN packet and closes writing.
      // destroy - closes for reading and writing.
      socket.end();
      // $FlowIssue - t9258852
      socket.destroy();
      this._socket = null;
      this._isClosed = true;
    }
  }
}

module.exports = {
  DbgpSocket,
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
  COMMAND_DETACH,
};
