'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
  _childPromise: ?Promise<child_process$ChildProcess>;
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
  async write(message: string): Promise<void> {
    const child = await this._getOrCreateChildProcess();
    return new Promise((resolve, reject) => {
      child.stdin.write(`${message}${os.EOL}`, resolve);
    });
  }

  async dispose(): Promise<void> {
    if (this._childPromise) {
      const child = await this._childPromise;
      if (this._childProcessRunning.get(child)) {
        child.kill();
      }
    }
  }

  async join(timeout: number = DEFAULT_JOIN_TIMEOUT): Promise<void> {
    if (this._childPromise) {
      const child = await this._childPromise;
      child.stdin.end();
      return new Promise(resolve => {
        child.on('exit', () => resolve());
        setTimeout(resolve, timeout);
      });
    }
  }

  _getOrCreateChildProcess(): Promise<child_process$ChildProcess> {
    if (this._childPromise) {
      return this._childPromise;
    }

    this._childPromise = safeSpawn(SCRIBE_CAT_COMMAND, [this._scribeCategory])
        .then(child => {
          child.stdin.setDefaultEncoding('utf8');
          this._childProcessRunning.set(child, true);
          child.on('error', error => {
            this._childPromise = null;
            this._childProcessRunning.set(child, false);
          });
          child.on('exit', e => {
            this._childPromise = null;
            this._childProcessRunning.set(child, false);
          });
          return child;
        });

    return this._childPromise;
  }
}

export const __test__ = {
  setScribeCatCommand(newCommand: string): string {
    const originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  },
};
