'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rx';

export type process$asyncExecuteRet = {
  command?: string,
  errorMessage?: string,
  exitCode: number,
  stderr: string,
  stdout: string,
};

export type ProcessMessage = StdoutMessage | StderrMessage | ExitMessage | ErrorMessage;
export type StdoutMessage = {
  kind: 'stdout',
  data: string,
};
export type StderrMessage = {
  kind: 'stderr',
  data: string,
};
export type ExitMessage = {
  kind: 'exit',
  exitCode: number,
};
export type ErrorMessage = {
  kind: 'error',
  error: Object,
};

// It's impactful to memoize our requires here since these commons are so often used.
const requireCache: {[id: string]: any} = {};
function requireFromCache(id: string): any {
  if (!requireCache.hasOwnProperty(id)) {
    // $FlowIgnore
    requireCache[id] = require(id);
  }
  return requireCache[id];
}

module.exports = {

  asyncFind<T>(items: Array<T>, test: any, thisArg: any): Promise<?T> {
    return requireFromCache('./promises').asyncFind(items, test, thisArg);
  },

  asyncExecute(command: string, args: Array<string>, options: any):
      Promise<process$asyncExecuteRet> {
    return requireFromCache('./process').asyncExecute(command, args, options);
  },

  checkOutput(command: string, args: Array<string>, options: ?Object):
      Promise<process$asyncExecuteRet> {
    return requireFromCache('./process').checkOutput(command, args, options);
  },

  createArgsForScriptCommand(command: string, args?: Array<string> = []): Array<string> {
    return requireFromCache('./process').createArgsForScriptCommand(command, args);
  },

  createExecEnvironment(originalEnv: Object, commonBinaryPaths: Array<string>): Promise<Object> {
    return requireFromCache('./process').createExecEnvironment(originalEnv, commonBinaryPaths);
  },

  denodeify(f: (...args: Array<any>) => any): (...args: Array<any>) => Promise<any> {
    return requireFromCache('./promises').denodeify(f);
  },

  safeSpawn(command: string, args?: Array<string>, options?: Object = {}):
      Promise<child_process$ChildProcess> {
    return requireFromCache('./process').safeSpawn(command, args, options);
  },

  scriptSafeSpawn(
    command: string,
    args?: Array<string> = [],
    options?: Object = {},
  ): Promise<child_process$ChildProcess> {
    return requireFromCache('./process').scriptSafeSpawn(command, args, options);
  },

  scriptSafeSpawnAndObserveOutput(
    command: string,
    args?: Array<string> = [],
    options?: Object = {},
  ): Observable<{stdout?: string, stderr?: string,}> {
    return requireFromCache('./process').scriptSafeSpawnAndObserveOutput(command, args, options);
  },

  splitStream(input: Observable<string>): Observable<string> {
    return requireFromCache('./stream').splitStream(input);
  },

  observeStream(stream: stream$Readable): Observable<string> {
    return requireFromCache('./stream').observeStream(stream);
  },

  observeProcessExit(createProcess: () => child_process$ChildProcess): Observable<number> {
    return requireFromCache('./process').observeProcessExit(createProcess);
  },

  observeProcess(createProcess: () => child_process$ChildProcess): Observable<ProcessMessage> {
    return requireFromCache('./process').observeProcess(createProcess);
  },

  readFile(filePath: string, options?: any): Promise<string | Buffer> {
    return requireFromCache('./filesystem').readFile(filePath, options);
  },

  toJsString(str: string): string {
    return requireFromCache('./toJsString')(str);
  },

  findNearestFile(fileName: string, pathToDirectory: string): Promise<?string> {
    return requireFromCache('./filesystem').findNearestFile(fileName, pathToDirectory);
  },

  get array() {
    return requireFromCache('./array');
  },

  get set() {
    return requireFromCache('./set');
  },

  get map() {
    return requireFromCache('./map');
  },

  get object() {
    return requireFromCache('./object');
  },

  get fsPromise() {
    return requireFromCache('./filesystem');
  },

  get httpPromise() {
    return requireFromCache('./http');
  },

  get strings() {
    return requireFromCache('./strings');
  },

  get paths() {
    return requireFromCache('./paths');
  },

  get PromisePool() {
    return requireFromCache('./PromiseExecutors').PromisePool;
  },

  get PromiseQueue() {
    return requireFromCache('./PromiseExecutors').PromiseQueue;
  },

  get extend() {
    return requireFromCache('./extend');
  },

  get debounce() {
    return requireFromCache('./debounce');
  },

  get once() {
    return requireFromCache('./once');
  },

  get vcs() {
    return requireFromCache('./vcs');
  },

  get dnsUtils() {
    return requireFromCache('./dns_utils');
  },

  get env() {
    return requireFromCache('./environment');
  },

  get promises() {
    return requireFromCache('./promises');
  },

  get regexp() {
    return requireFromCache('./regexp');
  },

  get error() {
    return requireFromCache('./error');
  },

  get event() {
    return requireFromCache('./event');
  },

  get session() {
    return requireFromCache('./session');
  },

  get singleton() {
    return requireFromCache('./singleton');
  },

  get CircularBuffer() {
    return requireFromCache('./CircularBuffer');
  },

  get COMMON_BINARY_PATHS() {
    return requireFromCache('./process').COMMON_BINARY_PATHS;
  },

  get clientInfo() {
    return requireFromCache('./clientInfo');
  },

  get systemInfo() {
    return requireFromCache('./systemInfo');
  },

  get runtimeInfo() {
    return requireFromCache('./runtimeInfo');
  },

  get ScribeProcess() {
    return requireFromCache('./ScribeProcess').ScribeProcess;
  },

  get BatchProcessedQueue() {
    return requireFromCache('./BatchProcessedQueue').BatchProcessedQueue;
  },

  get ExtendableError() {
    return requireFromCache('./ExtendableError');
  },
};
