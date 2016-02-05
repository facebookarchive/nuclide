'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Datatip,
} from '../../datatip-interfaces';

import {CompositeDisposable, Disposable} from 'atom';
import {
  React,
  ReactDOM,
} from 'react-for-atom';

import {DatatipComponent, DATATIP_ACTIONS} from './DatatipComponent';

const LINE_END_MARGIN = 20;

export class PinnedDatatip {
  _subscriptions: atom$CompositeDisposable;
  _marker: ?atom$Marker;
  _range: atom$Range;
  _component: ReactElement;
  _editor: TextEditor;
  _hostElement: HTMLElement;
  _boundDispose: Function;

  constructor(
    datatip: Datatip,
    editor: TextEditor,
    onDispose: (pinnedDatatip: PinnedDatatip) => void) {
    const {
      range,
      component,
    } = datatip;
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(new Disposable(() => onDispose(this)));
    this._range = range;
    this._component = component;
    this._editor = editor;
    this._marker = null;
    this._hostElement = document.createElement('div');
    this._hostElement.className = 'nuclide-datatip-overlay';
    this._boundDispose = this.dispose.bind(this);
    this.render();
  }

  // Ensure positioning of the Datatip at the end of the current line.
  _updateHostElementPosition(): void {
    const {
      _editor,
      _range,
      _hostElement,
    } = this;
    const charWidth = _editor.getDefaultCharWidth();
    const lineLength = _editor.getBuffer().getLines()[_range.start.row].length;
    _hostElement.style.display = 'block';
    _hostElement.style.top = -_editor.getLineHeightInPixels() + 'px';
    _hostElement.style.left = (lineLength - _range.end.column) * charWidth + LINE_END_MARGIN + 'px';
  }

  render(): void {
    const {
      _editor,
      _range,
      _component,
      _hostElement,
    } = this;
    this._updateHostElementPosition();
    ReactDOM.render(
      <DatatipComponent
        action={DATATIP_ACTIONS.CLOSE}
        actionTitle="Close this datatip"
        onActionClick={this._boundDispose}>
        {_component}
      </DatatipComponent>,
      _hostElement,
    );

    const marker: atom$Marker = _editor.markBufferRange(_range, {invalidate: 'never'});
    this._marker = marker;
    _editor.decorateMarker(
      marker,
      {
        type: 'overlay',
        position: 'head',
        item: this._hostElement,
      }
    );
    _editor.decorateMarker(
      marker,
      {
        type: 'highlight',
        class: 'nuclide-datatip-highlight-region',
      }
    );
  }

  dispose(): void {
    if (this._marker != null) {
      this._marker.destroy();
    }
    ReactDOM.unmountComponentAtNode(this._hostElement);
    this._hostElement.remove();
    this._subscriptions.dispose();
  }

}
