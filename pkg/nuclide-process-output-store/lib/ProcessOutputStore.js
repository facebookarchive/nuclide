'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {KillableProcess, RunProcessWithHandlers} from './types';
import {CompositeDisposable, Emitter} from 'atom';

/**
 * This class creates and stores the output of a process and can push updates
 * to listeners.
 */
class ProcessOutputStore {
  _runProcess: RunProcessWithHandlers;
  _process: ?KillableProcess;
  _emitter: Emitter;
  _processPromise: ?Promise<number>;
  _stdout: ?string;
  _stderr: ?string;
  _listenerSubscriptions: CompositeDisposable;

  constructor(runProcess: RunProcessWithHandlers) {
    this._runProcess = runProcess;
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
  async startProcess(): Promise<?number> {
    if (this._processPromise) {
      return this._processPromise;
    }
    const options = {
      stdout: data => this._receiveStdout(data),
      stderr: data => this._receiveStderr(data),
      error: error => this._handleProcessError(error),
      exit: code => this._handleProcessExit(code),
    };
    this._processPromise = new Promise((resolve, reject) => {
      // this._handleProcessExit() will emit this.
      this._emitter.on('exit', resolve);
    });
    this._process = await this._runProcess(options);
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
  onWillThrowError(callback: (error: Error) => mixed): IDisposable {
    const listenerSubscription = this._emitter.on('will-throw-error', callback);
    this._listenerSubscriptions.add(listenerSubscription);
    return listenerSubscription;
  }

  /**
   * Get notified when the process exits.
   */
  onProcessExit(callback: (exitCode: number) => mixed): IDisposable {
    const listenerSubscription = this._emitter.on('exit', callback);
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
    this._emitter.emit('exit', code);
    this._listenerSubscriptions.dispose();
  }

  _handleProcessError(error: Error) {
    this._emitter.emit('will-throw-error', error);
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
  observeStdout(callback: (data: string) => mixed): IDisposable {
    if (this._stdout) {
      callback(this._stdout);
    }
    const listenerSubscription = this._emitter.on('stdout', callback);
    this._listenerSubscriptions.add(listenerSubscription);
    return listenerSubscription;
  }

  /**
   * @param A callback that will be called immediately with any stored data, and
   *   called whenever the BufferedProcessStore has new data.
   * @return A Disposable that should be disposed to stop updates. This Disposable
   *   will also be automatically disposed when the process exits.
   */
  observeStderr(callback: (data: string) => mixed): IDisposable {
    if (this._stderr) {
      callback(this._stderr);
    }
    const listenerSubscription = this._emitter.on('stderr', callback);
    this._listenerSubscriptions.add(listenerSubscription);
    return listenerSubscription;
  }
}

module.exports = ProcessOutputStore;
