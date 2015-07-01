'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {log, logError, parseDbgpMessage} = require('./utils');

// Responses to the 'satus' command
const STATUS_STARTING = 'starting';
const STATUS_STOPPING = 'stopping';
const STATUS_STOPPED = 'stopped';
const STATUS_RUNNING = 'running';
const STATUS_BREAK = 'break';

// Valid continuation commands
const COMMAND_RUN = 'run';
const COMMAND_STEP_INTO = 'step_into';
const COMMAND_STEP_OVER = 'step_over';
const COMMAND_STEP_OUT = 'step_out';
const COMMAND_STOP = 'stop';

type DbgpContext = {
  name: string;
  id: string;
};

type DbgpProperty = {
  $: {
    name: string;
    fullname: string;
    address: string;
    type: string;

    // array or object
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

/**
 * Handles sending and recieving dbgp messages over a net Socket.
 * Dbgp documentation can be found at http://xdebug.org/docs-dbgp.php
 */
class DbgpSocket {
  _socket: Socket;
  _transactionId: number;
  // Maps from transactionId -> call
  _calls: Map<number, {command: string; complete: (results: Object) => void}>;

  constructor(socket: Socket) {
    this._socket = socket;
    this._transactionId = 0;
    this._calls = new Map();

    this._socket.on('data', this._onData.bind(this));
  }

  _onData(data: Buffer | string): void {
    var message = data.toString();
    log('Recieved data: ' + message);
    var {response} = parseDbgpMessage(message);
    if (response) {
      var responseAttributes = response.$;
      var {command, transaction_id} = responseAttributes;
      var transactionId = Number(transaction_id);
      var call = this._calls.get(transactionId);
      if (!call) {
        logError('Missing call for response: ' + message);
        return;
      }
      this._calls.delete(transactionId);

      if (call.command !== command) {
        logError('Bad command in response. Found ' + command + '. expected ' + call.command);
        return;
      }
      try {
        log('Completing call: ' + message);
        call.complete(response);
      } catch (e) {
        logError('Exception: ' + e.toString() + ' handling call: ' + message);
      }
    } else {
      logError('Unexpected socket message: ' + message);
    }
  }

  getStackFrames(): Promise<Array<Object>> {
    return this._callDebugger('stack_get');
  }

  async getContextsForFrame(frameIndex: number): Promise<Array<DbgpContext>> {
    var result = await this._callDebugger('context_names', `-d ${frameIndex}`);
    return result.context.map(context => context.$);
  }

  async getContextProperties(frameIndex: number, contextId: string): Promise<Array<DbgpProperty>> {
    var result = await this._callDebugger('context_get', `-d ${frameIndex} -c ${contextId}`);
    // 0 results yields missing 'property' member
    return result.property || [];
  }

  async getPropertiesByFullname(frameIndex: number, contextId: string, fullname: string,
      page: number): Promise<Array<DbgpProperty>> {
    var result = await this._callDebugger(
      'property_value', `-d ${frameIndex} -c ${contextId} -n ${fullname} -p ${page}`);
    // property_value returns the outer property, we want the children ...
    // 0 results yields missing 'property' member
    return result.property[0].property || [];
  }

  // Returns one of:
  //  starting, stopping, stopped, running, break
  async getStatus(): Promise<string> {
    var response = await this._callDebugger('status');
    // TODO: Do we ever care about response.$.reason?
    return response.$.status;
  }

  // Continuation commands get a response, but that response
  // is a status message which occurs after execution stops.
  // TODO: Convert the status reply to an event.
  async sendContinuationCommand(command: string): Promise<string> {
    var response = await this._callDebugger(command);
    return response.$.status;
  }

  async sendBreakCommand(): Promise<boolean> {
    var response = await this._callDebugger('break');
    return response.$.success !== '0';
  }

  /**
   * Returns a breakpoint id
   */
  async setBreakpoint(filename: string, lineNumber: number): Promise<string> {
    var response = await this._callDebugger('breakpoint_set', `-t line -f ${filename} -n ${lineNumber}`);
    if (response.error) {
      throw new Error('Error setting breakpoint: ' + JSON.stringify(response));
    }
    // TODO: Validate that response.$.state === 'enabled'
    return response.$.id;
  }

  async removeBreakpoint(breakpointId: string): Promise {
    var response = await this._callDebugger('breakpoint_remove', `-d ${breakpointId}`);
    if (response.error) {
      throw new Error('Error removing breakpoint: ' + JSON.stringify(response));
    }
  }

  // Sends command to hhvm.
  // Returns an object containing the resulting attributes.
  _callDebugger(command: string, params: ?string): Promise<Object> {
    var transactionId = this._sendCommand(command, params);
    return new Promise((resolve, reject) => {
      this._calls.set(transactionId, {
        command,
        complete: result => resolve(result),
      });
    });
  }

  _sendCommand(command: string, params: ?string): number {
    var id = ++this._transactionId;
    var message = `${command} -i ${id}`;
    if (params) {
      message += ' ' + params;
    }
    this._sendMessage(message);
    return id;
  }

  _sendMessage(message: string): void {
    if (this._socket) {
      log('Sending message: ' + message);
      this._socket.write(message + '\x00');
    } else {
      logError('Attempt to send message after dispose: ' + message);
    }
  }

  dispose(): void {
    if (this._socket) {
      // end - Sends the FIN packet and closes writing.
      // destroy - closes for reading and writing.
      this._socket.end();
      this._socket.destroy();
      this._socket = null;
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
  COMMAND_RUN,
  COMMAND_STEP_INTO,
  COMMAND_STEP_OVER,
  COMMAND_STEP_OUT,
  COMMAND_STOP,
};
