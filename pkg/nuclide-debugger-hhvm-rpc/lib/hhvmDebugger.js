"use strict";

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

var _child_process = _interopRequireDefault(require("child_process"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _vscodeDebugadapter() {
  const data = require("vscode-debugadapter");

  _vscodeDebugadapter = function () {
    return data;
  };

  return data;
}

var _net = _interopRequireDefault(require("net"));

var _os = _interopRequireDefault(require("os"));

function _2() {
  const data = require("..");

  _2 = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const TWO_CRLF = '\r\n\r\n';
const CONTENT_LENGTH_PATTERN = new RegExp('Content-Length: (\\d+)');
const DEFAULT_HHVM_DEBUGGER_PORT = 8999;

class HHVMDebuggerWrapper {
  constructor() {
    this._sequenceNumber = 0;
    this._currentContentLength = 0;
    this._currentOutputData = '';
    this._currentInputData = '';
    this._bufferedRequests = [];
    this._debugging = false;
    this._debuggerWriteCallback = null;
    this._nonLoaderBreakSeen = false;
    this._initializeArgs = {
      adapterID: 'hhvm'
    };
    this._asyncBreakPending = false;
    this._connectionRefused = false;
  }

  debug() {
    process.on('SIGUSR2', () => {
      this._writeOutputWithHeader({
        seq: ++this._sequenceNumber,
        type: 'event',
        event: 'hhvmSigUsr2'
      });

      process.exit();
    });
    process.stdin.on('data', chunk => {
      this._processClientMessage(chunk);
    }); // If Nuclide exits, so shall we.

    process.on('disconnect', () => {
      process.exit();
    });
  }

  async _attachTarget(attachMessage, retries = 0) {
    const attachArgs = attachMessage.arguments;
    const args = await (0, _2().getDebuggerArgs)(attachArgs);
    const attachPort = args.debugPort != null ? parseInt(args.debugPort, 10) : DEFAULT_HHVM_DEBUGGER_PORT;

    if (Number.isNaN(attachPort)) {
      throw new Error('Invalid HHVM debug port specified.');
    }

    if (args.sandboxUser == null || args.sandboxUser.trim() === '') {
      args.sandboxUser = _os.default.userInfo().username;
    }

    attachMessage.arguments = Object.assign({}, attachMessage.arguments, args);
    const socket = new _net.default.Socket();
    socket.once('connect', () => {
      socket.on('data', chunk => {
        this._processDebuggerMessage(chunk);
      });
      socket.on('close', () => {
        if (!this._connectionRefused) {
          this._writeOutputWithHeader({
            seq: ++this._sequenceNumber,
            type: 'event',
            event: 'hhvmConnectionDied'
          });
        }

        process.exit(0);
      });
      socket.on('disconnect', () => {
        process.stderr.write('The connection to the debug target has been closed.\n');
        process.exit(0);
      });

      const callback = data => {
        socket.write(data + '\0', 'utf8');
      };

      callback(JSON.stringify(attachMessage));
      this._debuggerWriteCallback = callback;

      this._forwardBufferedMessages();

      this._debugging = true;
      const attachResponse = {
        request_seq: attachMessage.seq,
        success: true,
        command: attachMessage.command
      };

      this._writeResponseMessage(attachResponse);
    }).on('error', error => {
      if (retries >= 5) {
        process.stderr.write('Error communicating with debugger target: ' + error.toString() + '\n');

        try {
          // $FlowFB
          const fbConfig = require("./fbConfig");

          process.stderr.write(fbConfig.getRestartInstructions() + '\n');
        } catch (_) {}

        process.exit(error.code);
      } else {
        // When reconnecting to a target we just disconnected from, especially
        // in the case of an unclean disconnection, it may take a moment
        // for HHVM to receive a TCP socket error and realize the client is
        // gone. Rather than failing to reconnect, wait a moment and try
        // again to provide a better user experience.
        setTimeout(() => {
          attachMessage.arguments = attachArgs;

          this._attachTarget(attachMessage, retries + 1);
        }, 2000);
      }
    });
    socket.connect({
      port: attachPort,
      host: 'localhost'
    });
  }

  async _launchTarget(launchMessage) {
    const launchConfig = launchMessage.arguments;

    if (launchConfig.deferLaunch) {
      await this._launchTargetInTerminal(launchMessage);
      return;
    }

    const args = await (0, _2().getDebuggerArgs)(launchConfig);
    const hhvmPath = args.hhvmPath;

    if (hhvmPath == null || hhvmPath === '') {
      throw new Error('Expected a path to HHVM.');
    }

    if (args.sandboxUser == null || args.sandboxUser.trim() === '') {
      args.sandboxUser = _os.default.userInfo().username;
    }

    const hhvmArgs = args.hhvmArgs;
    const options = {
      cwd: args.cwd != null ? args.cwd : process.cwd(),
      // FD[3] is used for communicating with the debugger extension.
      // STDIN, STDOUT and STDERR are the actual PHP streams.
      // If launchMessage.noDebug is specified, start the child but don't
      // connect the debugger fd pipe.
      stdio: Boolean(launchConfig.noDebug) ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe', 'pipe'],
      // When the wrapper exits, so does the target.
      detached: false,
      env: process.env
    };

    const targetProcess = _child_process.default.spawn(hhvmPath, hhvmArgs, options); // Exit with the same error code the target exits with.


    targetProcess.on('exit', code => process.exit(code));
    targetProcess.on('error', error => process.stderr.write(error.toString() + '\n')); // Wrap any stdout from the target into a VS Code stdout event.

    targetProcess.stdout.on('data', chunk => {
      const block = chunk.toString();

      this._writeOutputEvent('stdout', block);
    });
    targetProcess.stdout.on('error', () => {}); // Wrap any stderr from the target into a VS Code stderr event.

    targetProcess.stderr.on('data', chunk => {
      const block = chunk.toString();

      this._writeOutputEvent('stderr', block);
    });
    targetProcess.stderr.on('error', () => {});
    targetProcess.stdio[3].on('data', chunk => {
      this._processDebuggerMessage(chunk);
    });
    targetProcess.stdio[3].on('error', () => {}); // Read data from the debugger client on stdin and forward to the
    // debugger engine in the target.

    const callback = data => {
      targetProcess.stdio[3].write(data + '\0', 'utf8');
    };

    launchMessage.arguments = args;
    callback(JSON.stringify(launchMessage));
    this._debuggerWriteCallback = callback;

    this._forwardBufferedMessages();

    this._debugging = true;
  }

  async _launchTargetInTerminal(requestMessage) {
    const launchConfig = requestMessage.arguments; // This is a launch in terminal request. Perform the launch and then
    // return an attach configuration.

    const startupArgs = await (0, _2().getLaunchArgs)(launchConfig); // Terminal args require everything to be a string, but debug port
    // is typed as a number.

    const terminalArgs = [startupArgs.hhvmPath];

    for (const arg of startupArgs.hhvmArgs) {
      terminalArgs.push(String(arg));
    }

    const runInTerminalArgs = {
      kind: 'integrated',
      cwd: _nuclideUri().default.dirname(launchConfig.targetUri),
      args: terminalArgs
    };

    this._writeOutputWithHeader({
      seq: ++this._sequenceNumber,
      type: 'request',
      command: 'runInTerminal',
      arguments: runInTerminalArgs
    });

    this._runInTerminalRequest = new (_promise().Deferred)();
    await this._runInTerminalRequest.promise;
    const attachConfig = {
      targetUri: launchConfig.targetUri,
      action: 'attach',
      debugPort: startupArgs.debugPort
    };
    await this._attachTarget(Object.assign({}, requestMessage, {
      arguments: attachConfig
    }));
  }

  _forwardBufferedMessages() {
    if (this._debuggerWriteCallback != null) {
      const callback = this._debuggerWriteCallback;

      for (const requestMsg of this._bufferedRequests) {
        callback(JSON.stringify(requestMsg));
      }
    }
  }

  _processClientMessage(chunk) {
    this._currentInputData += chunk.toString();

    while (true) {
      if (this._currentContentLength === 0) {
        // Look for a content length header.
        this._readContentHeader();
      }

      const length = this._currentContentLength;

      if (length === 0 || this._currentInputData.length < length) {
        // We're not expecting a message, or the amount of data we have
        // available is smaller than the expected message. Wait for more data.
        break;
      }

      const message = this._currentInputData.substr(0, length);

      const requestMsg = JSON.parse(message);

      if (!this._handleWrapperRequest(requestMsg)) {
        const callback = this._debuggerWriteCallback;

        if (callback != null) {
          callback(this._translateNuclideRequest(requestMsg));
        }
      } // Reset state and expect another content length header next.


      this._currentContentLength = 0;
      this._currentInputData = this._currentInputData.substr(length);
    }
  }

  _translateNuclideRequest(requestMsg) {
    // Nuclide has some extension messages that are not actually part of the
    // VS Code Debug protocol. These are prefixed with "nuclide_" to indicate
    // that they are non-standard requests. Since the HHVM side is agnostic
    // to what IDE it is talking to, these same commands (if they are available)
    // are actually prefixed with a more generic 'fb_' so convert.
    if (requestMsg.command != null && requestMsg.command.startsWith('nuclide_')) {
      requestMsg.command = requestMsg.command.replace('nuclide_', 'fb_');
      return JSON.stringify(requestMsg);
    }

    return JSON.stringify(requestMsg);
  }

  _handleWrapperRequest(requestMsg) {
    // Certain messages should be handled in the wrapper rather than forwarding
    // to HHVM.
    if (requestMsg.command != null) {
      switch (requestMsg.command) {
        case 'initialize':
          this._initializeArgs = requestMsg.arguments;

          this._writeResponseMessage({
            request_seq: requestMsg.seq,
            success: true,
            command: requestMsg.command,
            body: {
              exceptionBreakpointFilters: [{
                default: false,
                label: 'Break On All Exceptions',
                filter: 'all'
              }],
              supportsLoadedSourcesRequest: false,
              supportTerminateDebuggee: false,
              supportsExceptionOptions: true,
              supportsModulesRequest: false,
              supportsHitConditionalBreakpoints: false,
              supportsConfigurationDoneRequest: true,
              supportsDelayedStackTraceLoading: true,
              supportsSetVariable: true,
              supportsGotoTargetsRequest: false,
              supportsExceptionInfoRequest: false,
              supportsValueFormattingOptions: true,
              supportsEvaluateForHovers: true,
              supportsRestartRequest: false,
              supportsConditionalBreakpoints: true,
              supportsStepBack: false,
              supportsCompletionsRequest: true,
              supportsRestartFrame: false,
              supportsStepInTargetsRequest: false,
              // Experimental support for terminate thread
              supportsTerminateThreadsRequest: true,
              // Non-standard capability to indicate we send a custom event when
              // the startup doc for the console REPL is complete, so that a client
              // can wait for this event before offering the console.
              supportsReadyForEvaluationsEvent: true
            }
          });

          break;

        case 'disconnect':
          this._writeResponseMessage({
            request_seq: requestMsg.seq,
            success: true,
            command: requestMsg.command
          }); // Exit this process, which will also result in the child being killed
          // (in the case of Launch mode), or the socket to the child being
          // terminated (in the case of Attach mode).


          process.exit(0);
          return true;

        case 'launch':
          this._launchTarget(requestMsg);

          return true;

        case 'attach':
          this._attachTarget(requestMsg);

          return true;

        case 'runInTerminal':
          if (this._runInTerminalRequest != null) {
            if (requestMsg.success) {
              this._runInTerminalRequest.resolve();
            } else {
              this._runInTerminalRequest.reject(new Error(requestMsg.message));
            }
          }

          return true;

        case 'pause':
          {
            this._asyncBreakPending = true;
            return false;
          }

        default:
          break;
      }
    }

    if (!this._debugging) {
      // If debugging hasn't started yet, we need to buffer this request to
      // send to the backend once a connection has been established.
      this._bufferedRequests.push(requestMsg);

      return true;
    }

    return false;
  }

  _processDebuggerMessage(chunk) {
    this._currentOutputData += chunk.toString(); // The messages from HHVM are each terminated by a NULL character.
    // Process any complete messages from HHVM.

    let idx = this._currentOutputData.indexOf('\0');

    while (idx > 0) {
      const message = this._currentOutputData.substr(0, idx); // Add a sequence number to the data.


      try {
        const obj = JSON.parse(message);
        obj.seq = ++this._sequenceNumber;

        this._writeOutputWithHeader(obj);
      } catch (e) {
        process.stderr.write(`Error parsing message from target: ${e.toString()}: ${message}\n`);
      } // Advance to idx + 1 (lose the NULL char)


      this._currentOutputData = this._currentOutputData.substr(idx + 1);
      idx = this._currentOutputData.indexOf('\0');
    }
  }

  _readContentHeader() {
    const idx = this._currentInputData.indexOf(TWO_CRLF);

    if (idx <= 0) {
      return;
    }

    const header = this._currentInputData.substr(0, idx);

    const match = header.match(CONTENT_LENGTH_PATTERN);

    if (match == null) {
      throw new Error('Unable to parse message from debugger client');
    } // Chop the Content-Length header off the input data and start looking for
    // the message.


    this._currentContentLength = parseInt(match[1], 10);
    this._currentInputData = this._currentInputData.substr(idx + TWO_CRLF.length);
    ++this._sequenceNumber;
  }

  _writeOutputEvent(eventType, message) {
    const outputEvent = {
      seq: ++this._sequenceNumber,
      type: 'event',
      event: 'output',
      body: {
        category: eventType,
        output: message
      }
    };

    this._writeOutputWithHeader(outputEvent);
  }

  _writeResponseMessage(message) {
    this._writeOutputWithHeader(Object.assign({
      seq: ++this._sequenceNumber,
      type: 'response'
    }, message));
  } // Helper to apply compatibility fixes and errata to messages coming
  // from HHVM. Since we have the ability to update this wrapper much
  // more quickly than a new HHVM release, this allows us to modify
  // behavior and fix compatibility bugs before presenting the messages
  // to the client.


  _applyCompatabilityFixes(message) {
    if (message.type === 'response') {
      switch (message.command) {
        case 'threads':
          {
            if (Array.isArray(message.body)) {
              // TODO(ericblue): Fix threads response on the HHVM side.
              message.body = {
                threads: message.body
              };
            }

            break;
          }

        case 'stackTrace':
          {
            message.body.stackFrames.forEach(stackFrame => {
              if (stackFrame.source != null) {
                if (stackFrame.source.path === '<unknown>') {
                  // TODO(ericblue): Delete source when there's none known.
                  delete stackFrame.source;
                } else if (_nuclideUri().default.isAbsolute(stackFrame.source.name)) {
                  // TODO(ericblue): source names shouldn't be absolute paths.
                  stackFrame.source.name = _nuclideUri().default.basename(stackFrame.source.name);
                }
              }
            });
            break;
          }

        default:
          // No fixes needed.
          break;
      }
    } else if (message.type === 'event') {
      switch (message.event) {
        case 'output':
          {
            // Nuclide console requires all output messages to end with a newline
            // to work properly.
            if (message.body != null && !message.body.output.endsWith('\n')) {
              message.body.output += '\n';
            } // Map custom output types onto explicit protocol types.


            switch (message.body.category) {
              case 'warning':
                message.body.category = 'console';
                break;

              case 'error':
                message.body.category = 'stderr';
                break;

              case 'stdout':
              case 'info':
                message.body.category = 'log';
                break;
            } // Detect HHVM refusing a connection due to another connection
            // existing and raise an explicit event for that.
            // TODO: (Ericblue) adding an explicit event in HHVM rather than
            //   relying on the specific wording of this output event.


            const attachMsg = 'Could not attach to HHVM';

            if (message.body.output.includes(attachMsg)) {
              this._connectionRefused = true;

              this._writeOutputWithHeader({
                seq: ++this._sequenceNumber,
                type: 'event',
                event: 'hhvmConnectionRefused'
              });
            }

            break;
          }

        case 'stopped':
          {
            // TODO: Ericblue: Remove this block once HHVM version that always
            // specifies preserveFocusHint is landed and the supported version.
            const reason = (message.body.reason || '').toLowerCase().split(' ')[0];
            const focusThread = message.body.threadCausedFocus != null ? message.body.threadCausedFocus : reason === 'step' || reason === 'breakpoint' || reason === 'exception';

            if (message.body.preserveFocusHint == null) {
              message.body.preserveFocusHint = !focusThread;
            }

            break;
          }

        case 'hhvmConnectionRefused':
          {
            this._connectionRefused = true;
            break;
          }

        default:
          // No fixes needed.
          break;
      }
    }
  }

  _writeOutputWithHeader(message) {
    this._applyCompatabilityFixes(message); // TODO(ericblue): Fix breakpoint events format on the HHVM side.


    if (message.type === 'event' && message.event === 'breakpoint') {
      // * Skip 'new' & 'removed' breakpoint events as these weren't triggered by the backend.
      if (message.body.reason !== 'changed') {
        return;
      } // * Change `breakpoint.column` to `1` insead of `0`


      message.body.breakpoint.column = 1;
    }

    if (message.type === 'event' && message.event === 'stopped') {
      if (!this._nonLoaderBreakSeen) {
        if (message.body != null && message.body.description !== 'execution paused') {
          // This is the first real (non-loader-break) stopped event.
          this._nonLoaderBreakSeen = true;
        } else if (!this._asyncBreakPending) {
          // Hide the loader break from Nuclide.
          return;
        }
      }

      this._asyncBreakPending = false;
    } // Skip forwarding non-focused thread stop events to VSCode's UI
    // to avoid confusing the UX on what thread to focus.
    // https://github.com/Microsoft/vscode-debugadapter-node/issues/147


    if (message.type === 'event' && message.event === 'stopped' && (message.body.threadCausedFocus === false || message.body.preserveFocusHint === true) && this._initializeArgs.clientID !== 'atom' && this._initializeArgs.clientID !== 'nuclide-cli') {
      return;
    }

    const output = JSON.stringify(message);
    const length = Buffer.byteLength(output, 'utf8');
    process.stdout.write('Content-Length: ' + length + TWO_CRLF, 'utf8');
    process.stdout.write(output, 'utf8');
  }

}

new HHVMDebuggerWrapper().debug();