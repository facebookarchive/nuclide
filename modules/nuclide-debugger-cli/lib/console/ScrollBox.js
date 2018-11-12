/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import type {ElementOptions} from 'blessed';

import blessed from 'blessed';

type ScrollBoxOptions = {
  ...ElementOptions,
  maxScrollBack?: number,
};

export default class ScrollBox extends blessed.widget.Box {
  _maxScrollBack: number;
  _boxTop: number;
  _boxBottom: boolean;
  _lines: Array<string>;
  _more: boolean;
  _nextOutputSameLine: boolean; // true if the next output should be on the same line (no ending \n)

  constructor(options: ScrollBoxOptions) {
    super(options);

    const maxScrollBack = options.maxScrollBack;
    // $FlowFixMe maxScrollback is fine here with a null check but flow is upset
    this._maxScrollBack = maxScrollBack != null ? maxScrollBack : 2000;
    this._boxTop = 0;
    this._boxBottom = true;
    this._lines = [];
    this._more = false;
    this._nextOutputSameLine = false;
  }

  atTop(): boolean {
    return this._boxTop === 0;
  }

  atBottom(): boolean {
    return this._boxBottom;
  }

  moreOutput(): boolean {
    return this._more;
  }

  topLine(): number {
    return this._boxTop;
  }

  lastLine(): number {
    return Math.min(this._boxTop + this.height, this._lines.length);
  }

  lines(): number {
    return this._lines.length;
  }

  resize(): void {
    this._recomputeContents();
  }

  write(s: string): void {
    const trailingNewline = s.endsWith('\n');
    const lines = s.split('\n');

    if (trailingNewline) {
      lines.splice(-1);
    }

    if (lines.length === 0) {
      return;
    }

    if (this._nextOutputSameLine && this._lines.length !== 0) {
      this._lines[this._lines.length - 1] += lines[0];
      lines.shift();
    }

    this._lines = this._lines.concat(lines).slice(-this._maxScrollBack);
    this._nextOutputSameLine = !trailingNewline;

    if (!this._boxBottom) {
      this._more = true;
    }

    this._recomputeContents();
  }

  pageUp(): void {
    this._boxTop = Math.max(0, this._boxTop - this.height + 1);
    this._updateScrollFlags();
    this._recomputeContents();
  }

  pageDown(): void {
    this._boxTop = Math.min(
      this._lines.length - this.height,
      this._boxTop + this.height - 1,
    );
    this._updateScrollFlags();
    this._recomputeContents();
  }

  scrollToTop(): void {
    this._boxTop = 0;
    this._updateScrollFlags();
    this._recomputeContents();
  }

  scrollToBottom(): void {
    this._boxTop = Math.max(0, this._lines.length - this.height);
    this._updateScrollFlags();
    this._recomputeContents();
  }

  _updateScrollFlags(): void {
    this._boxBottom = this._lines.length - this._boxTop <= this.height;
    if (this._boxBottom) {
      this._more = false;
    }
  }

  _recomputeContents() {
    // if we're pinned to the bottom, recompute the top
    if (this._boxBottom) {
      this._boxTop = Math.max(0, this._lines.length - this.height);
    }

    this.setContent(
      this._lines.slice(this._boxTop, this._boxTop + this.height).join('\n'),
    );
  }
}
