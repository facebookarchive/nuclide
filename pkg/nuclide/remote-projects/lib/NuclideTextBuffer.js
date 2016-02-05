'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnection} from '../../remote-connection/lib/RemoteConnection';
import type RemoteFile from '../../remote-connection/lib/RemoteFile';

import {getLogger} from '../../logging/';
import invariant from 'assert';

const logger = getLogger();
const {CompositeDisposable, TextBuffer} = require('atom');

class NuclideTextBuffer extends TextBuffer {
  connection: RemoteConnection;
  fileSubscriptions: CompositeDisposable;
  /* $FlowFixMe */
  file: ?RemoteFile;
  conflict: boolean;

  constructor(connection: RemoteConnection, params: any) {
    super(params);
    this.connection = connection;
    this.setPath(params.filePath);
    const encoding: string = (atom.config.get('core.fileEncoding'): any);
    this.setEncoding(encoding);
  }

  setPath(filePath: string): void {
    if (!this.connection) {
      // If this.connection is not set, then the superclass constructor is still executing.
      // NuclideTextBuffer's constructor will ensure setPath() is called once this.constructor
      // is set.
      return;
    }
    if (filePath === this.getPath()) {
      return;
    }
    if (filePath) {
      this.file = this.createFile(filePath);
      if (this.file !== null) {
        const file = this.file;
        file.setEncoding(this.getEncoding());
        this.subscribeToFile();
      }
    } else {
      this.file = null;
    }
    this.emitter.emit('did-change-path', this.getPath());
  }

  createFile(filePath: string): RemoteFile {
    return this.connection.createFile(filePath);
  }

  async saveAs(filePath: string): Promise<void> {
    if (!filePath) {
      throw new Error('Can\'t save buffer with no file path');
    }

    this.emitter.emit('will-save', {path: filePath});
    this.setPath(filePath);
    try {
      invariant(this.file);
      const file = this.file;
      await file.write(this.getText());
      this.cachedDiskContents = this.getText();
      this.conflict = false;
      /* $FlowFixMe Private Atom API */
      this.emitModifiedStatusChanged(false);
      this.emitter.emit('did-save', {path: filePath});
    } catch (e) {
      logger.fatal('Failed to save remote file.', e);
      atom.notifications.addError(`Failed to save remote file: ${e.message}`);
    }
  }

  updateCachedDiskContentsSync(): void {
    throw new Error('updateCachedDiskContentsSync isn\'t supported in NuclideTextBuffer');
  }

  subscribeToFile() {
    if (this.fileSubscriptions) {
      this.fileSubscriptions.dispose();
    }
    invariant(this.file);
    this.fileSubscriptions = new CompositeDisposable();

    this.fileSubscriptions.add(this.file.onDidChange(async () => {
      const isModified = await this._isModified();
      if (isModified) {
        this.conflict = true;
      }
      const previousContents = this.cachedDiskContents;
      /* $FlowFixMe Private Atom API */
      await this.updateCachedDiskContents();
      if (previousContents === this.cachedDiskContents) {
        return;
      }
      if (this.conflict) {
        this.emitter.emit('did-conflict');
      } else {
        this.reload();
      }
    }));

    invariant(this.file);
    this.fileSubscriptions.add(this.file.onDidDelete(() => {
      const modified = this.getText() !== this.cachedDiskContents;
      /* $FlowFixMe Private Atom API */
      this.wasModifiedBeforeRemove = modified;
      if (modified) {
        /* $FlowFixMe Private Atom API */
        this.updateCachedDiskContents();
      } else {
        /* $FlowFixMe Private Atom API */
        this.destroy();
      }
    }));

    invariant(this.file);
    this.fileSubscriptions.add(this.file.onDidRename(() => {
      this.emitter.emit('did-change-path', this.getPath());
    }));

    invariant(this.file);
    this.fileSubscriptions.add(this.file.onWillThrowWatchError(errorObject => {
      this.emitter.emit('will-throw-watch-error', errorObject);
    }));
  }

  async _isModified(): Promise<boolean> {
    if (!this.loaded) {
      return false;
    }
    if (this.file) {
      const exists = await this.file.exists();
      if (exists) {
        return this.getText() !== this.cachedDiskContents;
      } else {
        return this.wasModifiedBeforeRemove != null ?
          this.wasModifiedBeforeRemove : !this.isEmpty();
      }
    } else {
      return !this.isEmpty();
    }
  }
}

module.exports = NuclideTextBuffer;
