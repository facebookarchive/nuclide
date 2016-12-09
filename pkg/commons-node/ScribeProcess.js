/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import os from 'os';
import {asyncExecute, safeSpawn} from './process';

const DEFAULT_JOIN_TIMEOUT = 5000;
let SCRIBE_CAT_COMMAND = 'scribe_cat';

/**
 * A wrapper of `scribe_cat` (https://github.com/facebookarchive/scribe/blob/master/examples/scribe_cat)
 * command. User could call `new ScribeProcess($scribeCategoryName)` to create a process and then
 * call `scribeProcess.write($object)` to save an JSON schemaed Object into scribe category.
 * It will also recover from `scribe_cat` failure automatically.
 */
export default class ScribeProcess {
  _scribeCategory: string;
  _childProcess: ?child_process$ChildProcess;
  _childProcessRunning: WeakMap<child_process$ChildProcess, boolean>;

  constructor(scribeCategory: string) {
    this._scribeCategory = scribeCategory;
    this._childProcessRunning = new WeakMap();
    this._getOrCreateChildProcess();
  }

  /**
   * Check if `scribe_cat` exists in PATH.
   */
  static async isScribeCatOnPath(): Promise<boolean> {
    const {exitCode} = await asyncExecute('which', [SCRIBE_CAT_COMMAND]);
    return exitCode === 0;
  }

  /**
   * Write a string to a Scribe category.
   * Ensure newlines are properly escaped.
   */
  write(message: string): Promise<void> {
    const child = this._getOrCreateChildProcess();
    return new Promise((resolve, reject) => {
      child.stdin.write(`${message}${os.EOL}`, resolve);
    });
  }

  dispose(): Promise<void> {
    if (this._childProcess != null) {
      const child = this._childProcess;
      if (this._childProcessRunning.get(child)) {
        child.kill();
      }
    }
    return Promise.resolve();
  }

  join(timeout: number = DEFAULT_JOIN_TIMEOUT): Promise<void> {
    if (this._childProcess != null) {
      const {stdin} = this._childProcess;
      // Make sure stdin has drained before ending it.
      if (!stdin.write(os.EOL)) {
        stdin.once('drain', () => stdin.end());
      } else {
        stdin.end();
      }
      return new Promise(resolve => {
        if (this._childProcess == null) {
          resolve();
        } else {
          this._childProcess.on('exit', () => resolve());
          setTimeout(resolve, timeout);
        }
      });
    } else {
      return Promise.resolve();
    }
  }

  _getOrCreateChildProcess(): child_process$ChildProcess {
    if (this._childProcess) {
      return this._childProcess;
    }

    const child = this._childProcess = safeSpawn(SCRIBE_CAT_COMMAND, [this._scribeCategory]);
    child.stdin.setDefaultEncoding('utf8');
    this._childProcessRunning.set(child, true);
    child.on('error', error => {
      this._childProcess = null;
      this._childProcessRunning.set(child, false);
    });
    child.on('exit', e => {
      this._childProcess = null;
      this._childProcessRunning.set(child, false);
    });

    return child;
  }
}

export const __test__ = {
  setScribeCatCommand(newCommand: string): string {
    const originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  },
};
