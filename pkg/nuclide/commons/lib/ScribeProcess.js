'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {checkOutput, safeSpawn} from './process';

var SCRIBE_CAT_COMMAND = 'scribe_cat';

/**
 * A wrapper of `scribe_cat` (https://github.com/facebookarchive/scribe/blob/master/examples/scribe_cat)
 * command. User could call `new ScribeProcess($scribeCategoryName)` to create a process and then
 * call `scribeProcess.write($object)` to save an JSON schemaed Object into scribe category.
 * It will also recover from `scribe_cat` failure automatically.
 */
export class ScribeProcess {
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
    var {exitCode} = await checkOutput('which', [SCRIBE_CAT_COMMAND]);
    return exitCode === 0;
  }

  /**
   * Write an Object to scribe category using JSON.stringify.
   *
   * @param message the object to write.
   * @param replacer optional replacer function which alters the behavior of the
   *        stringification process. refer
   *        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
   *        for more information.
   */
  async write(message: string | Object, replacer?: ()=>mixed): Promise<void> {
    var os = require('os');
    var child = await this._getOrCreateChildProcess();
    return new Promise((resolve, reject) => {
      child.stdin.write(`${JSON.stringify(message)}${os.EOL}`, resolve);
    });
  }

  async dispose(): Promise<void> {
    if (this._childPromise) {
      var child = await this._childPromise;
      if (this._childProcessRunning.get(child)) {
        child.kill();
      }
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

export var __test__ = {
  setScribeCatCommand(newCommand: string): string {
    var originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  },
};
