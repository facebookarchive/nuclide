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

type LineEditorOptions = {
  input?: ?stream$Readable,
  output?: ?stream$Writable,
  tty?: ?boolean,
  maxHistoryItems?: number,
  removeHistoryDuplicates?: boolean,
};

type CursorCompletion = {
  resolve: ParsedANSICursorPosition => void,
  reject: Error => void,
};

// The purpose of having a serialized, event based architecture here is to avoid
// a ton of race conditions because asking for the cursor position is asynchronous.
//
type EditorEventType =
  | 'SETPROMPT'
  | 'WRITE'
  | 'WRITEESC'
  | 'BORROWTTY'
  | 'RETURNTTY'
  | 'PROMPT'
  | 'INPUTTEXT'
  | 'KEY'
  | 'RESIZE'
  | 'CLOSE';

type EditorBaseEvent = {
  seq: number,
};

type EditorSetPromptEvent = EditorBaseEvent & {
  type: 'SETPROMPT',
  prompt: string,
};

type EditorWriteEvent = EditorBaseEvent & {
  type: 'WRITE',
  data: string,
};

type EditorWriteEscEvent = EditorBaseEvent & {
  type: 'WRITEESC',
  data: string,
};

type EditorBorrowTTYEvent = EditorBaseEvent & {
  type: 'BORROWTTY',
  resolve: CursorControl => void,
  reject: Error => void,
};

type EditorReturnTTYEvent = EditorBaseEvent & {
  type: 'RETURNTTY',
};

type EditorPromptEvent = EditorBaseEvent & {
  type: 'PROMPT',
  resolve: void => void,
};

type EditorInputTextEvent = EditorBaseEvent & {
  type: 'INPUTTEXT',
  data: string,
};

type EditorKeyEvent = EditorBaseEvent & {
  type: 'KEY',
  key: ParsedANSISpecialKey,
};

type EditorResizeEvent = EditorBaseEvent & {
  type: 'RESIZE',
};

type EditorCloseEvent = EditorBaseEvent & {
  type: 'CLOSE',
};

type EditorEvent =
  | EditorSetPromptEvent
  | EditorWriteEvent
  | EditorWriteEscEvent
  | EditorBorrowTTYEvent
  | EditorReturnTTYEvent
  | EditorPromptEvent
  | EditorInputTextEvent
  | EditorKeyEvent
  | EditorResizeEvent
  | EditorCloseEvent;

function onlyKeepSGR(seq: EscapeSequence): boolean {
  // m is the terminator for Set Graphics Rendition
  return seq.final === 'm';
}

export default class LineEditor extends EventEmitter {
  // handlers for line editor events
  _eventHandlers: Map<EditorEventType, (EditorEvent) => Promise<void>>;
  // handlers for keys the user can hit during editing
  _keyHandlers: Map<string, () => void>;

  // i/o state
  _tty: boolean; // true if we're writing to a real terminal and not redirected
  _input: stream$Readable; // the input stream, usually stdin
  _output: stream$Writable; // the output stream usually stdout
  _parser: ANSIInputStreamParser; // filter which looks for escape sequences in input
  _onClose: ?(string) => void; // callback for input stream closure
  _onData: ?(string) => void; // callback for input data
  _borrowed: boolean; // if true, then the app is doing full screen i/o
  _lastOutputColumn: number; // the last column app output ended at
  _screenRows: number; // the number of rows on the screen (terminal window)
  _screenColumns: number; // the number of columns on the screen
  _atPrompt: boolean; // true if the prompt is being shown

  // these objects convert calls like gotoxy() to an ANSI/xterm escape sequence
  _outputANSI: ?ANSIStreamOutput; // escape sequence formatter, writes immediately
  _queuedOutputANSI: ?ANSIStreamOutput; // escape sequence formatter, queues writes into event queue
  _gatedOutputANSI: ?GatedCursorControl; // gated, queued escape sequence formatter

