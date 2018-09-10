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

import type {CursorControl} from './types';
import type {
  EscapeSequence,
  Result as ParsedEscapeSequenceTextType,
} from './ANSIEscapeSequenceParser';

import type {
  ParsedANSICursorPosition,
  ParsedANSISpecialKey,
} from './ANSIInputStreamParser';
import {ANSIInputStreamParser} from './ANSIInputStreamParser';
import {ANSIStreamOutput} from './ANSIStreamOutput';
import EventEmitter from 'events';
import GatedCursorControl from './GatedCursorControl';
import History from './History';
import invariant from 'assert';
import parseEscapeSequences from './ANSIEscapeSequenceParser';

type CursorCompletion = {
  timeout: ?TimeoutID,
  resolve: ParsedANSICursorPosition => void,
};

type LineEditorOptions = {
  input?: ?stream$Readable,
  output?: ?stream$Writable,
  tty?: ?boolean,
  maxHistoryItems?: number,
  removeHistoryDuplicates?: boolean,
};

function onlyKeepSGR(seq: EscapeSequence): boolean {
  // m is the terminator for Set Graphics Rendition
  return seq.final === 'm';
}

export default class LineEditor extends EventEmitter {
  _parser: ANSIInputStreamParser;
  _buffer: string = '';
  _parsedPrompt: ParsedEscapeSequenceTextType;
  _input: stream$Readable;
  _output: stream$Writable;
  _lastOutputColumn: number;
  _outputANSI: ?ANSIStreamOutput;
  _gatedOutputANSI: ?GatedCursorControl;
  _tty: boolean;
  _cursorPromises: Set<CursorCompletion>;
  _screenRows: number = 0;
  _screenColumns: number = 0;
  _fieldRow: ?number;
  _keyHandlers: Map<string, () => void>;
  _history: History;
  _historyTextSave: string;
  _editedSinceHistory: boolean;
  _onData: ?(string) => void;
  _onClose: ?(string) => void;
  _borrowed: boolean;
  _writing: boolean;
  _writeQueue: ?string;
  _firstOut: boolean; // true if write is first one since entered command
  _closePending: boolean;
  _logger: log4js$Logger;

  // NB cursor is always an index into _buffer (or one past the end)
  // even if the line is scrolled to the right. _repaint is responsible
  // for making sure the physical cursor is positioned correctly
  _cursor: number = 0;
  _leftEdge: number = 0;

  constructor(options: LineEditorOptions, logger: log4js$Logger) {
    super();
    this._logger = logger;
    this._parser = new ANSIInputStreamParser();
    this._input = options.input != null ? options.input : process.stdin;
    this._output = options.output != null ? options.output : process.stdout;
    // $FlowFixMe isTTY exists
    this._tty = options.tty != null ? options.tty : this._input.isTTY;
    this._cursorPromises = new Set();

    const maxHistoryItems =
      options.maxHistoryItems != null ? options.maxHistoryItems : 50;
    const removeDups =
      options.removeHistoryDuplicates != null
        ? options.removeHistoryDuplicates
        : true;

    this._history = new History(maxHistoryItems, removeDups);
    this._historyTextSave = '';
    this._editedSinceHistory = false;

    if (this._tty) {
      // We don't want this going through this.write because that will strip
      // out the sequences this generates.
      this._outputANSI = new ANSIStreamOutput(s => {
        this._output.write(s);
        return;
      });
      this._gatedOutputANSI = new GatedCursorControl(this._outputANSI);
    }

    this._output.write('\n');
    this._installHooks();
    this._onResize();
    this.setPrompt('$ ');
    this._firstOut = true;

    this._borrowed = false;
    this._lastOutputColumn = 1;

    this._keyHandlers = new Map([
      ['CTRL-A', () => this._home()],
      ['CTRL-B', () => this._left()],
      ['CTRL-C', () => this._sigint()],
      ['CTRL-D', () => this._deleteRight(true)],
      ['CTRL-E', () => this._end()],
      ['CTRL-F', () => this._right()],
      ['CTRL-K', () => this._deleteToEnd()],
      ['CTRL-N', () => this._historyNext()],
      ['CTRL-P', () => this._historyPrevious()],
      ['CTRL-T', () => this._swapChars()],
      ['CTRL-U', () => this._deleteLine()],
      ['CTRL-W', () => this._deleteToStart()],
      ['HOME', () => this._home()],
      ['END', () => this._end()],
      ['LEFT', () => this._left()],
      ['RIGHT', () => this._right()],
      ['DOWN', () => this._historyNext()],
      ['UP', () => this._historyPrevious()],
      ['BACKSPACE', () => this._backspace()],
      ['ENTER', () => this._enter()],
      ['DEL', () => this._deleteRight(false)],
      ['ESCAPE', () => this._deleteLine()],
    ]);
  }

