"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
function screenSize() {
  // $FlowFixMe add rows and columns to stream$Writeable
  return {
    rows: process.stdout.rows,
    cols: process.stdout.columns
  };
}

class More {
  constructor(text, cli, cursorControl, done) {
    this._cli = cli;
    this._cursorControl = cursorControl;
    this._done = done;
    this._text = text.split('\n');

    while (this._text.length && this._text[this._text.length - 1] === '') {
      this._text.pop();
    }

    this._keymap = new Map([['Q', () => this.quit()], [' ', () => this.nextPage()], ['PAGEDOWN', () => this.nextPage()], ['PAGEUP', () => this.previousPage()]]);
  }

  display() {
    const dispose = new (_UniversalDisposable().default)();
    this._dispose = dispose;
    this._topLine = 0;
    this._formatted = [];
    this._size = screenSize();

    if (!this._cli.isTTY() || this._text.length < this._size.rows) {
      this._cli.write('asdhfshjkadfhkjsafhjkasfhkjashjklf\n');

      for (const line of this._text) {
        this._cli.write(`${line}\n`);
      }

      this.quit();
      return;
    }

    dispose.add(_RxMin.Observable.fromEvent(process.stdout, 'resize').map(_ => screenSize()).subscribe(size => {
      this._size = size;

      this._formatText();

      this._redisplay();
    })); // $FlowFixMe add cursor functions to readline$Interface

    if (!process.stdin.isRaw) {
      throw new Error("Invariant violation: \"process.stdin.isRaw\"");
    }

    dispose.add(this._cli.observeKeys().subscribe(key => this._handleKey(key)));

    this._cli.stopInput();

    this._formatText();

    this._redisplay();
  }

  quit() {
    if (this._dispose != null) {
      this._dispose.dispose();

      this._dispose = null;

      this._cli.startInput();

      this._done();
    }
  }

  nextPage() {
    if (!this._lastScreen) {
      this._topLine = this._bottomLine;

      this._redisplay();
    }
  }

  previousPage() {
    if (this._topLine === 0) {
      return;
    }

    let i = this._topLine - 1;
    let row = this._size.rows;

    while (row > 0 && i >= 0) {
      let j = i;

      while (j >= 0 && this._formatted[i].originalLine === this._formatted[j].originalLine) {
        j--;
      }

      row -= i - j;

      if (row <= 0) {
        break;
      }

      i = j;
    }

    this._topLine = Math.max(0, i);

    this._redisplay();
  }

  _handleKey(key) {
    const handler = this._keymap.get(key);

    if (handler == null) {
      return;
    }

    handler();
  }

  _formatText() {
    const maxLen = Math.max(1, this._size.cols - 2);
    this._formatted = [];

    this._text.forEach((fullLine, originalLine) => {
      let line = fullLine;

      while (true) {
        if (line.length <= maxLen) {
          this._formatted.push({
            originalLine,
            text: line
          });

          break;
        }

        this._formatted.push({
          originalLine,
          text: line.substr(0, maxLen)
        });

        line = line.substr(maxLen);
      }
    });
  }

  _redisplay() {
    let row = 0;
    const textRows = this._size.rows - 1;
    let index = this._topLine;

    while (row < textRows && index < this._formatted.length) {
      // Find bounds of original line before it was split up into screen-size
      // chunks
      let lineEnd = index;

      while (lineEnd < this._formatted.length && this._formatted[lineEnd].originalLine === this._formatted[index].originalLine) {
        lineEnd++;
      }

      const lineRows = lineEnd - index; // Only print it if the whole thing fits (unless it's the ONLY line)

      if (row + lineRows > textRows && row !== 0) {
        break;
      }

      const originalLine = this._formatted[index].originalLine;

      while (row < textRows && index < this._formatted.length && this._formatted[index].originalLine === originalLine) {
        this._cursorControl.gotoXY(1, row + 1);

        this._cursorControl.clearEOL();

        this._cli.write(this._formatted[index].text);

        index++;

        if (index < lineEnd) {
          this._cursorControl.gotoXY(this._size.cols - 1, row + 1);

          this._cli.write('+');
        }

        row++;
      }
    }

    this._bottomLine = index;
    this._lastScreen = row < textRows;

    for (; row < textRows; row++) {
      this._cursorControl.gotoXY(1, row + 1);

      this._cursorControl.clearEOL();
    }

    this._cursorControl.gotoXY(1, this._size.rows);

    this._cursorControl.clearEOL();

    if (index < this._formatted.length) {
      this._cli.write('---MORE---');
    } else {
      this._cli.write('---END---');
    }
  }

}

exports.default = More;