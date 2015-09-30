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

module.exports = {

  asyncFind<T>(items: Array<T>, test: any, thisArg: any): Promise<?T> {
    return require('./promises').asyncFind(items, test, thisArg);
  },

  asyncExecute(command: string, args: Array<string>, options: any): Promise {
    return require('./process').asyncExecute(command, args, options);
  },

  checkOutput(command: string, args: Array<string>, options: ?Object): Promise {
    return require('./process').checkOutput(command, args, options);
  },

  createArgsForScriptCommand(command: string, args?: Array<string> = []): Array<string> {
    return require('./process').createArgsForScriptCommand(command, args);
  },

  createExecEnvironment(originalEnv: Object, commonBinaryPaths: Array<string>): Promise<Object> {
    return require('./process').createExecEnvironment(originalEnv, commonBinaryPaths);
  },

  denodeify(f: (...args: Array<any>) => any): (...args: Array<any>) => Promise<any> {
    return require('./promises').denodeify(f);
  },

  safeSpawn(command: string, args?: Array<string>, options?: Object = {}): Promise<child_process$ChildProcess> {
    return require('./process').safeSpawn(command, args, options);
  },

  scriptSafeSpawn(
    command: string,
    args?: Array<string> = [],
    options?: Object = {},
  ): Promise<child_process$ChildProcess> {
    return require('./process').scriptSafeSpawn(command, args, options);
  },

  scriptSafeSpawnAndObserveOutput(
    command: string,
    args?: Array<string> = [],
    options?: Object = {},
  ): Observable<{stdout?: string; stderr?: string;}> {
    return require('./process').scriptSafeSpawnAndObserveOutput(command, args, options);
  },

  readFile(filePath: string, options?: any): Promise<string | Buffer> {
    return require('./filesystem').readFile(filePath, options);
  },

  findNearestFile(fileName: string, pathToDirectory: string): Promise<?string> {
    return require('./filesystem').findNearestFile(fileName, pathToDirectory);
  },

  get array() {
    return require('./array');
  },

  get object() {
    return require('./object');
  },

  get fsPromise() {
    return require('./filesystem');
  },

  get httpPromise() {
    return require('./http');
  },

  get strings() {
    return require('./strings');
  },

  get paths() {
    return require('./paths');
  },

  get PromisePool() {
    return require('./PromiseExecutors').PromisePool;
  },

  get PromiseQueue() {
    return require('./PromiseExecutors').PromiseQueue;
  },

  get extend() {
    return require('./extend');
  },

  get debounce() {
    return require('./debounce');
  },

  get vcs() {
    return require('./vcs');
  },

  get url() {
    return require('./url');
  },

  get dnsUtils() {
    return require('./dns_utils');
  },

  get env() {
    return require('./environment');
  },

  get promises() {
    return require('./promises');
  },

  get error() {
    return require('./error');
  },

  get event() {
    return require('./event');
  },

  get session() {
    return require('./session');
  },

  get singleton() {
    return require('./singleton');
  },

  get CircularBuffer() {
    return require('./CircularBuffer');
  },

  get COMMON_BINARY_PATHS() {
    return require('./process').COMMON_BINARY_PATHS;
  },

  get clientInfo() {
    return require('./clientInfo');
  },

  get systemInfo() {
    return require('./systemInfo');
  },

  get runtimeInfo() {
    return require('./runtimeInfo');
  },
};
