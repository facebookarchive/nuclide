'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type process$asyncExecuteRet = {
  command?: string;
  errorMessage?: string;
  exitCode: number;
  stderr: string;
  stdout: string;
};

export type ProcessMessage = StdoutMessage | StderrMessage | ExitMessage | ErrorMessage;
export type StdoutMessage = {
  kind: 'stdout';
  data: string;
};
export type StderrMessage = {
  kind: 'stderr';
  data: string;
};
export type ExitMessage = {
  kind: 'exit';
  exitCode: number;
};
export type ErrorMessage = {
  kind: 'error';
  error: Object;
};

import typeof * as ProcessType from './process';
import typeof * as StreamType from './stream';
import typeof * as FilesystemType from './filesystem';
import typeof * as ToJsStringType from './toJsString';
import typeof * as SetType from './set';
import typeof * as MapType from './map';
import typeof * as ArrayType from './array';
import typeof * as ObjectType from './object';
import typeof * as HttpType from './http';
import typeof * as StringsType from './strings';
import typeof * as RelativeDateType from './relativeDate';
import typeof * as PathsType from './paths';
import typeof * as PromiseExecutorsType from './PromiseExecutors';
import typeof * as ExtendType from './extend';
import typeof * as DebounceType from './debounce';
import typeof * as OnceType from './once';
import typeof * as VcsType from './vcs';
import typeof * as DnsUtilsType from './dns_utils';
import typeof * as PromisesType from './promises';
import typeof * as RegExpType from './regexp';
import typeof * as ErrorType from './error';
import typeof * as EventType from './event';
import typeof * as SessionType from './session';
import typeof * as CircularBufferType from './CircularBuffer';
import typeof * as ClientInfoType from './clientInfo';
import typeof * as SystemInfoType from './systemInfo';
import typeof * as RuntimeInfoType from './runtimeInfo';
import typeof * as ScribeProcessType from './ScribeProcess';
import typeof * as BatchProcessedQueueType from './BatchProcessedQueue';
import typeof * as ExtendableErrorType from './ExtendableError';
import type {Environment as EnvironmentType} from './environment';

// It's impactful to memoize our requires here since these commons are so often used.
const requireCache: {[id: string]: any} = {};
function requireFromCache(id: string): any {
  if (!requireCache.hasOwnProperty(id)) {
    // $FlowIgnore
    requireCache[id] = require(id);
  }
  return requireCache[id];
}

function requirePromises(): PromisesType {
  return requireFromCache('./promises');
}

function requireProcess(): ProcessType {
  return requireFromCache('./process');
}

function requireStream(): StreamType {
  return requireFromCache('./stream');
}

function requireFileSystem(): FilesystemType {
  return requireFromCache('./filesystem');
}

function requrePromiseExecutors(): PromiseExecutorsType {
  return requireFromCache('./PromiseExecutors');
}

module.exports = {

  get asyncFind() {
    return requirePromises().asyncFind;
  },

  get asyncExecute() {
    return requireProcess().asyncExecute;
  },

  get checkOutput() {
    return requireProcess().checkOutput;
  },

  get createArgsForScriptCommand() {
    return requireProcess().createArgsForScriptCommand;
  },

  get createExecEnvironment() {
    return requireProcess().createExecEnvironment;
  },

  get denodeify() {
    return requirePromises().denodeify;
  },

  get forkWithExecEnvironment() {
    return requireProcess().forkWithExecEnvironment;
  },

  get safeSpawn() {
    return requireProcess().safeSpawn;
  },

  get scriptSafeSpawn() {
    return requireProcess().scriptSafeSpawn;
  },

  get scriptSafeSpawnAndObserveOutput() {
    return requireProcess().scriptSafeSpawnAndObserveOutput;
  },

  get splitStream() {
    return requireStream().splitStream;
  },

  get observeStream() {
    return requireStream().observeStream;
  },

  get observeProcessExit() {
    return requireProcess().observeProcessExit;
  },

  get observeProcess() {
    return requireProcess().observeProcess;
  },

  get readFile() {
    return requireFileSystem().readFile;
  },

  get relativeDate() {
    return (requireFromCache('./relativeDate'): RelativeDateType).relativeDate;
  },

  get toJsString() {
    return (requireFromCache('./toJsString'): ToJsStringType).toJsString;
  },

  get findNearestFile() {
    return requireFileSystem().findNearestFile;
  },

  get array(): ArrayType {
    return requireFromCache('./array');
  },

  get set(): SetType {
    return requireFromCache('./set');
  },

  get map(): MapType {
    return requireFromCache('./map');
  },

  get object(): ObjectType {
    return requireFromCache('./object');
  },

  get fsPromise(): FilesystemType {
    return requireFromCache('./filesystem');
  },

  get httpPromise(): HttpType {
    return requireFromCache('./http');
  },

  get strings(): StringsType {
    return requireFromCache('./strings');
  },

  get paths(): PathsType {
    return requireFromCache('./paths');
  },

  get PromisePool() {
    return requrePromiseExecutors().PromisePool;
  },

  get PromiseQueue() {
    return requrePromiseExecutors().PromiseQueue;
  },

  get extend(): ExtendType {
    return requireFromCache('./extend');
  },

  get debounce() {
    return (requireFromCache('./debounce'): DebounceType).debounce;
  },

  get once() {
    return (requireFromCache('./once'): OnceType).once;
  },

  get vcs(): VcsType {
    return requireFromCache('./vcs');
  },

  get dnsUtils(): DnsUtilsType {
    return requireFromCache('./dns_utils');
  },

  get env(): EnvironmentType {
    return requireFromCache('./environment');
  },

  get promises() {
    return requirePromises();
  },

  get regexp(): RegExpType {
    return requireFromCache('./regexp');
  },

  get error(): ErrorType {
    return requireFromCache('./error');
  },

  get event(): EventType {
    return requireFromCache('./event');
  },

  get session(): SessionType {
    return requireFromCache('./session');
  },

  get singleton() {
    return requireFromCache('./singleton');
  },

  get CircularBuffer() {
    return (requireFromCache('./CircularBuffer'): CircularBufferType).CircularBuffer;
  },

  get COMMON_BINARY_PATHS() {
    return requireProcess().COMMON_BINARY_PATHS;
  },

  get clientInfo(): ClientInfoType {
    return requireFromCache('./clientInfo');
  },

  get systemInfo(): SystemInfoType {
    return requireFromCache('./systemInfo');
  },

  get runtimeInfo(): RuntimeInfoType {
    return requireFromCache('./runtimeInfo');
  },

  get ScribeProcess() {
    return (requireFromCache('./ScribeProcess'): ScribeProcessType).ScribeProcess;
  },

  get BatchProcessedQueue() {
    return (
      requireFromCache('./BatchProcessedQueue'): BatchProcessedQueueType
    ).BatchProcessedQueue;
  },

  get ExtendableError(): ExtendableErrorType {
    return requireFromCache('./ExtendableError');
  },
};
