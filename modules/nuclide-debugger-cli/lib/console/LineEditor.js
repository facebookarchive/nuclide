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

import type {
  ParsedANSICursorPosition,
  ParsedANSISpecialKey,
} from './ANSIStreamParser';
import {ANSIStreamParser} from './ANSIStreamParser';
import {ANSIStreamOutput} from './ANSIStreamOutput';
import EventEmitter from 'events';
import invariant from 'assert';

type CursorCompletion = {
  timeout: ?TimeoutID,
  resolve: ParsedANSICursorPosition => void,
};

type LineEditorOptions = {
  input?: ?stream$Readable,
  output?: ?stream$Writable,
  tty?: ?boolean,
};

export default class LineEditor extends EventEmitter {
  _parser: ANSIStreamParser;
  _buffer: string = '';
  _prompt: string = '$ ';
  _input: stream$Readable;
  _output: stream$Writable;
  _outputANSI: ?ANSIStreamOutput;
  _tty: boolean;
  _cursorPromises: Set<CursorCompletion>;
  _screenRows: number = 0;
  _screenColumns: number = 0;
  _fieldRow: number = 0;
  _fieldStartCol: number = 0;
  _keyHandlers: Map<string, () => void>;

  // NB cursor is always an index into _buffer (or one past the end)
  // even if the line is scrolled to the right. _repaint is responsible
  // for making sure the physical cursor is positioned correctly
  _cursor: number = 0;
  _leftEdge: number = 0;

  constructor(options: LineEditorOptions) {
    super();
    this._parser = new ANSIStreamParser();
    this._input = options.input != null ? options.input : process.stdin;
    this._output = options.output != null ? options.output : process.stdout;
    // $FlowFixMe isTTY exists
    this._tty = options.tty != null ? options.tty : this._input.isTTY;
    this._cursorPromises = new Set();

    if (this._tty) {
      this._outputANSI = new ANSIStreamOutput(this._output);
    }

    this._installHooks();
    this._onResize();

    this._keyHandlers = new Map([
      ['CTRL-A', () => this._home()],
      ['CTRL-B', () => this._left()],
      ['CTRL-C', () => this._sigint()],
      ['CTRL-D', () => this._deleteRight(true)],
      ['CTRL-E', () => this._end()],
      ['CTRL-F', () => this._right()],
      ['CTRL-K', () => this._deleteToEnd()],
      ['CTRL-T', () => this._swapChars()],
      ['CTRL-U', () => this._deleteLine()],
      ['CTRL-W', () => this._deleteToStart()],
      ['HOME', () => this._home()],
      ['END', () => this._end()],
      ['LEFT', () => this._left()],
      ['RIGHT', () => this._right()],
      ['BACKSPACE', () => this._backspace()],
      ['ENTER', () => this._enter()],
      ['DEL', () => this._deleteRight(false)],
    ]);
  }

  dispose() {}

  setPrompt(prompt: string): void {
    this._prompt = prompt;
  }

  async prompt(): Promise<void> {
    if (this._tty) {
      process.stdout.write('\n\r');
      process.stdout.write(this._prompt);
      const cursorPos = await this._getCursorPosition();
      this._fieldRow = cursorPos.row;
      this._fieldStartCol = cursorPos.column;
      this._cursor = 0;
      this._leftEdge = 0;
    }
  }

  _onText(s: string): void {
    this._buffer =
      this._buffer.substr(0, this._cursor) +
      s +
      this._buffer.substr(this._cursor);
    this._cursor += s.length;
    this._repaint();
  }

  _onKey(key: ParsedANSISpecialKey): void {
    const name: string = key.ctrl ? `CTRL-${key.key}` : key.key;
    const handler: ?() => ?void = this._keyHandlers.get(name);
    if (handler != null) {
      handler();
    }
  }

  _sigint(): void {
    process.kill(process.pid, 'SIGINT');
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
      this._repaint();
    }
  }

  _deleteToStart(): void {
    if (this._cursor > 0) {
      this._buffer = this._buffer.substr(this._cursor);
      this._cursor = 0;
      this._repaint();
    }
  }

  _deleteLine(): void {
    if (this._buffer !== '') {
      this._buffer = '';
      this._cursor = 0;
      this._repaint();
    }
  }

  _backspace(): void {
    if (this._cursor > 0) {
      this._buffer =
        this._buffer.substr(0, this._cursor - 1) +
        this._buffer.substr(this._cursor);
      this._cursor--;
      this._repaint();
    }
  }

  _deleteRight(eofOnEmpty: boolean): void {
    if (this._buffer === '' && eofOnEmpty) {
      this.emit('quit');
      return;
    }

    if (this._cursor < this._buffer.length) {
      this._buffer =
        this._buffer.substr(0, this._cursor) +
        this._buffer.substr(this._cursor + 1);
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
    this._repaint();
  }

  _enter(): void {
    this.emit('line', this._buffer);
    this._buffer = '';
    this.prompt();
  }

  _repaint(): void {
    invariant(this._tty);
    const output = this._output;
    const outputANSI = this._outputANSI;
    invariant(output != null && outputANSI != null);

    outputANSI.gotoXY(this._fieldStartCol, this._fieldRow);
    outputANSI.clearEOL();

    let hwcursor: number = this._fieldStartCol + this._cursor - this._leftEdge;
    if (hwcursor < this._fieldStartCol) {
      this._leftEdge -= this._fieldStartCol - hwcursor;
    } else if (hwcursor >= this._screenColumns) {
      this._leftEdge += hwcursor - this._screenColumns + 1;
    }
    hwcursor = this._fieldStartCol + this._cursor - this._leftEdge;

    const textColumns = this._screenColumns - this._fieldStartCol;
    output.write(this._buffer.substr(this._leftEdge, textColumns));
    outputANSI.gotoXY(hwcursor, this._fieldRow);
  }

  async _getCursorPosition(): Promise<ParsedANSICursorPosition> {
    return new Promise((resolve, reject) => {
      if (!this._tty) {
        reject(new Error('_getCursorPosition called and not a TTY'));
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
      completion.resolve(pos);
    }
    this._cursorPromises.clear();
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
    if (this._tty) {
      // $FlowFixMe has this call
      this._input.setRawMode(true);
      this._input.setEncoding('utf8');
      this._parser = new ANSIStreamParser();
      this._input.on('data', t => {
        this._parser.next(t);
      });
      this._parser.on('text', s => this._onText(s));
      this._parser.on('key', k => this._onKey(k));
      this._parser.on('cursor', c => this._onCursorPosition(c));

      process.on('SIGWINCH', () => this._onResize());

      return;
    }

    this._input.on('data', t => this._onText(t));
  }
}