  close() {
    this._closePending = true;
    if (this._cursorPromises.size !== 0) {
      // we don't want to quit with cursor promises pending, because the TTY
      // driver will still send the response after the app exits, resulting
      // in garbage at the shell prompt
      return;
    }
    this._close();
  }

  _close() {
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

  isTTY(): boolean {
    return this._tty;
  }

  setPrompt(prompt: string): void {
    this._parsedPrompt = parseEscapeSequences(prompt, onlyKeepSGR);
  }

  // NOTE that writing is an async process because we have to wait for
  // transactions with the terminal (e.g. getting the cursor position)
  // We don't want the client to have to wait, so queue writes and manage
  // the async all internally.
  //
  // write() manages writing text to the screen from the application without
  // bothering the prompt, even text which contains (and not always ending in)
  // newlines.
  write(s: string): void {
    if (this._writeQueue == null) {
      this._writeQueue = '';
    }
    this._writeQueue += s;

    if (!this._writing) {
      this._processWriteQueue();
    }
  }

  async _processWriteQueue(): Promise<void> {
    this._writing = true;
    while (this._writeQueue != null) {
      const s = this._writeQueue;
      this._writeQueue = null;
      // await in loop is intentional here - while we're waiting, other
      // stuff to write could come in.
      // eslint-disable-next-line no-await-in-loop
      await this._write(s);
    }
    this._writing = false;
  }

  async _write(s: string): Promise<void> {
    if (this._tty && !this._borrowed) {
      // here we output the string (which may not have a newline terminator)
      // while maintaining the integrity of the prompt
      const cursor = this._outputANSI;
      invariant(cursor != null);

      // clear out prompt
      const here = await this._getCursorPosition();
      cursor.gotoXY(1, here.row);
      cursor.clearEOL();
      this._fieldRow = here.row;

      let col = this._lastOutputColumn;
      let row = here.row;

      // if this is the first write after the user hit 'enter' on a command,
      // we don't want to back up a line - this would put us over the prompt
      // rather than the clear line after it.
      if (!this._firstOut) {
        row--;
      }
      this._firstOut = false;
      cursor.gotoXY(col, row);

      const outputPiece = (line: string): void => {
        const tabbed = line.split('\t');
        for (let i = 0; i < tabbed.length; i++) {
          // strip out any escape or control sequences other than SGR, which is
          // used for setting colors and other text attributes
          const parsed = parseEscapeSequences(tabbed[i], onlyKeepSGR);

          this._output.write(parsed.filteredText);

          // update the cursor position. the fact that screen cell indices are
          // 1-based makes the mod math a bit weird. Convert col to be zero-based first.
          col--;
          col += parsed.displayLength;
          row += Math.trunc(col / this._screenColumns);
          col %= this._screenColumns;

          if (i < tabbed.length - 1) {
            const target = col + 7 - (col % 8);
            this._output.write(' '.repeat(target - col));
            col = target;
          }
          col++;
        }
      };

      // NB we are assuming no control characters other than \r and \n here
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
  }

  // borrowTTY and returnTTY allow the user of console to take over complete
  // control of the TTY; for example, to implement paging of large amounts of
  // data.
  borrowTTY(): ?CursorControl {
    if (this._borrowed || !this._tty) {
      return null;
    }

    const cursorControl = this._gatedOutputANSI;
    invariant(cursorControl != null);

    this._borrowed = true;
    cursorControl.setEnabled(true);
    return cursorControl;
  }

  returnTTY(): boolean {
    if (!this._borrowed || !this._tty) {
      return false;
    }

    const cursorControl = this._gatedOutputANSI;
    invariant(cursorControl != null);

    this._borrowed = false;
    cursorControl.setEnabled(false);

    this.write(`\n${this._parsedPrompt.filteredText}`);
    this._repaint();
    return true;
  }

  async prompt(): Promise<void> {
    this._output.write(`\r${this._parsedPrompt.filteredText}`);
    if (this._tty) {
      const cursorPos = await this._getCursorPosition();
      this._fieldRow = cursorPos.row;
      this._repaint();
    }
  }

  _onText(s: string): void {
    if (this._borrowed) {
      for (const ch of s.toUpperCase()) {
        this.emit('key', ch);
      }
      return;
    }

    if (this._tty) {
      this._buffer =
        this._buffer.substr(0, this._cursor) +
        s +
        this._buffer.substr(this._cursor);
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

  _onKey(key: ParsedANSISpecialKey): void {
    const name: string = key.ctrl ? `CTRL-${key.key}` : key.key;

    if (this._borrowed) {
      this.emit('key', name);
      return;
    }

    const handler: ?() => ?void = this._keyHandlers.get(name);
    if (handler != null) {
      handler();
    }
  }

  _sigint(): void {
    this.emit('SIGINT');
  }

  _textChanged(): void {
    this._historyTextSave = this._buffer;
    this._history.resetSearch();
  }

  _home(): void {
    this._cursor = 0;
    this._repaint();
  }

  _end(): void {
    this._cursor = this._buffer === '' ? 0 : this._buffer.length;
    this._repaint();
  }

  _left(): void {
    if (this._cursor > 0) {
      this._cursor--;
      this._repaint();
    }
  }

  _right(): void {
    if (this._cursor < this._buffer.length) {
      this._cursor++;
      this._repaint();
    }
  }

  _deleteToEnd(): void {
    if (this._cursor < this._buffer.length) {
      this._buffer = this._buffer.substr(0, this._cursor);
      this._textChanged();
      this._repaint();
    }
  }

  _deleteToStart(): void {
    if (this._cursor > 0) {
      this._buffer = this._buffer.substr(this._cursor);
      this._cursor = 0;
      this._textChanged();
      this._repaint();
    }
  }

  _deleteLine(): void {
    if (this._buffer !== '') {
      this._buffer = '';
      this._cursor = 0;
      this._textChanged();
      this._repaint();
    }
  }

  _backspace(): void {
    if (this._cursor > 0) {
      this._buffer =
        this._buffer.substr(0, this._cursor - 1) +
        this._buffer.substr(this._cursor);
      this._cursor--;
      this._textChanged();
      this._repaint();
    }
  }

  _deleteRight(eofOnEmpty: boolean): void {
    if (this._buffer === '' && eofOnEmpty) {
      this._output.write('\r\n');
      this.close();
      return;
    }

    if (this._cursor < this._buffer.length) {
      this._buffer =
        this._buffer.substr(0, this._cursor) +
        this._buffer.substr(this._cursor + 1);
      this._textChanged();
      this._repaint();
    }
  }

  _swapChars(): void {
    if (this._cursor === 0 || this._buffer.length < 2) {
      return;
    }

    if (this._cursor === this._buffer.length) {
      this._cursor--;
    }

    this._buffer =
      this._buffer.substr(0, this._cursor - 1) +
      this._buffer.substr(this._cursor, 1) +
      this._buffer.substr(this._cursor - 1, 1) +
      this._buffer.substr(this._cursor + 1);

    this._cursor++;
    this._textChanged();
    this._repaint();
  }

  _enter(): void {
    this._output.write('\r\n');
    this._history.addItem(this._buffer);
    this.emit('line', this._buffer);
    this._buffer = '';
    this._cursor = 0;
    this._firstOut = true;
    this._textChanged();
  }

  _historyPrevious(): void {
    const item = this._history.previousItem();
    if (item != null) {
      this._buffer = item;
      this._cursor = item.length;
      this._repaint();
    }
  }

  _historyNext(): void {
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

  _repaint(): void {
    invariant(this._tty);
    const output = this._output;
    const outputANSI = this._outputANSI;
    invariant(output != null && outputANSI != null);

    const fieldStartCol = 1 + this._parsedPrompt.displayLength;

    if (this._fieldRow != null) {
      outputANSI.gotoXY(fieldStartCol, this._fieldRow);
      outputANSI.clearEOL();
    }

    let hwcursor: number = fieldStartCol + this._cursor - this._leftEdge;
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

  async _getCursorPosition(): Promise<ParsedANSICursorPosition> {
    this._logger.info('console: _getCursorPosition');
    return new Promise((resolve, reject) => {
      if (!this._tty) {
        reject(new Error('_getCursorPosition called and not a TTY'));
        return;
      }

      if (this._closePending) {
        reject(new Error('requesting cursor position while closing the app'));
        return;
      }

      const completion: CursorCompletion = {
        timeout: null,
        resolve,
      };

      const tmo = setTimeout(() => {
        reject(new Error('timeout before cursor position returned'));
        this._cursorPromises.delete(completion);
      }, 2000);

      completion.timeout = tmo;
      this._cursorPromises.add(completion);

      invariant(this._outputANSI != null);
      this._outputANSI.queryCursorPosition();
    });
  }

  _onCursorPosition(pos: ParsedANSICursorPosition): void {
    for (const completion of this._cursorPromises) {
      invariant(completion.timeout != null);
      clearTimeout(completion.timeout);
      completion.resolve(pos);
    }
    this._cursorPromises.clear();
    if (this._closePending) {
      this._close();
    }
  }

  _onResize() {
    if (this._tty) {
      const output = this._output;
      invariant(output != null);
      // $FlowFixMe rows and columns exists if the stream is a TTY
      this._screenRows = output.rows;
      // $FlowFixMe rows and columns exists if the stream is a TTY
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
      this._parser = new ANSIInputStreamParser();
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
