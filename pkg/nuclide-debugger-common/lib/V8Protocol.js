'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const TWO_CRLF = '\r\n\r\n';

/**
 * JSON-RPC protocol implementation over a read and write buffers.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class V8Protocol {

  constructor(id, logger) {
    this._id = id;
    this._logger = logger;
    this._sequence = 1;
    this._contentLength = -1;
    this._pendingRequests = new Map();
    this._rawData = new Buffer(0);
  }

  getId() {
    return this._id;
  }

  onServerError(error) {
    throw new Error('No implementation found!');
  }

  onEvent(event) {
    throw new Error('No implementation found!');
  }

  dispatchRequest(request, response) {
    throw new Error('No implementation found!');
  }

  connect(readable, writable) {
    this._outputStream = writable;

    readable.on('data', data => {
      this._rawData = Buffer.concat([this._rawData, data]);
      this._handleData();
    });
  }

  send(command, args) {
    return new Promise((resolve, reject) => {
      this._doSend(command, args, result => {
        if (result.success) {
          resolve(result);
        } else {
          reject(result);
        }
      });
    });
  }

  sendResponse(response) {
    if (response.seq > 0) {
      this._logger.error(`attempt to send more than one response for command ${response.command}`);
    } else {
      this._sendMessage('response', response);
    }
  }

  _doSend(command, args, clb) {
    const request = {
      command
    };
    if (args && Object.keys(args).length > 0) {
      request.arguments = args;
    }

    this._sendMessage('request', request);

    if (clb) {
      // store callback for this request
      this._pendingRequests.set(request.seq, clb);
    }
  }

  _sendMessage(typ, message) {
    message.type = typ;
    message.seq = this._sequence++;

    const json = JSON.stringify(message);
    const length = Buffer.byteLength(json, 'utf8');

    this._outputStream.write('Content-Length: ' + length.toString() + TWO_CRLF, 'utf8');
    this._outputStream.write(json, 'utf8');
  }

  _handleData() {
    while (true) {
      if (this._contentLength >= 0) {
        if (this._rawData.length >= this._contentLength) {
          const message = this._rawData.toString('utf8', 0, this._contentLength);
          this._rawData = this._rawData.slice(this._contentLength);
          this._contentLength = -1;
          if (message.length > 0) {
            this._dispatch(message);
          }
          continue; // there may be more complete messages to process
        }
      } else {
        const s = this._rawData.toString('utf8', 0, this._rawData.length);
        const idx = s.indexOf(TWO_CRLF);
        if (idx !== -1) {
          const match = /Content-Length: (\d+)/.exec(s);
          if (match && match[1]) {
            this._contentLength = Number(match[1]);
            this._rawData = this._rawData.slice(idx + TWO_CRLF.length);
            continue; // try to handle a complete message
          }
        }
      }
      break;
    }
  }

  _dispatch(body) {
    try {
      const rawData = JSON.parse(body);
      switch (rawData.type) {
        case 'event':
          this.onEvent(rawData);
          break;
        case 'response':
          const response = rawData;
          const clb = this._pendingRequests.get(response.request_seq);
          if (clb) {
            this._pendingRequests.delete(response.request_seq);
            clb(response);
          }
          break;
        case 'request':
          const request = rawData;
          const resp = {
            type: 'response',
            seq: 0,
            command: request.command,
            request_seq: request.seq,
            success: true
          };
          this.dispatchRequest(request, resp);
          break;
      }
    } catch (e) {
      this.onServerError(new Error(e.message || e));
    }
  }
}
exports.default = V8Protocol;