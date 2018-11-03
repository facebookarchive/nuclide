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

import EventEmitter from 'events';
import History from './History';
import blessed from 'blessed';

type LineEditorOptions = {
  input?: ?stream$Readable,
  output?: ?stream$Writable,
  tty?: ?boolean,
  maxHistoryItems?: number,
  removeHistoryDuplicates?: boolean,
  historySaveFile?: string,
};

const MAX_SCROLLBACK = 2000;

export default class LineEditor extends EventEmitter {
  _fullscreen: boolean = false;
  _options: LineEditorOptions;
  _program: blessed.Program;
  _screen: blessed.Screen;
  _outputBox: blessed.Box; // the box containing the scrollback
  _consoleBox: blessed.Box; // the box containing the being edited command line
  _statusBox: blessed.Box; // status line box
  _scrollback: Array<string>; // the entire scrollback
  _boxTop: number; // the top line of the output
  _boxBottom: boolean; // if the outupt is scrolled all the way to the bottom
  _nextOutputSameLine: boolean; // true if the next output should be on the same line (no ending \n)
  _more: boolean; // true if there's output the user hasn't seen

  _handlers: Map<string, () => void> = new Map();
  _closeError: ?string = null; // if we're closing on an error, what to print after console is back to normal
  _prompt: string;
  _buffer: string; // the string being edited
  _cursor: number; // the cursor position inside _buffer
  _history: History; // a list of previously entered commands
  _historyTextSave: string; // the string that was being edited before the user starting scrolling through history
  _logger: log4js$Logger; // the logger
  _tty: boolean;
  _input: stream$Readable;
  _output: stream$Writable;

  constructor(options: LineEditorOptions, logger: log4js$Logger) {
    super();
    this._logger = logger;
    this._tty = options.tty !== false;
    this._options = options;
    this._input = options.input || process.stdin;
    this._output = options.output || process.stdout;
    this._nextOutputSameLine = false;
  }

  isTTY(): boolean {
    return this._tty;
  }

  close(error: ?string) {
    this._closeError = error;
    this._history.save();
    this.emit('close');
  }

  setPrompt(prompt: string): void {
    this._prompt = prompt;
    if (this._tty && this._fullscreen) {
      this._redrawConsole();
    }
    return;
  }

  enterFullScreen(): void {
    if (this._fullscreen) {
      return;
    }

    this._fullscreen = true;

    if (this._tty) {
      this._initializeBlessed(this._options);
      return;
    }

    this._initializeTTY(this._options);
  }

