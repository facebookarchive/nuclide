/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import child_process from 'child_process';
import assert from 'assert';
import {OutputEvent} from 'vscode-debugadapter';

const TWO_CRLF = '\r\n\r\n';
const CONTENT_LENGTH_PATTERN = new RegExp('Content-Length: (\\d+)');

class HHVMDebuggerWrapper {
  _sequenceNumber: number;
  _currentOutputData: string;
  _currentInputData: string;
  _currentContentLength: number;

  constructor() {
    this._sequenceNumber = 0;
    this._currentContentLength = 0;
    this._currentOutputData = '';
    this._currentInputData = '';
  }

  debug() {
    // argv[0] is node.js, argv[1] is the path to this wrapper.
    // argv[2] indicates if we are in launch or attach mode.
    const mode = process.argv[2];
    switch (mode) {
      case 'attach':
        // TODO: Support attach.
        break;
      case 'launch':
        this._launchTarget();
        break;
      default:
        assert(false);
    }
  }

  _launchTarget() {
    // argv[0] is node.js, argv[1] is the path to this wrapper.
    // argv[2] indicates if we are in launch or attach mode.
    // The remaining arguments are the path to HHVM and the arguments for HHVM.
    const hhvmPath = process.argv[3];
    const hhvmArgs = process.argv.splice(4);
    const options = {
      cwd: process.cwd(),
      // FD[3] is used for communicating with the debugger extension.
      // STDIN, STDOUT and STDERR are the actual PHP streams.
      stdio: ['pipe', 'pipe', 'pipe', 'pipe'],
      // When the wrapper exits, so does the target.
      detached: false,
      env: process.env,
    };

    const targetProcess = child_process.spawn(hhvmPath, hhvmArgs, options);

    // Exit with the same error code the target exits with.
    targetProcess.on('exit', code => process.exit(code));

    // Wrap any stdout from the target into a VS Code stdout event.
    targetProcess.stdout.on('data', chunk => {
      const block: string = chunk.toString();
      this._writeOutputEvent('stdout', block);
    });

    // Wrap any stderr from the target into a VS Code stderr event.
    targetProcess.stderr.on('data', chunk => {
      const block: string = chunk.toString();
      this._writeOutputEvent('stderr', block);
    });

    targetProcess.stdio[3].on('data', chunk => {
      this._currentOutputData += chunk.toString();

      // The messages from HHVM are each terminated by a NULL character.
      // Process any complete messages from HHVM.
      let idx = this._currentOutputData.indexOf('\0');
      while (idx > 0) {
        const message = this._currentOutputData.substr(0, idx);

        // Add a sequence number to the data.
        try {
          const obj = JSON.parse(message);
          obj.seq = ++this._sequenceNumber;
          this._writeOutputWithHeader(JSON.stringify(obj));
        } catch (e) {
          process.stderr.write(
            `Error parsing message from target: ${e.toString()}: ${message}`,
          );
        }

        // Advance to idx + 1 (lose the NULL char)
        this._currentOutputData = this._currentOutputData.substr(idx + 1);
        idx = this._currentOutputData.indexOf('\0');
      }
    });

    // Read data from the debugger client on stdin and forward to the
    // debugger engine in the target.
    process.stdin.on('data', chunk => {
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

        // Send the first full message to the debugger engine, followed by
        // a NULL character.
        const message = this._currentInputData.substr(0, length);
        targetProcess.stdio[3].write(message, 'utf8');
        targetProcess.stdio[3].write('\0', 'utf8');

        // Reset state and expect another content length header next.
        this._currentContentLength = 0;
        this._currentInputData = this._currentInputData.substr(length);
      }
    });
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
    }

    // Chop the Content-Length header off the input data and start looking for
    // the message.
    this._currentContentLength = parseInt(match[1], 10);
    this._currentInputData = this._currentInputData.substr(
      idx + TWO_CRLF.length,
    );
  }

  _writeOutputEvent(eventType: string, message: string) {
    const outputEvent: OutputEvent = {
      seq: ++this._sequenceNumber,
      type: 'event',
      event: 'output',
      body: {
        category: eventType,
        output: message,
      },
    };
    this._writeOutputWithHeader(JSON.stringify(outputEvent));
  }

  _writeOutputWithHeader(output: string) {
    const length = Buffer.byteLength(output, 'utf8');
    process.stdout.write('Content-Length: ' + length + TWO_CRLF, 'utf8');
    process.stdout.write(output, 'utf8');
  }
}

new HHVMDebuggerWrapper().debug();
