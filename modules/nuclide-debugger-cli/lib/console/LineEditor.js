"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _ANSIInputStreamParser() {
  const data = require("./ANSIInputStreamParser");

  _ANSIInputStreamParser = function () {
    return data;
  };

  return data;
}

function _ANSIStreamOutput() {
  const data = require("./ANSIStreamOutput");

  _ANSIStreamOutput = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

function _GatedCursorControl() {
  const data = _interopRequireDefault(require("./GatedCursorControl"));

  _GatedCursorControl = function () {
    return data;
  };

  return data;
}

function _History() {
  const data = _interopRequireDefault(require("./History"));

  _History = function () {
    return data;
  };

  return data;
}

function _ANSIEscapeSequenceParser() {
  const data = _interopRequireDefault(require("./ANSIEscapeSequenceParser"));

  _ANSIEscapeSequenceParser = function () {
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
 *  strict
 * @format
 */
function onlyKeepSGR(seq) {
  // m is the terminator for Set Graphics Rendition
  return seq.final === 'm';
}

class LineEditor extends _events.default {
  // NB cursor is always an index into _buffer (or one past the end)
  // even if the line is scrolled to the right. _repaint is responsible
  // for making sure the physical cursor is positioned correctly
  constructor(options) {
    super();
    this._buffer = '';
    this._screenRows = 0;
    this._screenColumns = 0;
    this._fieldRow = 0;
    this._cursor = 0;
    this._leftEdge = 0;
    this._parser = new (_ANSIInputStreamParser().ANSIInputStreamParser)();
    this._input = options.input != null ? options.input : process.stdin;
    this._output = options.output != null ? options.output : process.stdout; // $FlowFixMe isTTY exists

    this._tty = options.tty != null ? options.tty : this._input.isTTY;
    this._cursorPromises = new Set();
    const maxHistoryItems = options.maxHistoryItems != null ? options.maxHistoryItems : 50;
    const removeDups = options.removeHistoryDuplicates != null ? options.removeHistoryDuplicates : true;
    this._history = new (_History().default)(maxHistoryItems, removeDups);
    this._historyTextSave = '';
    this._editedSinceHistory = false;

    if (this._tty) {
      // We don't want this going through this.write because that will strip
      // out the sequences this generates.
      this._outputANSI = new (_ANSIStreamOutput().ANSIStreamOutput)(s => {
        this._output.write(s);

        return;
      });
      this._gatedOutputANSI = new (_GatedCursorControl().default)(this._outputANSI);
    }

    this._installHooks();

    this._onResize();

    this.setPrompt('$ ');
    this._borrowed = false;
    this._lastOutputColumn = 1;
    this._keyHandlers = new Map([['CTRL-A', () => this._home()], ['CTRL-B', () => this._left()], ['CTRL-C', () => this._sigint()], ['CTRL-D', () => this._deleteRight(true)], ['CTRL-E', () => this._end()], ['CTRL-F', () => this._right()], ['CTRL-K', () => this._deleteToEnd()], ['CTRL-N', () => this._historyNext()], ['CTRL-P', () => this._historyPrevious()], ['CTRL-T', () => this._swapChars()], ['CTRL-U', () => this._deleteLine()], ['CTRL-W', () => this._deleteToStart()], ['HOME', () => this._home()], ['END', () => this._end()], ['LEFT', () => this._left()], ['RIGHT', () => this._right()], ['DOWN', () => this._historyNext()], ['UP', () => this._historyPrevious()], ['BACKSPACE', () => this._backspace()], ['ENTER', () => this._enter()], ['DEL', () => this._deleteRight(false)], ['ESCAPE', () => this._deleteLine()]]);
  }

  close() {
    if (this._onClose != null) {
      this._input.removeListener('close', this._onClose);

      this._onClose = null;
    }

    if (this._onData != null) {
      this._input.removeListener('data', this._onData);

      this._onData = null;
    }

    this.emit('close');
  }

  isTTY() {
    return this._tty;
  }

  setPrompt(prompt) {
    this._parsedPrompt = (0, _ANSIEscapeSequenceParser().default)(prompt, onlyKeepSGR);
  } // NOTE that writing is an async process because we have to wait for
  // transactions with the terminal (e.g. getting the cursor position)
  // We don't want the client to have to wait, so queue writes and manage
  // the async all internally.
  //
  // write() manages writing text to the screen from the application without
  // bothering the prompt, even text which contains (and not always ending in)
  // newlines.


  write(s) {
    if (this._writeQueue == null) {
      this._writeQueue = '';
    }

    this._writeQueue += s;

    if (!this._writing) {
      this._processWriteQueue();
    }
  }

  async _processWriteQueue() {
    this._writing = true;

    while (this._writeQueue != null) {
      const s = this._writeQueue;
      this._writeQueue = null; // await in loop is intentional here - while we're waiting, other
      // stuff to write could come in.
      // eslint-disable-next-line no-await-in-loop

      await this._write(s);
    }

    this._writing = false;
  }

  async _write(s) {
    if (this._tty && !this._borrowed) {
      // here we output the string (which may not have a newline terminator)
      // while maintaining the integrity of the prompt
      const cursor = this._outputANSI;

      if (!(cursor != null)) {
        throw new Error("Invariant violation: \"cursor != null\"");
      } // clear out prompt


      const here = await this._getCursorPosition();
      cursor.gotoXY(1, here.row);
      cursor.clearEOL();
      this._fieldRow = here.row;
      let col = this._lastOutputColumn;
      let row = this._fieldRow;

      if (col !== 1) {
        // if there was a partial line, move to the end of it
        row--;
        cursor.gotoXY(col, row);
      }

      const outputPiece = line => {
        const tabbed = line.split('\t');

        for (let i = 0; i < tabbed.length; i++) {
          // strip out any escape or control sequences other than SGR, which is
          // used for setting colors and other text attributes
          const parsed = (0, _ANSIEscapeSequenceParser().default)(tabbed[i], onlyKeepSGR);

          this._output.write(parsed.filteredText); // update the cursor position. the fact that screen cell indices are
          // 1-based makes the mod math a bit weird. Convert col to be zero-based first.


          col--;
          col += parsed.displayLength;
          row += Math.trunc(col / this._screenColumns);
          col %= this._screenColumns;

          if (i < tabbed.length - 1) {
            const target = col + 7 - col % 8;

            this._output.write(' '.repeat(target - col));

            col = target;
          }

          col++;
        }
      }; // NB we are assuming no control characters other than \r and \n here
      // anything else will interfere with column counting


      const lines = s.replace(/\r/g, '').split('\n');
      outputPiece(lines[0]);
      lines.shift();

      for (const line of lines) {
        this._output.write('\n');

        row++;
        col = 1;
        outputPiece(line);
      }

      this._lastOutputColumn = col;
      this._fieldRow = Math.min(this._screenRows, row + 1);

      this._output.write('\r\n');

      cursor.clearEOL();

      this._output.write(this._parsedPrompt.filteredText);

      this._repaint();
    } else {
      this._output.write(s);
    }

    this._writing = false;
  } // borrowTTY and returnTTY allow the user of console to take over complete
  // control of the TTY; for example, to implement paging of large amounts of
  // data.


  borrowTTY() {
    if (this._borrowed || !this._tty) {
      return null;
    }

    const cursorControl = this._gatedOutputANSI;

    if (!(cursorControl != null)) {
      throw new Error("Invariant violation: \"cursorControl != null\"");
    }

    this._borrowed = true;
    cursorControl.setEnabled(true);
    return cursorControl;
  }

  returnTTY() {
    if (!this._borrowed || !this._tty) {
      return false;
    }

    const cursorControl = this._gatedOutputANSI;

    if (!(cursorControl != null)) {
      throw new Error("Invariant violation: \"cursorControl != null\"");
    }

    this._borrowed = false;
    cursorControl.setEnabled(false);
    this.write(`\n${this._parsedPrompt.filteredText}`);

    this._repaint();

    return true;
  }

  async prompt() {
    this._output.write(`\n${this._parsedPrompt.filteredText}`);

    if (this._tty) {
      const cursorPos = await this._getCursorPosition();
      this._fieldRow = cursorPos.row;
      this._cursor = 0;
      this._leftEdge = 0;
    }
  }

  _onText(s) {
    if (this._borrowed) {
      for (const ch of s.toUpperCase()) {
        this.emit('key', ch);
      }

      return;
    }

    if (this._tty) {
      this._buffer = this._buffer.substr(0, this._cursor) + s + this._buffer.substr(this._cursor);
      this._cursor += s.length;

      this._textChanged();

      this._repaint();

      return;
    }

    let piece = s;

    while (true) {
      const ret = piece.indexOf('\n');

      if (ret === -1) {
        break;
      }

      this._buffer += piece.substr(0, ret);
      this.emit('line', this._buffer);
      this._buffer = '';
      piece = piece.substr(ret + 1);
    }

    this._buffer += piece;
  }

  _onKey(key) {
    const name = key.ctrl ? `CTRL-${key.key}` : key.key;

    if (this._borrowed) {
      this.emit('key', name);
      return;
    }

    const handler = this._keyHandlers.get(name);

    if (handler != null) {
      handler();
    }
  }

  _sigint() {
    this.emit('SIGINT');
  }

  _textChanged() {
    this._historyTextSave = this._buffer;

    this._history.resetSearch();
  }

  _home() {
    this._cursor = 0;

    this._repaint();
  }

  _end() {
    this._cursor = this._buffer === '' ? 0 : this._buffer.length;

    this._repaint();
  }

  _left() {
    if (this._cursor > 0) {
      this._cursor--;

      this._repaint();
    }
  }

  _right() {
    if (this._cursor < this._buffer.length) {
      this._cursor++;

      this._repaint();
    }
  }

  _deleteToEnd() {
    if (this._cursor < this._buffer.length) {
      this._buffer = this._buffer.substr(0, this._cursor);

      this._textChanged();

      this._repaint();
    }
  }

  _deleteToStart() {
    if (this._cursor > 0) {
      this._buffer = this._buffer.substr(this._cursor);
      this._cursor = 0;

      this._textChanged();

      this._repaint();
    }
  }

  _deleteLine() {
    if (this._buffer !== '') {
      this._buffer = '';
      this._cursor = 0;

      this._textChanged();

      this._repaint();
    }
  }

  _backspace() {
    if (this._cursor > 0) {
      this._buffer = this._buffer.substr(0, this._cursor - 1) + this._buffer.substr(this._cursor);
      this._cursor--;

      this._textChanged();

      this._repaint();
    }
  }

  _deleteRight(eofOnEmpty) {
    if (this._buffer === '' && eofOnEmpty) {
      this.close();
      return;
    }

    if (this._cursor < this._buffer.length) {
      this._buffer = this._buffer.substr(0, this._cursor) + this._buffer.substr(this._cursor + 1);

      this._textChanged();

      this._repaint();
    }
  }

  _swapChars() {
    if (this._cursor === 0 || this._buffer.length < 2) {
      return;
    }

    if (this._cursor === this._buffer.length) {
      this._cursor--;
    }

    this._buffer = this._buffer.substr(0, this._cursor - 1) + this._buffer.substr(this._cursor, 1) + this._buffer.substr(this._cursor - 1, 1) + this._buffer.substr(this._cursor + 1);
    this._cursor++;

    this._textChanged();

    this._repaint();
  }

  _enter() {
    this._output.write('\r\n');

    this._history.addItem(this._buffer);

    this.emit('line', this._buffer);
    this._buffer = '';
    this._cursor = 0;

    this._textChanged();
  }

  _historyPrevious() {
    const item = this._history.previousItem();

    if (item != null) {
      this._buffer = item;
      this._cursor = item.length;

      this._repaint();
    }
  }

  _historyNext() {
    const item = this._history.nextItem();

    if (item != null) {
      this._buffer = item;
      this._cursor = item.length;
    } else {
      this._buffer = this._historyTextSave;
      this._cursor = this._buffer.length;
    }

    this._repaint();
  }

  _repaint() {
    if (!this._tty) {
      throw new Error("Invariant violation: \"this._tty\"");
    }

    const output = this._output;
    const outputANSI = this._outputANSI;

    if (!(output != null && outputANSI != null)) {
      throw new Error("Invariant violation: \"output != null && outputANSI != null\"");
    }

    const fieldStartCol = 1 + this._parsedPrompt.displayLength;
    outputANSI.gotoXY(fieldStartCol, this._fieldRow);
    outputANSI.clearEOL();
    let hwcursor = fieldStartCol + this._cursor - this._leftEdge;

    if (hwcursor < fieldStartCol) {
      this._leftEdge -= fieldStartCol - hwcursor;
    } else if (hwcursor >= this._screenColumns) {
      this._leftEdge += hwcursor - this._screenColumns + 1;
    }

    hwcursor = fieldStartCol + this._cursor - this._leftEdge;
    const textColumns = this._screenColumns - fieldStartCol;

    this._output.write(this._buffer.substr(this._leftEdge, textColumns));

    outputANSI.gotoXY(hwcursor, this._fieldRow);
  }

  async _getCursorPosition() {
    return new Promise((resolve, reject) => {
      if (!this._tty) {
        reject(new Error('_getCursorPosition called and not a TTY'));
      }

      const completion = {
        timeout: null,
        resolve
      };
      const tmo = setTimeout(() => {
        reject(new Error('timeout before cursor position returned'));

        this._cursorPromises.delete(completion);
      }, 2000);
      completion.timeout = tmo;

      this._cursorPromises.add(completion);

      if (!(this._outputANSI != null)) {
        throw new Error("Invariant violation: \"this._outputANSI != null\"");
      }

      this._outputANSI.queryCursorPosition();
    });
  }

  _onCursorPosition(pos) {
    for (const completion of this._cursorPromises) {
      completion.resolve(pos);
    }

    this._cursorPromises.clear();
  }

  _onResize() {
    if (this._tty) {
      const output = this._output;

      if (!(output != null)) {
        throw new Error("Invariant violation: \"output != null\"");
      } // $FlowFixMe rows and columns exists if the stream is a TTY


      this._screenRows = output.rows; // $FlowFixMe rows and columns exists if the stream is a TTY

      this._screenColumns = output.columns;
    }
  }

  _installHooks() {
    this._input.setEncoding('utf8');

    this._onClose = () => {
      this.write('\n');
      this.close();
    };

    this._input.on('end', this._onClose);

    if (this._tty) {
      // $FlowFixMe has this call
      this._input.setRawMode(true);

      this._parser = new (_ANSIInputStreamParser().ANSIInputStreamParser)();

      this._onData = t => this._parser.next(t);

      this._input.on('data', this._onData);

      this._parser.on('text', s => this._onText(s));

      this._parser.on('key', k => this._onKey(k));

      this._parser.on('cursor', c => this._onCursorPosition(c));

      process.on('SIGWINCH', () => this._onResize());
      return;
    }

    this._onData = t => this._onText(t);

    this._input.on('data', this._onData);
  }

}

exports.default = LineEditor;