  // editor state
  _buffer: string; // the string being edited
  _parsedPrompt: ParsedEscapeSequenceTextType; // the prompt, with everything but text attributes removed
  _fieldRow: number; // the screen row containing the prompt
  _leftEdge: number; // how far into _buffer we're scrolled for display
  _cursor: number; // the cursor position inside _buffer
  _history: History; // a list of previously entered commands
  _historyTextSave: string; // the string that was being edited before the user starting scrolling through history

  // event state
  _eventQueue: Array<EditorEvent> = []; // events awaiting execution
  _nextEvent: number; // for numbering events for logging

  // cursor position
  _cursorPromises: Array<CursorCompletion> = []; // pending cursor position queries

  // utility state
  _logger: log4js$Logger; // the logger
  _done: boolean = false; // flag to kill the queue if we're shutting down

  constructor(options: LineEditorOptions, logger: log4js$Logger) {
    super();
    this._eventHandlers = new Map([
      [
        'SETPROMPT',
        ev => {
          invariant(ev.type === 'SETPROMPT');
          return this._handleSetPrompt(ev.prompt);
        },
      ],
      [
        'WRITE',
        ev => {
          invariant(ev.type === 'WRITE');
          return this._handleWrite(ev.data);
        },
      ],
      [
        'WRITEESC',
        ev => {
          invariant(ev.type === 'WRITEESC');
          return this._handleWriteEsc(ev.data);
        },
      ],
      [
        'BORROWTTY',
        ev => {
          invariant(ev.type === 'BORROWTTY');
          return this._handleBorrowTTY(ev.resolve, ev.reject);
        },
      ],
      ['RETURNTTY', ev => this._handleReturnTTY()],
      [
        'PROMPT',
        ev => {
          invariant(ev.type === 'PROMPT');
          return this._handlePrompt(ev.resolve);
        },
      ],
      [
        'INPUTTEXT',
        ev => {
          invariant(ev.type === 'INPUTTEXT');
          return this._handleInputText(ev.data);
        },
      ],
      [
        'KEY',
        ev => {
          invariant(ev.type === 'KEY');
          return this._handleKey(ev.key);
        },
      ],
      ['RESIZE', ev => this._handleResize()],
      ['CLOSE', ev => this._handleClose()],
    ]);

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

    this._buffer = '';
    this._cursor = 0;
    this._leftEdge = 0;

    this._logger = logger;
    this._parser = new ANSIInputStreamParser();
    this._input = options.input != null ? options.input : process.stdin;
    this._output = options.output != null ? options.output : process.stdout;
    // $FlowFixMe isTTY exists
    this._tty = options.tty != null ? options.tty : this._input.isTTY;

    this._cursorPromises = [];

    const maxHistoryItems =
      options.maxHistoryItems != null ? options.maxHistoryItems : 50;
    const removeDups =
      options.removeHistoryDuplicates != null
        ? options.removeHistoryDuplicates
        : true;

    this._history = new History(maxHistoryItems, removeDups);
    this._historyTextSave = '';

    if (this._tty) {
      // We don't want this going through this.write because that will strip
      // out the sequences this generates.
      this._outputANSI = new ANSIStreamOutput(s => {
        this._output.write(s);
      });
      // This is for queuing an escape sequence when the TTY is borrowed and
      // cursor motion commands must be properly interleaved with text
      this._queuedOutputANSI = new ANSIStreamOutput(s => {
        this._queueEvent({seq: this._nextEvent++, type: 'WRITEESC', data: s});
      });
      this._gatedOutputANSI = new GatedCursorControl(this._queuedOutputANSI);
    }

    this._output.write('\n');
    this._installHooks();
    this._handleResize();
    this.setPrompt('$ ');

    this._borrowed = false;
    this._lastOutputColumn = 1;
    this._atPrompt = false;
  }

  isTTY(): boolean {
    return this._tty;
  }

