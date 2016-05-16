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
  // If the process fails to even start up, exitCode will not be set
  // and errorCode / errorMessage will contain the actual error message.
  // Otherwise, exitCode will always be defined.
  command?: string;
  errorMessage?: string;
  errorCode?: string;
  exitCode?: number;
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
import typeof * as FSPromiseType from './fsPromise';
import typeof * as ToJsStringType from './toJsString';
import typeof * as SetType from './set';
import typeof * as MapType from './map';
import typeof * as ArrayType from './array';
import typeof * as ObjectType from './object';
import typeof * as HttpType from './http';
import typeof * as RelativeDateType from './relativeDate';
import typeof * as PathsType from './paths';
import typeof * as PromiseExecutorsType from './PromiseExecutors';
import typeof * as DebounceType from './debounce';
import typeof * as OnceType from './once';
import typeof * as VcsType from './vcs';
import typeof * as PromisesType from './promises';
import typeof * as ErrorType from './error';
import typeof * as EventType from './event';
import typeof * as CircularBufferType from './CircularBuffer';
import typeof * as ClientInfoType from './clientInfo';
import typeof * as SystemInfoType from './systemInfo';
import typeof * as RuntimeInfoType from './runtimeInfo';
import typeof * as ScribeProcessType from './ScribeProcess';
import typeof * as BatchProcessedQueueType from './BatchProcessedQueue';
import typeof * as ObservablesType from './observables';

import userInfo from './userInfo';

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

function requireObservables(): ObservablesType {
  return requireFromCache('./observables');
}

function requireProcess(): ProcessType {
  return requireFromCache('./process');
}

function requireStream(): StreamType {
  return requireFromCache('./stream');
}

function requirePromiseExecutors(): PromiseExecutorsType {
  return requireFromCache('./PromiseExecutors');
}

module.exports = {

  get asyncFind() {
    return requirePromises().asyncFind;
  },

  get asyncExecute() {
    return requireProcess().asyncExecute;
  },

  get bufferUntil() {
    return requireStream().bufferUntil;
  },

  get checkOutput() {
    return requireProcess().checkOutput;
  },

  get CompositeSubscription() {
    return requireStream().CompositeSubscription;
  },

  get createArgsForScriptCommand() {
    return requireProcess().createArgsForScriptCommand;
  },

  get createExecEnvironment() {
    return requireProcess().createExecEnvironment;
  },

  /**
   * IMPORTANT: You should almost never use this!! See `./promises.js`.
   */
  get Deferred() {
    return requirePromises().Deferred;
  },

  get denodeify() {
    return requirePromises().denodeify;
  },

  get diffSets() {
    return requireStream().diffSets;
  },

  get DisposableSubscription() {
    return requireStream().DisposableSubscription;
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

  get cacheWhileSubscribed() {
    return requireStream().cacheWhileSubscribed;
  },

  get toggle() {
    return requireStream().toggle;
  },

  get compact() {
    return requireStream().compact;
  },

  get observeProcessExit() {
    return requireProcess().observeProcessExit;
  },

  get observeProcess() {
    return requireProcess().observeProcess;
  },

  get relativeDate() {
    return (requireFromCache('./relativeDate'): RelativeDateType).relativeDate;
  },

  get toJsString() {
    return (requireFromCache('./toJsString'): ToJsStringType).toJsString;
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

  get fsPromise(): FSPromiseType.fsPromise {
    return (requireFromCache('./fsPromise'): FSPromiseType).fsPromise;
  },

  get httpPromise(): HttpType {
    return requireFromCache('./http');
  },

  get paths(): PathsType {
    return requireFromCache('./paths');
  },

  get PromisePool() {
    return requirePromiseExecutors().PromisePool;
  },

  get PromiseQueue() {
    return requirePromiseExecutors().PromiseQueue;
  },

  get debounce() {
    return (requireFromCache('./debounce'): DebounceType).debounce;
  },

  get once() {
    return (requireFromCache('./once'): OnceType).once;
  },

  get toolbar() {
    return requireFromCache('./toolbar');
  },

  get vcs(): VcsType {
    return requireFromCache('./vcs');
  },

  get promises() {
    return requirePromises();
  },

  get observables() {
    return requireObservables();
  },

  get error(): ErrorType {
    return requireFromCache('./error');
  },

  get event(): EventType {
    return requireFromCache('./event');
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

  get userInfo() {
    return userInfo;
  },

  get ScribeProcess() {
    return (requireFromCache('./ScribeProcess'): ScribeProcessType).ScribeProcess;
  },

  get BatchProcessedQueue() {
    return (
      requireFromCache('./BatchProcessedQueue'): BatchProcessedQueueType
    ).BatchProcessedQueue;
  },

  get passesGK(): (gatekeeperName: string, timeout?: number) => Promise<boolean> {
    return requireFromCache('./gatekeeper').passesGK;
  },

  get reconcileSetDiffs() {
    return requireStream().reconcileSetDiffs;
  },

};
