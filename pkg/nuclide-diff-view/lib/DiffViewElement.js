'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DiffViewModel from './DiffViewModel';

import {Emitter, CompositeDisposable} from 'atom';
import nuclideUri from '../../commons-node/nuclideUri';

const DID_DESTROY_EVENT_NAME = 'did-destroy';
const CHANGE_TITLE_EVENT_NAME = 'did-change-title';

class DiffViewElement extends HTMLElement {
  _uri: string;
  _diffModel: DiffViewModel;
  _emitter: atom$Emitter;
  _subscriptions: CompositeDisposable;

  initialize(diffModel: DiffViewModel, uri: string): HTMLElement {
    this._diffModel = diffModel;
    this._uri = uri;
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();

    let fileName = this._getActiveFileName();
    this._subscriptions.add(this._diffModel.onDidUpdateState(() => {
      const newFileName = this._getActiveFileName();
      if (newFileName !== fileName) {
        fileName = newFileName;
        this._emitter.emit(CHANGE_TITLE_EVENT_NAME, this.getTitle());
      }
    }));
    this._subscriptions.add(this._emitter);
    return this;
  }

  _getActiveFileName(): ?string {
    const {filePath} = this._diffModel.getState().fileDiff;
    if (filePath == null || filePath.length === 0) {
      return null;
    }
    return nuclideUri.basename(filePath);
  }

  getIconName(): string {
    return 'git-branch';
  }

  /**
   * Return the tab title for the opened diff view tab item.
   */
  getTitle(): string {
    const fileName = this._getActiveFileName();
    return 'Diff View' + (fileName == null ? '' : ` : ${fileName}`);
  }

  /**
   * Change the title as the active file changes.
   */
  onDidChangeTitle(callback: (title: string) => mixed): IDisposable {
    return this._emitter.on('did-change-title', callback);
  }

  /**
   * Return the tab URI for the opened diff view tab item.
   * This guarantees only one diff view will be opened per URI.
   */
  getURI(): string {
    return this._uri;
  }

  /**
   * Saves the edited file in the editable right text editor.
   */
  save(): void {
    this._diffModel.saveActiveFile();
  }

  onDidChangeModified(callback: () => mixed): IDisposable {
    return this._diffModel.onDidActiveBufferChangeModified(callback);
  }

  isModified(): boolean {
    return this._diffModel.isActiveBufferModified();
  }

  /**
   * Emits a destroy event that's used to unmount the attached React component
   * and invalidate the cached view instance of the Diff View.
   */
  destroy(): void {
    this._emitter.emit('did-destroy');
    this._subscriptions.dispose();
  }

  serialize(): ?Object {
    return null;
  }

  onDidDestroy(callback: () => void): IDisposable {
    return this._emitter.on(DID_DESTROY_EVENT_NAME, callback);
  }

}

export default document.registerElement('nuclide-diff-view', {
  prototype: DiffViewElement.prototype,
});