  _initializeBlessed(options: LineEditorOptions): void {
    const maxHistoryItems =
      options.maxHistoryItems != null ? options.maxHistoryItems : 50;
    const removeDups =
      options.removeHistoryDuplicates != null
        ? options.removeHistoryDuplicates
        : true;

    this._history = new History(
      maxHistoryItems,
      removeDups,
      options.historySaveFile,
    );
    this._historyTextSave = '';

    this._program = blessed.program({});

    this._screen = blessed.screen({
      smartCSR: true,
      program: this._program,
      input: this._input,
      output: this._output,
    });

    this._program.showCursor();
    this._outputBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%-2',
      scrollable: true,
      style: {
        fg: 'white',
        bg: 'black',
      },
      wrap: false,
      valign: 'bottom',
    });

    this._consoleBox = blessed.box({
      top: '100%-2',
      left: 0,
      width: '100%',
      height: 1,
      content: '',
      style: {
        fg: 'green',
        bg: 'black',
      },
      tags: false,
    });

    this._statusBox = blessed.box({
      top: '100%-1',
      left: 0,
      width: '100%',
      height: 1,
      content: '',
      style: {
        fg: 'black',
        bg: 'gray',
      },
      align: 'right',
      tags: false,
    });

    this._screen.append(this._outputBox);
    this._screen.append(this._consoleBox);
    this._screen.append(this._statusBox);

    this._handlers = new Map([
      ['backspace', () => this._backspace()],
      ['delete', () => this._deleteRight(false)],
      ['down', () => this._historyNext()],
      ['end', () => this._end()],
      ['enter', () => this._enter()],
      ['home', () => this._home()],
      ['left', () => this._left()],
      ['pageup', () => this._pageUp()],
      ['pagedown', () => this._pageDown()],
      ['right', () => this._right()],
      ['space', () => this._inputChar(' ')],
      ['up', () => this._historyPrevious()],
      ['C-home', () => this._topOfOutput()],
      ['C-end', () => this._bottomOfOutput()],
      ['C-a', () => this._home()],
      ['C-c', () => this._sigint()],
      ['C-d', () => this._deleteRight(true)],
      ['C-e', () => this._end()],
      ['C-h', () => this._backspace()],
      ['C-k', () => this._deleteToEnd()],
      ['C-l', () => this._repaintScreen()],
      ['C-t', () => this._swapChars()],
      ['C-u', () => this._deleteLine()],
      ['C-w', () => this._deleteToStart()],
      ['\x7f', () => this._backspace()],
    ]);

    this._screen.on('keypress', (ch, key) => {
      // key.name is the base name of a key. For a character with shift/ctrl/etc.,
      // it's still just the character 'a', 'b', 'c', etc.
      // key.full is the name of the key with modifiers. e.g. ctrl-c is 'C-c',
      // shift-c is 'S-c'.
      // key.ctrl, key.shift, etc. are booleans for which modifier keys are down.
      //
      // We don't want to go to the handlers array for normal or shifted
      // characters, but we do want to for control keys.
      if ((key.name != null && key.name.length > 1) || key.ctrl === true) {
        const handler = this._handlers.get(key.full);
        if (handler != null) {
          handler();
        }
        return;
      }

      if (ch != null && ch >= ' ') {
        this._inputChar(ch);
        return;
      }
    });

    this._screen.on('resize', () => {
      this._repaintOutput();
      this._redrawConsole();
    });

    this._program.on('destroy', () => {
      if (this._closeError != null) {
        process.stderr.write(this._closeError);
      }
    });

    this._buffer = '';
    this.setPrompt('$ ');
    this._cursor = 0;
    this._scrollback = [];
    this._boxTop = 0;
    this._boxBottom = true;
    this._screen.render();
  }

  _initializeTTY(options: LineEditorOptions): void {
    this._input.on('data', data => this._onRawData(data));
    this._input.on('end', _ => this.close());
  }

  _redrawConsole(): void {
    // NB - 5 here gives a little context on the right of the cursor when
    // the user is near the right edge of the screen.
    const available = this._consoleBox.width - this._prompt.length - 5;
    const left = Math.max(0, this._cursor - available);

    const text = this._prompt + this._buffer.substr(left);

    this._consoleBox.setContent(text);
    this._screen.render();
    this._program.move(
      this._prompt.length + this._cursor - left,
      this._consoleBox.top,
    );
  }

  _inputChar(ch: string): void {
    this._logger.info(`Input character ${ch}`);
    this._buffer =
      this._buffer.substr(0, this._cursor) +
      ch +
      this._buffer.substr(this._cursor);
    this._logger.info(`Buffer is now ${this._buffer}`);
    this._cursor++;
    this._textChanged();
    this._redrawConsole();
  }

  _sigint(): void {
    this.emit('SIGINT');
  }

  _enter(): void {
    this.write(`${this._prompt}${this._buffer}\n`);
    this._history.addItem(this._buffer);
    this.emit('line', this._buffer);
    this._buffer = '';
    this._cursor = 0;
    this._textChanged();
    this._redrawConsole();
  }

  _left(): void {
    if (this._cursor > 0) {
      this._cursor--;
      this._redrawConsole();
    }
  }

  _right(): void {
    if (this._cursor < this._buffer.length) {
      this._cursor++;
      this._redrawConsole();
    }
  }

  _home(): void {
    this._cursor = 0;
    this._redrawConsole();
  }

  _end(): void {
    this._cursor = this._buffer === '' ? 0 : this._buffer.length;
    this._redrawConsole();
  }

  _deleteToEnd(): void {
    if (this._cursor < this._buffer.length) {
      this._buffer = this._buffer.substr(0, this._cursor);
      this._textChanged();
      this._redrawConsole();
    }
  }

  _deleteToStart(): void {
    if (this._cursor > 0) {
      this._buffer = this._buffer.substr(this._cursor);
      this._cursor = 0;
      this._textChanged();
      this._redrawConsole();
    }
  }

  _deleteLine(): void {
    if (this._buffer !== '') {
      this._buffer = '';
      this._cursor = 0;
      this._textChanged();
      this._redrawConsole();
    }
  }

  _backspace(): void {
    if (this._cursor > 0) {
      this._buffer =
        this._buffer.substr(0, this._cursor - 1) +
        this._buffer.substr(this._cursor);
      this._cursor--;
      this._textChanged();
      this._redrawConsole();
    }
  }

  _deleteRight(eofOnEmpty: boolean): void {
    if (this._buffer === '' && eofOnEmpty) {
      this.close();
      return;
    }

    if (this._cursor < this._buffer.length) {
      this._buffer =
        this._buffer.substr(0, this._cursor) +
        this._buffer.substr(this._cursor + 1);
      this._textChanged();
      this._redrawConsole();
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
    this._redrawConsole();
  }

  _pageUp() {
    this._boxTop = Math.max(0, this._boxTop - this._outputBox.height + 1);
    this._updateScrollFlags();
    this._repaintOutput();
  }

  _pageDown() {
    this._boxTop = Math.min(
      this._scrollback.length - this._outputBox.height,
      this._boxTop + this._outputBox.height - 1,
    );
    this._updateScrollFlags();
    this._repaintOutput();
  }

  _repaintScreen() {
    this._screen.realloc();
    this._repaintOutput();
    this._repaintStatus();
    this._redrawConsole();
  }

  _topOfOutput() {
    this._boxTop = 0;
    this._updateScrollFlags();
    this._repaintOutput();
  }

  _bottomOfOutput() {
    this._boxTop = Math.max(
      0,
      this._scrollback.length - this._outputBox.height,
    );
    this._updateScrollFlags();
    this._repaintOutput();
  }

  _updateScrollFlags(): void {
    this._boxBottom =
      this._scrollback.length - this._boxTop <= this._outputBox.height;
    if (this._boxBottom) {
      this._more = false;
    }
  }

  write(s: string): void {
    this._logger.info(`output [${s}]\n`);
    if (!this._tty || !this._fullscreen) {
      this._output.write(s);
      return;
    }

    const trailingNewline = s.endsWith('\n');
    const lines = s.split('\n');

    if (trailingNewline) {
      lines.splice(-1);
    }

    if (lines.length === 0) {
      return;
    }

    if (this._nextOutputSameLine && this._scrollback.length !== 0) {
      this._scrollback[this._scrollback.length - 1] += lines[0];
      lines.shift();
    }

    this._scrollback = this._scrollback.concat(lines).slice(-MAX_SCROLLBACK);
    this._nextOutputSameLine = !trailingNewline;

    if (!this._boxBottom) {
      this._more = true;
    }
    this._repaintOutput();
  }

  async prompt(): Promise<void> {
    if (!this._tty) {
      this._output.write(this._prompt);
    }
  }

  _historyPrevious(): void {
    const item = this._history.previousItem();
    if (item != null) {
      this._buffer = item;
      this._cursor = item.length;
      this._redrawConsole();
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
    this._redrawConsole();
  }

  _textChanged(): void {
    this._historyTextSave = this._buffer;
    this._history.resetSearch();
  }

  _repaintOutput(): void {
    // if we're pinned to the bottom, recompute the top
    if (this._boxBottom) {
      this._boxTop = Math.max(
        0,
        this._scrollback.length - this._outputBox.height,
      );
    }

    this._outputBox.setContent(
      this._scrollback
        .slice(this._boxTop, this._boxTop + this._outputBox.height)
        .join('\n'),
    );

    this._repaintStatus();
    this._screen.render();
  }

  _repaintStatus(): void {
    const statusEmpty = '       ';
    const statusBottom = 'BOTTOM ';
    const statusMore = 'MORE...';

    const lpad = (str: string, width: number) =>
      (str + ' '.repeat(width)).substr(0, width);

    const lastLine = Math.min(
      this._boxTop + this._outputBox.height,
      this._scrollback.length,
    );
    const scroll = `Lines ${this._boxTop + 1}-${lastLine} of ${
      this._scrollback.length
    }`;

    const where = this._more
      ? statusMore
      : this._boxBottom
        ? statusBottom
        : statusEmpty;

    this._statusBox.setContent(`| ${lpad(scroll, 30)} | ${where}`);
    this._screen.render();
  }

  // non-tty support
  _onRawData(data: Buffer): void {
    data
      .toString('utf8')
      .trim()
      .split('\n')
      .forEach(line => this.emit('line', line));
  }
}
