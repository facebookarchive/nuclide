'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type BufferedProcessError = {error: Object, handle: mixed};

import {CompositeDisposable, Disposable, Emitter} from 'atom';
var {createScriptBufferedProcessWithEnv} = require('./script-buffered-process');

/**
 * This class creates and stores the output of a ScriptBufferedProcess and can
 * push updates to listeners.
 */
class ScriptBufferedProcessStore {
  _command: string;
  _args: Array<string>;
  _commandOptions: Object;

  _emitter: Emitter;
  _process: ?atom$BufferedProcess;
  _processPromise: ?Promise<number>;
  _stdout: ?string;
  _stderr: ?string;
  _listenerSubscriptions: CompositeDisposable;

  constructor(
    command: string,
    args: Array<string>,
    commandOptions?: Object = {},
  ) {
    this._command = command;
    this._args = args.slice();
    this._commandOptions = {...commandOptions};
    this._emitter = new Emitter();
    this._listenerSubscriptions = new CompositeDisposable();
  }

  dispose() {
    this.stopProcess();
    this._emitter.dispose();
    this._listenerSubscriptions.dispose();
  }

  /**
   * Starts the process if it has not already been started.
   * Currently the BufferedProcessStore is one-time use; `startProcess` will only
   * take effect on the first call.
   * @return A Promise that resolves to the exit code when the process exits.
   */
  async startProcess(): Promise<number> {
    if (this._processPromise) {
      return this._processPromise;
    }
    var options = {
      command: this._command,
      args: this._args,
      options: this._commandOptions,
      stdout: (data) => this._receiveStdout(data),
      stderr: (data) => this._receiveStderr(data),
      exit: (code) => this._handleProcessExit(code),
    };
    this._processPromise = new Promise((resolve, reject) => {
      // this._handleProcessExit() will emit this.
      this._emitter.on('_exit', resolve);
    });
    this._process = await createScriptBufferedProcessWithEnv(options);
    this._process.onWillThrowError(() => this._handleProcessError);
    return this._processPromise;
  }

  stopProcess() {
    if (this._process) {
      // Don't null out this._processPromise; this prevents `startProcess` from running again.
      this._process.kill();
    }
  }

  /**
   * The owner of the BufferedProcessStore should subscribe to this and handle
   * any errors.
   */
  onWillThrowError(callback: (errorObject: BufferedProcessError) => mixed): Disposable {
    var listenerSubscription = this._emitter.on('will-throw-error', callback);
    this._listenerSubscriptions.add(listenerSubscription);
    return listenerSubscription;
  }

  _receiveStdout(data: string) {
    this._stdout = this._stdout ? this._stdout.concat(data) : data;
    this._emitter.emit('stdout', data);
  }

  _receiveStderr(data: string) {
    this._stderr = this._stderr ? this._stderr.concat(data) : data;
    this._emitter.emit('stderr', data);
  }

  _handleProcessExit(code: number) {
    this._emitter.emit('_exit', code);
    this._listenerSubscriptions.dispose();
  }

  _handleProcessError(errorObject: BufferedProcessError) {
    this._emitter.emit('will-throw-error', errorObject);
  }

  /**
   * Gets the stdout at this point in time.
   * Not recommended: `observeStdout` provides more complete information.
   */
  getStdout(): ?string {
    return this._stdout;
  }

  /**
   * Gets the stderr at this point in time.
   * Not recommended: `observeStderr` provides more complete information.
   */
  getStderr(): ?string {
    return this._stderr;
  }

  /**
   * @param A callback that will be called immediately with any stored data, and
   *   called whenever the BufferedProcessStore has new data.
   * @return A Disposable that should be disposed to stop updates. This Disposable
   *   will also be automatically disposed when the process exits.
   */
  observeStdout(callback: (data: string) => mixed): Disposable {
    if (this._stdout) {
      callback(this._stdout);
    }
    var listenerSubscription = this._emitter.on('stdout', callback);
    this._listenerSubscriptions.add(listenerSubscription);
    return listenerSubscription;
  }

  /**
   * @param A callback that will be called immediately with any stored data, and
   *   called whenever the BufferedProcessStore has new data.
   * @return A Disposable that should be disposed to stop updates. This Disposable
   *   will also be automatically disposed when the process exits.
   */
  observeStderr(callback: (data: string) => mixed): Disposable {
    if (this._stderr) {
      callback(this._stderr);
    }
    var listenerSubscription = this._emitter.on('stderr', callback);
    this._listenerSubscriptions.add(listenerSubscription);
    return listenerSubscription;
  }
}

module.exports = ScriptBufferedProcessStore;
