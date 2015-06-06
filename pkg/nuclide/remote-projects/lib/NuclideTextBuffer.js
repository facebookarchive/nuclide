'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, TextBuffer} = require('atom');

class NuclideTextBuffer extends TextBuffer {

  constructor(connection: RemoteConnection, params: any) {
    super(params);
    this.connection = connection;
    this.setPath(params.filePath);
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
      this.file.setEncoding(this.getEncoding());
      this.subscribeToFile();
    } else {
      this.file = null;
    }
    this.emitter.emit('did-change-path', this.getPath());
  }

  createFile(filePath: string): RemoteFile {
    return this.connection.createFile(filePath);
  }

  async saveAs(filePath: string) {
    if (!filePath) {
      throw new Error('Can\'t save buffer with no file path');
    }

    this.emitter.emit('will-save', {path: filePath});
    this.setPath(filePath);
    try {
      await this.file.write(this.getText());
      this.cachedDiskContents = this.getText();
      this.conflict = false;
      this.emitModifiedStatusChanged(false);
      this.emitter.emit('did-save', {path: filePath});
    } catch (e) {
      atom.notifications.addError(`Failed to save remote file: ${e.message}`);
    }
  }

  updateCachedDiskContentsSync() {
    throw new Error('updateCachedDiskContentsSync isn\'t supported in NuclideTextBuffer');
  }

  subscribeToFile() {
    if (this.fileSubscriptions) {
      this.fileSubscriptions.dispose();
    }
    this.fileSubscriptions = new CompositeDisposable();

    this.fileSubscriptions.add(this.file.onDidChange(async () => {
      var isModified = await this._isModified();
      if (isModified) {
        this.conflict = true;
      }
      var previousContents = this.cachedDiskContents;
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

    this.fileSubscriptions.add(this.file.onDidDelete(() => {
      var modified = this.getText() !== this.cachedDiskContents;
      this.wasModifiedBeforeRemove = modified;
      if (modified) {
        this.updateCachedDiskContents();
      } else {
        this.destroy();
      }
    }));

    this.fileSubscriptions.add(this.file.onDidRename(() => {
        this.emitter.emit('did-change-path', this.getPath());
    }));

    this.fileSubscriptions.add(this.file.onWillThrowWatchError((errorObject) => {
        this.emitter.emit('will-throw-watch-error', errorObject);
    }));
  }

  async _isModified(): Promise<boolean> {
    if (!this.loaded) {
      return false;
    }
    if (this.file) {
      var exists = await this.file.exists();
      if (exists) {
        return this.getText() !== this.cachedDiskContents;
      } else {
        return this.wasModifiedBeforeRemove != null ? this.wasModifiedBeforeRemove : !this.isEmpty();
      }
    } else {
      return !this.isEmpty();
    }
  }
}

module.exports = NuclideTextBuffer;
