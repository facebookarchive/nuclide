"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThriftPtyServiceHandler = void 0;

function _process() {
  const data = require("../../../../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _pty_types() {
  const data = _interopRequireDefault(require("./gen-nodejs/pty_types"));

  _pty_types = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function nodePty() {
  const data = _interopRequireWildcard(require("nuclide-prebuilt-libs/pty"));

  nodePty = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
// $FlowIgnore
const logger = (0, _log4js().getLogger)('thrift-pty-server-handler');
const MAX_BUFFER_LENGTH_BYTES = 2147483647;
const DEFAULT_BUFFER_LENGTH_BYTES = 1e6;
const POLL_WAIT_TIME_MS = 50;

async function patchCurrentEnvironment(envPatches) {
  const currentEnv = Object.assign({}, (await (0, _process().getOriginalEnvironment)()));
  const filteredVariables = ['NODE_ENV', 'NODE_PATH'];

  for (const x of filteredVariables) {
    delete currentEnv[x];
  }

  return Object.assign({}, currentEnv, envPatches);
}
/**
 * These are the actual functions called by the Thrift server/service. The
 * auto-generated Thrift service handles the passing of data from the transport
 * to the function and back. But the functions aren't defined in Thrift --
 * they're defined here in a service Handler.
 */


class ThriftPtyServiceHandler {
  constructor() {
    this._pty = null;
    this._buffer = Buffer.alloc(DEFAULT_BUFFER_LENGTH_BYTES);
    this._bufferCursor = 0;
    this._exitCode = -1;
    this._encoding = 'binary';
    this._droppedBytes = 0;
    this._maxBufferPayloadBytes = 1e6;
  }

  dispose() {
    var _this$_pty;

    const pid = (_this$_pty = this._pty) === null || _this$_pty === void 0 ? void 0 : _this$_pty.pid;

    if (this._pty != null) {
      this._pty.destroy();

      this._pty = null;
      logger.info('disposed of pty with pid', pid);
    }
  }

  async poll(timeoutSec) {
    return this._poll(timeoutSec);
  }

  resize(columns, rows) {
    this._requirePty();

    if (this._pty != null) {
      this._pty.resize(columns, rows);
    }
  }

  setEncoding(encoding) {
    this._requirePty();

    if (this._pty != null) {
      this._encoding = encoding;

      this._pty.setEncoding(encoding);

      logger.info('setting encoding to', encoding);
    }
  }

  async spawn(spawnArguments, initialCommand) {
    var _this$_pty2;

    if (this._pty != null) {
      logger.warn(`pty with pid ${this._pty.pid} already exists. Not spawning.`);
      return;
    }

    const defaultSpawnCommand = '/bin/bash';

    if (!_fsPromise().default.exists(spawnArguments.command)) {
      logger.warn(`command ${spawnArguments.command} does not exist. Using ${defaultSpawnCommand} instead`);
      spawnArguments.command = defaultSpawnCommand;
    }

    logger.info('creating new pty with these arguments');
    logger.info(spawnArguments);
    this._pty = nodePty().spawn(spawnArguments.command, spawnArguments.commandArgs, {
      name: spawnArguments.name,
      cwd: spawnArguments.cwd,
      env: await patchCurrentEnvironment(spawnArguments.envPatches),
      cols: spawnArguments.cols,
      rows: spawnArguments.rows
    });

    this._addListeners(this._pty);

    if (initialCommand != null) {
      this.writeInput(initialCommand);
    }

    logger.info('Spawned pty with pid', (_this$_pty2 = this._pty) === null || _this$_pty2 === void 0 ? void 0 : _this$_pty2.pid);
  }

  writeInput(data) {
    this._requirePty();

    if (this._pty != null) {
      this._pty.write(data);
    }
  }

  async executeCommand(data, minBytesOutput, timeoutSec) {
    return this._executeCommand(data, minBytesOutput, timeoutSec);
  } // client api entrypoints above this point
  // private methods below this point


  _addListeners(pty) {
    const dataCallback = chunk => {
      const lenNewData = Buffer.byteLength(chunk);
      const bufferLength = this._buffer.length;
      const finalCursor = this._bufferCursor + lenNewData;

      if (finalCursor > bufferLength) {
        if (finalCursor > MAX_BUFFER_LENGTH_BYTES) {
          // TODO add backpressure to pty output
          this._droppedBytes += lenNewData;
          return;
        }

        this._expandBuffer(finalCursor);
      }

      this._buffer.write(chunk, this._bufferCursor);

      this._bufferCursor += lenNewData;
    };

    pty.addListener('data', dataCallback);
    pty.addListener('exit', (code, signal) => {
      logger.info('got exit code', code, 'signal', signal);
      this._exitCode = code;
      this.dispose();
    });
  }

  _expandBuffer(requiredLength) {
    if (requiredLength > MAX_BUFFER_LENGTH_BYTES) {
      throw new Error(`Max buffer size is ${MAX_BUFFER_LENGTH_BYTES} (requested ${requiredLength})`);
    }

    const newLength = Math.min(requiredLength * 2, MAX_BUFFER_LENGTH_BYTES);
    const newBuffer = Buffer.alloc(newLength);

    this._buffer.copy(newBuffer, 0, 0, this._bufferCursor);

    this._buffer = newBuffer;
  }

  _drainOutputFromBuffer() {
    const exceedsMaxPayload = this._bufferCursor > this._maxBufferPayloadBytes;
    let chunk;

    if (exceedsMaxPayload) {
      // return first n bytes of buffer
      chunk = this._buffer.slice(0, this._maxBufferPayloadBytes); // move buffer data to the left

      this._buffer.copy(this._buffer, 0, // dest start
      this._maxBufferPayloadBytes, // src start
      this._bufferCursor // src end
      ); // move cursor back by the amount we stripped off the front


      this._bufferCursor -= this._maxBufferPayloadBytes;
    } else {
      // send the whole buffer
      chunk = this._buffer.slice(0, this._bufferCursor);
      this._bufferCursor = 0;
    }

    return chunk;
  }

  _poll(timeoutSec) {
    return new Promise((resolve, reject) => {
      const SEC_TO_MSEC = 1000;
      const maxAttempts = timeoutSec * SEC_TO_MSEC / POLL_WAIT_TIME_MS;
      let i = 0;

      if (this._pty == null) {
        const pollEvent = new (_pty_types().default.PollEvent)();
        pollEvent.eventType = _pty_types().default.PollEventType.NO_PTY;
        pollEvent.chunk = null;
        pollEvent.exitCode = this._exitCode;
        resolve(pollEvent);
        return;
      }

      const doPoll = () => {
        i++;

        if (i > maxAttempts) {
          const pollEvent = new (_pty_types().default.PollEvent)();
          pollEvent.eventType = _pty_types().default.PollEventType.TIMEOUT;
          pollEvent.chunk = null;
          resolve(pollEvent);
          return;
        }

        if (this._bufferCursor) {
          const pollEvent = new (_pty_types().default.PollEvent)();
          pollEvent.eventType = _pty_types().default.PollEventType.NEW_OUTPUT;
          pollEvent.chunk = this._drainOutputFromBuffer();
          resolve(pollEvent);
          return;
        }

        setTimeout(doPoll, POLL_WAIT_TIME_MS);
      };

      doPoll();
    });
  }

  _requirePty() {
    if (this._pty == null) {
      throw new (_pty_types().default.Error)({
        message: 'no pty'
      });
    }
  }

  async _executeCommand(data, minBytesOutput, timeoutSec) {
    return new Promise((resolve, reject) => {
      this._requirePty();

      if (minBytesOutput > this._maxBufferPayloadBytes) {
        throw new Error('Cannot return more than ${this._maxBufferPayloadBytes} bytes in one response');
      }

      if (timeoutSec < 0) {
        throw new Error('timeout time must be positive');
      }

      const startTime = Date.now();
      const deadline = startTime + timeoutSec * 1000;

      const collectBytes = () => {
        if (this._bufferCursor >= minBytesOutput) {
          const buffer = this._drainOutputFromBuffer();

          resolve(buffer);
          return;
        } else {
          const timeRemaining = deadline - Date.now();

          if (timeRemaining <= 0) {
            reject(new Error('timeout. got ' + this._bufferCursor + 'bytes but needed' + minBytesOutput));
            return;
          }
        }

        setTimeout(collectBytes, POLL_WAIT_TIME_MS);
      };

      collectBytes();
    });
  }

}

exports.ThriftPtyServiceHandler = ThriftPtyServiceHandler;