  close() {
    this._queueEvent({seq: this._nextEvent++, type: 'CLOSE'});
  }

  setPrompt(prompt: string): void {
    this._queueEvent({
      seq: this._nextEvent++,
      type: 'SETPROMPT',
      prompt,
    });
  }

  write(s: string): void {
    this._queueEvent({
      seq: this._nextEvent++,
      type: 'WRITE',
      data: s,
    });
  }

  async borrowTTY(): Promise<CursorControl> {
    return new Promise((resolve, reject) => {
      this._queueEvent({
        seq: this._nextEvent++,
        type: 'BORROWTTY',
        resolve,
        reject,
      });
    });
  }

  returnTTY(): void {
    this._queueEvent({seq: this._nextEvent++, type: 'RETURNTTY'});
  }

  async prompt(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._queueEvent({
        seq: this._nextEvent++,
        type: 'PROMPT',
        resolve,
      });
    });
  }

  _queueEvent(event: EditorEvent): void {
    this._eventQueue.push(event);
    if (this._eventQueue.length === 1) {
      this._processQueue();
    }
  }

  async _processQueue(): Promise<void> {
    while (this._eventQueue.length > 0 && !this._done) {
      const event: EditorEvent = this._eventQueue[0];
      this._logger.info(`console event: ${JSON.stringify(event)}`);
      const handler = this._eventHandlers.get(event.type);
      invariant(handler != null);
      // intentional serializing of events here
      // eslint-disable-next-line no-await-in-loop
      await handler(event);
      this._logger.info(`console event done: ${JSON.stringify(event)}`);
      this._eventQueue.shift();
    }
  }

  async _handleSetPrompt(prompt: string): Promise<void> {
    this._parsedPrompt = parseEscapeSequences(prompt, onlyKeepSGR);
  }

  async _handleWrite(data: string): Promise<void> {
    const outputANSI = this._outputANSI;
    invariant(outputANSI != null);

    if (this._tty && !this._borrowed) {
      let col = this._lastOutputColumn;

      if (this._atPrompt) {
        outputANSI.gotoXY(1, this._fieldRow);
        outputANSI.clearEOL();
        if (col !== 1) {
          outputANSI.gotoXY(col, this._fieldRow - 1);
        }
      }

      // here we output the string (which may not have a newline terminator)
      // while maintaining the integrity of the prompt

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

  async _handleWriteEsc(data: string): Promise<void> {
    if (this._tty) {
      this._output.write(data);
    }
  }

  async _handleBorrowTTY(
    resolve: CursorControl => void,
    reject: Error => void,
  ): Promise<void> {
    if (this._borrowed) {
      reject(new Error('TTY is already borrowed'));
    }

    if (!this._tty) {
      reject(new Error('Cannot borrow console if not a TTY'));
    }

    const cursorControl = this._gatedOutputANSI;
    invariant(cursorControl != null);

    this._borrowed = true;
    cursorControl.setEnabled(true);
    resolve(cursorControl);
  }

  async _handleReturnTTY(): Promise<void> {
    if (!this._borrowed) {
      return;
    }

    const cursorControl = this._gatedOutputANSI;
    invariant(cursorControl != null);

    this._borrowed = false;
    cursorControl.setEnabled(false);

    this.prompt();
  }

  async _handlePrompt(resolve: void => void): Promise<void> {
    this._output.write(`\r${this._parsedPrompt.filteredText}`);
    if (this._tty) {
      const cursorPos = await this._getCursorPosition();
      this._fieldRow = cursorPos.row;
      this._paintEditText();
      this._atPrompt = true;
    }
  }

  async _handleInputText(data: string): Promise<void> {
    if (this._borrowed) {
      for (const ch of data.toUpperCase()) {
        this.emit('key', ch);
      }
      return;
    }

    if (this._tty) {
      this._buffer =
        this._buffer.substr(0, this._cursor) +
        data +
        this._buffer.substr(this._cursor);
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

  async _handleKey(key: ParsedANSISpecialKey): Promise<void> {
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

  async _handleResize(): Promise<void> {
    if (this._tty) {
      const output = this._output;
      invariant(output != null);
      // $FlowFixMe rows and columns exists if the stream is a TTY
      this._screenRows = output.rows;
      // $FlowFixMe rows and columns exists if the stream is a TTY
      this._screenColumns = output.columns;
    }
  }

  async _handleClose(): Promise<void> {
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

  _sigint(): void {
    this.emit('SIGINT');
  }

  _home(): void {
    this._cursor = 0;
    this._paintEditText();
  }

  _end(): void {
    this._cursor = this._buffer === '' ? 0 : this._buffer.length;
    this._paintEditText();
  }

  _left(): void {
    if (this._cursor > 0) {
      this._cursor--;
      this._paintEditText();
    }
  }

  _right(): void {
    if (this._cursor < this._buffer.length) {
      this._cursor++;
      this._paintEditText();
    }
  }

  _deleteToEnd(): void {
    if (this._cursor < this._buffer.length) {
      this._buffer = this._buffer.substr(0, this._cursor);
      this._textChanged();
      this._paintEditText();
    }
  }

  _deleteToStart(): void {
    if (this._cursor > 0) {
      this._buffer = this._buffer.substr(this._cursor);
      this._cursor = 0;
      this._textChanged();
      this._paintEditText();
    }
  }

  _deleteLine(): void {
    if (this._buffer !== '') {
      this._buffer = '';
      this._cursor = 0;
      this._textChanged();
      this._paintEditText();
    }
  }

  _backspace(): void {
    if (this._cursor > 0) {
      this._buffer =
        this._buffer.substr(0, this._cursor - 1) +
        this._buffer.substr(this._cursor);
      this._cursor--;
      this._textChanged();
      this._paintEditText();
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
      this._paintEditText();
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
    this._paintEditText();
  }

  _enter(): void {
    this._output.write('\r\n');
    this._history.addItem(this._buffer);
    this.emit('line', this._buffer);
    this._buffer = '';
    this._cursor = 0;
    this._textChanged();
    this._atPrompt = false;
  }

  _historyPrevious(): void {
    const item = this._history.previousItem();
    if (item != null) {
      this._buffer = item;
      this._cursor = item.length;
      this._paintEditText();
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
      this._parser = new ANSIInputStreamParser();
      this._onData = t => this._parser.next(t);
      this._input.on('data', this._onData);
      this._parser.on('text', s =>
        this._queueEvent({
          seq: this._nextEvent++,
          type: 'INPUTTEXT',
          data: s,
        }),
      );
      this._parser.on('key', k =>
        this._queueEvent({
          seq: this._nextEvent++,
          type: 'KEY',
          key: k,
        }),
      );
      this._parser.on('cursor', c => this._onCursorPosition(c));

      process.on('SIGWINCH', () =>
        this._queueEvent({seq: this._nextEvent++, type: 'RESIZE'}),
      );
      return;
    }

    this._onData = t => {
      this._queueEvent({seq: this._nextEvent++, type: 'INPUTTEXT', data: t});
    };

    this._input.on('data', this._onData);
  }

  _paintEditText(): void {
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

  _textChanged(): void {
    this._historyTextSave = this._buffer;
    this._history.resetSearch();
  }

  async _getCursorPosition(): Promise<ParsedANSICursorPosition> {
    this._logger.info('console: _getCursorPosition');
    return new Promise((resolve, reject) => {
      if (!this._tty) {
        reject(new Error('_getCursorPosition called and not a TTY'));
        return;
      }

      const completion: CursorCompletion = {
        resolve,
        reject,
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
    invariant(compl != null);

    invariant(this._outputANSI != null);
    this._outputANSI.queryCursorPosition();
  }

  _onCursorPosition(pos: ParsedANSICursorPosition): void {
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
