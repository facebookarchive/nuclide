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
  // handlers for line editor events
  // handlers for keys the user can hit during editing
  // i/o state
  // true if we're writing to a real terminal and not redirected
  // the input stream, usually stdin
  // the output stream usually stdout
  // filter which looks for escape sequences in input
  // callback for input stream closure
  // callback for input data
  // if true, then the app is doing full screen i/o
  // the last column app output ended at
  // the number of rows on the screen (terminal window)
  // the number of columns on the screen
  // true if the prompt is being shown
  // these objects convert calls like gotoxy() to an ANSI/xterm escape sequence
  // escape sequence formatter, writes immediately
  // escape sequence formatter, queues writes into event queue
  // gated, queued escape sequence formatter
  // editor state
  // the string being edited
  // the prompt, with everything but text attributes removed
  // the screen row containing the prompt
  // how far into _buffer we're scrolled for display
  // the cursor position inside _buffer
  // a list of previously entered commands
  // the string that was being edited before the user starting scrolling through history
  // event state
  // events awaiting execution
  // for numbering events for logging
  // cursor position
  // pending cursor position queries
  // utility state
  // the logger
  // flag to kill the queue if we're shutting down
  constructor(options, logger) {
    super();
    this._eventQueue = [];
    this._cursorPromises = [];
    this._done = false;
    this._eventHandlers = new Map([['SETPROMPT', ev => {
      if (!(ev.type === 'SETPROMPT')) {
        throw new Error("Invariant violation: \"ev.type === 'SETPROMPT'\"");
      }

      return this._handleSetPrompt(ev.prompt);
    }], ['WRITE', ev => {
      if (!(ev.type === 'WRITE')) {
        throw new Error("Invariant violation: \"ev.type === 'WRITE'\"");
      }

      return this._handleWrite(ev.data);
    }], ['WRITEESC', ev => {
      if (!(ev.type === 'WRITEESC')) {
        throw new Error("Invariant violation: \"ev.type === 'WRITEESC'\"");
      }

      return this._handleWriteEsc(ev.data);
    }], ['BORROWTTY', ev => {
      if (!(ev.type === 'BORROWTTY')) {
        throw new Error("Invariant violation: \"ev.type === 'BORROWTTY'\"");
      }

      return this._handleBorrowTTY(ev.resolve, ev.reject);
    }], ['RETURNTTY', ev => this._handleReturnTTY()], ['PROMPT', ev => {
      if (!(ev.type === 'PROMPT')) {
        throw new Error("Invariant violation: \"ev.type === 'PROMPT'\"");
      }

      return this._handlePrompt(ev.resolve);
    }], ['INPUTTEXT', ev => {
      if (!(ev.type === 'INPUTTEXT')) {
        throw new Error("Invariant violation: \"ev.type === 'INPUTTEXT'\"");
      }

      return this._handleInputText(ev.data);
    }], ['KEY', ev => {
      if (!(ev.type === 'KEY')) {
        throw new Error("Invariant violation: \"ev.type === 'KEY'\"");
      }

      return this._handleKey(ev.key);
    }], ['RESIZE', ev => this._handleResize()], ['CLOSE', ev => this._handleClose()]]);
    this._keyHandlers = new Map([['CTRL-A', () => this._home()], ['CTRL-B', () => this._left()], ['CTRL-C', () => this._sigint()], ['CTRL-D', () => this._deleteRight(true)], ['CTRL-E', () => this._end()], ['CTRL-F', () => this._right()], ['CTRL-K', () => this._deleteToEnd()], ['CTRL-N', () => this._historyNext()], ['CTRL-P', () => this._historyPrevious()], ['CTRL-T', () => this._swapChars()], ['CTRL-U', () => this._deleteLine()], ['CTRL-W', () => this._deleteToStart()], ['HOME', () => this._home()], ['END', () => this._end()], ['LEFT', () => this._left()], ['RIGHT', () => this._right()], ['DOWN', () => this._historyNext()], ['UP', () => this._historyPrevious()], ['BACKSPACE', () => this._backspace()], ['ENTER', () => this._enter()], ['DEL', () => this._deleteRight(false)], ['ESCAPE', () => this._deleteLine()]]);
    this._buffer = '';
    this._cursor = 0;
    this._leftEdge = 0;
    this._logger = logger;
    this._parser = new (_ANSIInputStreamParser().ANSIInputStreamParser)();
    this._input = options.input != null ? options.input : process.stdin;
    this._output = options.output != null ? options.output : process.stdout; // $FlowFixMe isTTY exists

    this._tty = options.tty != null ? options.tty : this._input.isTTY;
    this._cursorPromises = [];
    const maxHistoryItems = options.maxHistoryItems != null ? options.maxHistoryItems : 50;
    const removeDups = options.removeHistoryDuplicates != null ? options.removeHistoryDuplicates : true;
    this._history = new (_History().default)(maxHistoryItems, removeDups);
    this._historyTextSave = '';

    if (this._tty) {
      // We don't want this going through this.write because that will strip
      // out the sequences this generates.
      this._outputANSI = new (_ANSIStreamOutput().ANSIStreamOutput)(s => {
        this._output.write(s);
      }); // This is for queuing an escape sequence when the TTY is borrowed and
      // cursor motion commands must be properly interleaved with text

      this._queuedOutputANSI = new (_ANSIStreamOutput().ANSIStreamOutput)(s => {
        this._queueEvent({
          seq: this._nextEvent++,
          type: 'WRITEESC',
          data: s
        });
      });
      this._gatedOutputANSI = new (_GatedCursorControl().default)(this._queuedOutputANSI);
    }

    this._output.write('\n');

    this._installHooks();

    this._handleResize();

    this.setPrompt('$ ');
    this._borrowed = false;
    this._lastOutputColumn = 1;
    this._atPrompt = false;
  }

  isTTY() {
    return this._tty;
  }

  close() {
    this._queueEvent({
      seq: this._nextEvent++,
      type: 'CLOSE'
    });
  }

  setPrompt(prompt) {
    this._queueEvent({
      seq: this._nextEvent++,
      type: 'SETPROMPT',
      prompt
    });
  }

  write(s) {
    this._queueEvent({
      seq: this._nextEvent++,
      type: 'WRITE',
      data: s
    });
  }

  async borrowTTY() {
    return new Promise((resolve, reject) => {
      this._queueEvent({
        seq: this._nextEvent++,
        type: 'BORROWTTY',
        resolve,
        reject
      });
    });
  }

  returnTTY() {
    this._queueEvent({
      seq: this._nextEvent++,
      type: 'RETURNTTY'
    });
  }

  async prompt() {
    return new Promise((resolve, reject) => {
      this._queueEvent({
        seq: this._nextEvent++,
        type: 'PROMPT',
        resolve
      });
    });
  }

  _queueEvent(event) {
    this._eventQueue.push(event);

    if (this._eventQueue.length === 1) {
      this._processQueue();
    }
  }

  async _processQueue() {
    while (this._eventQueue.length > 0 && !this._done) {
      const event = this._eventQueue[0];

      this._logger.info(`console event: ${JSON.stringify(event)}`);

      const handler = this._eventHandlers.get(event.type);

      if (!(handler != null)) {
        throw new Error("Invariant violation: \"handler != null\"");
      } // intentional serializing of events here
      // eslint-disable-next-line no-await-in-loop


      await handler(event);

      this._logger.info(`console event done: ${JSON.stringify(event)}`);

      this._eventQueue.shift();
    }
  }

  async _handleSetPrompt(prompt) {
    this._parsedPrompt = (0, _ANSIEscapeSequenceParser().default)(prompt, onlyKeepSGR);
  }

  async _handleWrite(data) {
    const outputANSI = this._outputANSI;

    if (!(outputANSI != null)) {
      throw new Error("Invariant violation: \"outputANSI != null\"");
    }

    if (this._tty && !this._borrowed) {
      let col = this._lastOutputColumn;

      if (this._atPrompt) {
        outputANSI.gotoXY(1, this._fieldRow);
        outputANSI.clearEOL();

        if (col !== 1) {
          outputANSI.gotoXY(col, this._fieldRow - 1);
        }
      } // here we output the string (which may not have a newline terminator)
      // while maintaining the integrity of the prompt


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

          if (i < tabbed.length - 1) {
            const target = col + 7 - col % 8;

            this._output.write(' '.repeat(target - col));

            col = target;
          }

          col++;
        }
      }; // NB we are assuming no control characters other than \r and \n here
      // anything else will interfere with column counting


      const lines = data.replace(/\r/g, '').split('\n');
      outputPiece(lines[0]);
      lines.shift();

      for (const line of lines) {
        this._output.write('\n');

        col = 1;
        outputPiece(line);
      }

      this._lastOutputColumn = col;

      if (this._atPrompt) {
        if (col > 1) {
          this._output.write('\r\n');
        }

        this._output.write(`\r${this._parsedPrompt.filteredText}`);

        const cursorPos = await this._getCursorPosition();
        this._fieldRow = cursorPos.row;

        this._paintEditText();
      }
    } else {
      this._output.write(data);
    }
  }

  async _handleWriteEsc(data) {
    if (this._tty) {
      this._output.write(data);
    }
  }

  async _handleBorrowTTY(resolve, reject) {
    if (this._borrowed) {
      reject(new Error('TTY is already borrowed'));
    }

    if (!this._tty) {
      reject(new Error('Cannot borrow console if not a TTY'));
    }

    const cursorControl = this._gatedOutputANSI;

    if (!(cursorControl != null)) {
      throw new Error("Invariant violation: \"cursorControl != null\"");
    }

    this._borrowed = true;
    cursorControl.setEnabled(true);
    resolve(cursorControl);
  }

  async _handleReturnTTY() {
    if (!this._borrowed) {
      return;
    }

    const cursorControl = this._gatedOutputANSI;

    if (!(cursorControl != null)) {
      throw new Error("Invariant violation: \"cursorControl != null\"");
    }

    this._borrowed = false;
    cursorControl.setEnabled(false);
    this.prompt();
  }

  async _handlePrompt(resolve) {
    this._output.write(`\r${this._parsedPrompt.filteredText}`);

    if (this._tty) {
      const cursorPos = await this._getCursorPosition();
      this._fieldRow = cursorPos.row;

      this._paintEditText();

      this._atPrompt = true;
    }
  }

  async _handleInputText(data) {
    if (this._borrowed) {
      for (const ch of data.toUpperCase()) {
        this.emit('key', ch);
      }

      return;
    }

    if (this._tty) {
      this._buffer = this._buffer.substr(0, this._cursor) + data + this._buffer.substr(this._cursor);
      this._cursor += data.length;

      this._textChanged();

      this._paintEditText();

      return;
    }

    let piece = data;

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

  async _handleKey(key) {
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

  async _handleResize() {
    if (this._tty) {
      const output = this._output;

      if (!(output != null)) {
        throw new Error("Invariant violation: \"output != null\"");
      } // $FlowFixMe rows and columns exists if the stream is a TTY


      this._screenRows = output.rows; // $FlowFixMe rows and columns exists if the stream is a TTY

      this._screenColumns = output.columns;
    }
  }

  async _handleClose() {
    if (this._onClose != null) {
      this._input.removeListener('close', this._onClose);

      this._onClose = null;
    }

    if (this._onData != null) {
      this._input.removeListener('data', this._onData);

      this._onData = null;
    }

    this._done = true;
    this.emit('close');
  }

  _sigint() {
    this.emit('SIGINT');
  }

  _home() {
    this._cursor = 0;

    this._paintEditText();
  }

  _end() {
    this._cursor = this._buffer === '' ? 0 : this._buffer.length;

    this._paintEditText();
  }

  _left() {
    if (this._cursor > 0) {
      this._cursor--;

      this._paintEditText();
    }
  }

  _right() {
    if (this._cursor < this._buffer.length) {
      this._cursor++;

      this._paintEditText();
    }
  }

  _deleteToEnd() {
    if (this._cursor < this._buffer.length) {
      this._buffer = this._buffer.substr(0, this._cursor);

      this._textChanged();

      this._paintEditText();
    }
  }

  _deleteToStart() {
    if (this._cursor > 0) {
      this._buffer = this._buffer.substr(this._cursor);
      this._cursor = 0;

      this._textChanged();

      this._paintEditText();
    }
  }

  _deleteLine() {
    if (this._buffer !== '') {
      this._buffer = '';
      this._cursor = 0;

      this._textChanged();

      this._paintEditText();
    }
  }

  _backspace() {
    if (this._cursor > 0) {
      this._buffer = this._buffer.substr(0, this._cursor - 1) + this._buffer.substr(this._cursor);
      this._cursor--;

      this._textChanged();

      this._paintEditText();
    }
  }

  _deleteRight(eofOnEmpty) {
    if (this._buffer === '' && eofOnEmpty) {
      this._output.write('\r\n');

      this.close();
      return;
    }

    if (this._cursor < this._buffer.length) {
      this._buffer = this._buffer.substr(0, this._cursor) + this._buffer.substr(this._cursor + 1);

      this._textChanged();

      this._paintEditText();
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

    this._paintEditText();
  }

  _enter() {
    this._output.write('\r\n');

    this._history.addItem(this._buffer);

    this.emit('line', this._buffer);
    this._buffer = '';
    this._cursor = 0;

    this._textChanged();

    this._atPrompt = false;
  }

  _historyPrevious() {
    const item = this._history.previousItem();

    if (item != null) {
      this._buffer = item;
      this._cursor = item.length;

      this._paintEditText();
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

    this._paintEditText();
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

      this._parser.on('text', s => this._queueEvent({
        seq: this._nextEvent++,
        type: 'INPUTTEXT',
        data: s
      }));

      this._parser.on('key', k => this._queueEvent({
        seq: this._nextEvent++,
        type: 'KEY',
        key: k
      }));

      this._parser.on('cursor', c => this._onCursorPosition(c));

      process.on('SIGWINCH', () => this._queueEvent({
        seq: this._nextEvent++,
        type: 'RESIZE'
      }));
      return;
    }

    this._onData = t => {
      this._queueEvent({
        seq: this._nextEvent++,
        type: 'INPUTTEXT',
        data: t
      });
    };

    this._input.on('data', this._onData);
  }

  _paintEditText() {
    if (!this._tty) {
      throw new Error("Invariant violation: \"this._tty\"");
    }

    const output = this._output;
    const outputANSI = this._outputANSI;

    if (!(output != null && outputANSI != null)) {
      throw new Error("Invariant violation: \"output != null && outputANSI != null\"");
    }

    const fieldStartCol = 1 + this._parsedPrompt.displayLength;

    if (this._fieldRow != null) {
      outputANSI.gotoXY(fieldStartCol, this._fieldRow);
      outputANSI.clearEOL();
    }

    let hwcursor = fieldStartCol + this._cursor - this._leftEdge;

    if (hwcursor < fieldStartCol) {
      this._leftEdge -= fieldStartCol - hwcursor;
    } else if (hwcursor >= this._screenColumns) {
      this._leftEdge += hwcursor - this._screenColumns + 1;
    }

    hwcursor = fieldStartCol + this._cursor - this._leftEdge;
    const textColumns = this._screenColumns - fieldStartCol;

    this._output.write(this._buffer.substr(this._leftEdge, textColumns));

    if (this._fieldRow != null) {
      outputANSI.gotoXY(hwcursor, this._fieldRow);
    }
  }

  _textChanged() {
    this._historyTextSave = this._buffer;

    this._history.resetSearch();
  }

  async _getCursorPosition() {
    this._logger.info('console: _getCursorPosition');

    return new Promise((resolve, reject) => {
      if (!this._tty) {
        reject(new Error('_getCursorPosition called and not a TTY'));
        return;
      }

      const completion = {
        resolve,
        reject
      };

      this._cursorPromises.push(completion);

      if (this._cursorPromises.length === 1) {
        this._sendGetCursorPosition();
      }
    });
  }

  _sendGetCursorPosition() {
    this._logger.info('console: _sendGetCursorPosition');

    const compl = this._cursorPromises[0];

    if (!(compl != null)) {
      throw new Error("Invariant violation: \"compl != null\"");
    }

    if (!(this._outputANSI != null)) {
      throw new Error("Invariant violation: \"this._outputANSI != null\"");
    }

    this._outputANSI.queryCursorPosition();
  }

  _onCursorPosition(pos) {
    this._logger.info('console: _onCursorPosition');

    const compl = this._cursorPromises[0];

    if (compl != null) {
      compl.resolve(pos);

      this._finishCursorPosition();
    }
  }

  _finishCursorPosition() {
    this._logger.info('console: _finishCursorPosition');

    this._cursorPromises.shift();

    if (this._cursorPromises.length !== 0) {
      this._sendGetCursorPosition();

      return;
    }
  }

}

exports.default = LineEditor;