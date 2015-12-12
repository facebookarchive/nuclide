'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';
import {getLogger} from '../../logging';

const logger = getLogger();

const DEFAULT_WEBWORKER_TIMEOUT = 30 * 1000;
const DEFAULT_POOR_PERF_TIMEOUT = 8 * 1000;

type WorkerTask = {
  workerMessage: mixed;
  onResponse: (response: any) => void;
  onFail: (error: Error) => void;
};

/**
 * HackWorker uses the hh_ide.js that's a translation from OCaml to JavaScript (not readable).
 * It's responsible for providing language services without hitting the server, if possible.
 * e.g. some autocompletions, go to definition, diagnostic requests and outline could be served locally.
 * This is done as a web worker not to block the main UI thread when executing language tasks.
 */

type HackWorkerOptions = {
  webWorkerTimeout?: number;
  poorPerfTimeout?: number;
  worker?: Worker;
};

class HackWorker {
  _activeTask: ?WorkerTask;
  _taskQueue: Array<WorkerTask>;
  _depTaskQueue: Array<WorkerTask>;
  _webWorkerTimeout: number;
  _poorPefTimeout: number;
  _worker: Worker;
  _timeoutTimer: any;
  _performanceTimer: any;

  constructor(options: ?HackWorkerOptions) {
    options = options || {};
    this._activeTask = null;
    this._taskQueue = [];
    this._depTaskQueue = [];
    this._webWorkerTimeout = options.webWorkerTimeout || DEFAULT_WEBWORKER_TIMEOUT;
    this._poorPefTimeout = options.poorPerfTimeout || DEFAULT_POOR_PERF_TIMEOUT;
    this._worker = options.worker || startWebWorker();
    this._worker.addEventListener('message', (e) => this._handleHackWorkerReply(e.data), false);
    this._worker.addEventListener('error', (error) => this._handleHackWorkerError(error), false);
  }

  /**
   * Runs a web worker task and returns a promise of the value expected from the hack worker.
   */
  runWorkerTask(workerMessage: mixed, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      options = options || {};
      const queue = options.isDependency ? this._depTaskQueue : this._taskQueue;
      queue.push({
        workerMessage,
        onResponse: (response) => {
          const internalError = response.internal_error;
          if (internalError) {
            logger.error('Hack Worker: Internal Error! - ' +
                String(internalError) + ' - ' + JSON.stringify(workerMessage));
            reject(internalError);
          } else {
            resolve(response);
          }
        },
        onFail: (error) => {
          logger.error('Hack Worker: Error!', error, JSON.stringify(workerMessage));
          reject(error);
        },
      });
      this._dispatchTaskIfReady();
    });
  }

  dispose(): void {
    this._worker.terminate();
  }

  _dispatchTaskIfReady(): void {
    if (this._activeTask) {
      return;
    }
    if (this._taskQueue.length) {
      this._activeTask = this._taskQueue.shift();
    } else if (this._depTaskQueue.length) {
      this._activeTask = this._depTaskQueue.shift();
    }
    if (this._activeTask) {
      // dispatch it and start timers
      const workerMessage = this._activeTask.workerMessage;
      this._dispatchTask(workerMessage);
      this._timeoutTimer = setTimeout(() => {
        logger.warn('Webworker is stuck in a job!', JSON.stringify(workerMessage));
      }, this._webWorkerTimeout);
      this._performanceTimer = setTimeout(() => {
        logger.warn('Poor Webworker Performance!', JSON.stringify(workerMessage));
      }, this._poorPefTimeout);
    }
  }

  _dispatchTask(taskMessage: mixed) {
    this._worker.postMessage(taskMessage);
  }

  _handleHackWorkerReply(reply: mixed) {
    this._clearTimers();
    if (this._activeTask) {
      this._activeTask.onResponse(reply);
    } else {
      logger.error('Hack Worker replied without an active task!');
    }
    this._activeTask = null;
    this._dispatchTaskIfReady();
  }

  _handleHackWorkerError(error: Error) {
    this._clearTimers();
    if (this._activeTask) {
      this._activeTask.onFail(error);
    } else {
      logger.error('Hack Worker errored without an active task!');
    }
    this._activeTask = null;
    this._dispatchTaskIfReady();
  }

  _clearTimers() {
    clearTimeout(this._timeoutTimer);
    clearTimeout(this._performanceTimer);
  }
}

function startWebWorker(): Worker {
  // Hacky way to load the worker files from the filesystem as text,
  // then inject the text into Blob url for the WebWorker to consume.
  // http://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string
  // I did so because I can't use the atom:// url protocol to load resources in javascript:
  // https://github.com/atom/atom/blob/master/src/browser/atom-protocol-handler.coffee
  const hhIdeText = fs.readFileSync(
    path.join(__dirname, '../VendorLib/hh_ide.js'),
    'utf-8',
  );
  const webWorkerText = fs.readFileSync(
    path.join(__dirname, '../static/HackWebWorker.js'),
    'utf-8',
  );
  // Concatenate the code text to pass to the Worker in a blob url
  const workerText = hhIdeText + '\n//<<MERGE>>\n' + webWorkerText;
  const {Blob, Worker, URL} = window;
  const blob = new Blob([workerText], {type: 'application/javascript'});
  const worker = new Worker(URL.createObjectURL(blob));
  return worker;
}

module.exports = HackWorker;
