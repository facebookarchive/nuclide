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

import {Emitter} from 'atom';

const DID_DESTROY_EVENT_NAME = 'did-destroy';

class DiffViewElement extends HTMLElement {
  _uri: string;
  _diffModel: DiffViewModel;
  _emitter: atom$Emitter;

  initialize(diffModel: DiffViewModel, uri: string): HTMLElement {
    this._diffModel = diffModel;
    this._uri = uri;
    this._emitter = new Emitter();
    return this;
  }

  /**
   * Return the tab title for the opened diff view tab item.
   */
  getTitle(): string {
    return 'Diff View';
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

  /**
   * Emits a destroy event that's used to unmount the attached React component
   * and invalidate the cached view instance of the Diff View.
   */
  destroy(): void {
    this._emitter.emit('did-destroy');
  }

  serialize(): ?Object {
    return null;
  }

  onDidDestroy(callback: () => void): atom$IDisposable {
    return this._emitter.on(DID_DESTROY_EVENT_NAME, callback);
  }

}

module.exports = DiffViewElement = document.registerElement('nuclide-diff-view', {
  prototype: DiffViewElement.prototype,
});
