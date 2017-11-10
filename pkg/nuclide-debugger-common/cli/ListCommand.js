/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as DebugProtocol from 'vscode-debugprotocol';
import type {ConsoleIO} from './ConsoleIO';
import type {Command} from './Command';

import {DebuggerInterface} from './DebuggerInterface';
import leftPad from './Format';

type SourceReference = {
  source: DebugProtocol.Source,
  line: number,
};

export default class ListCommand implements Command {
  name = 'list';
  helpText = "[source|@[:line]]: list source file contents. '@' may be used to refer to the source at the current stack frame.";

  static _formatError = "Format is 'list [source[:line]]'.";
  static _linesToPrint = 25;

  _console: ConsoleIO;
  _debugger: DebuggerInterface;

  _source: DebugProtocol.Source = {};
  _nextLine: number = 1;
  _sourceIsStackFrame: boolean = false;
  _stackFrameLine: number = 0;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    let ref: SourceReference;

    switch (args.length) {
      case 0:
        if (this._sourceIsEmpty()) {
          ref = await this._parseSourcePath('@');
        } else {
          ref = {
            source: this._previousSource(),
            line: this._nextLine,
          };
        }
        break;

      case 1:
        ref = await this._parseSourcePath(args[0]);
        break;

      default:
        throw new Error(ListCommand._formatError);
    }

    await this._printSourceLines(ref);
  }

  _previousSource(): DebugProtocol.Source {
    if (this._sourceIsEmpty()) {
      throw new Error('There is no current source file to list.');
    }

    return this._source;
  }

  async _parseSourcePath(sourceRef: string): Promise<SourceReference> {
    // just line on current source
    let match = sourceRef.match(/^(\d+)$/);
    if (match != null) {
      const [, line] = match;
      return {
        source: this._previousSource(),
        line: parseInt(line, 10),
      };
    }

    // source:line (where source may be '@' meaning current stack frame source)
    match = sourceRef.match(/^([^:]+)(:(\d+))?$/);
    if (match != null) {
      const [, sourcePath, , lineStr] = match;
      let line = lineStr != null ? parseInt(lineStr, 10) : 1;

      let source = {path: sourcePath};

      this._sourceIsStackFrame = sourcePath === '@';

      if (this._sourceIsStackFrame) {
        const stackFrame = await this._debugger.getCurrentStackFrame();
        if (stackFrame == null || stackFrame.source == null) {
          throw new Error(
            'Source is not available for the current stack frame.',
          );
        }

        source = stackFrame.source;
        this._stackFrameLine = stackFrame.line;

        if (lineStr == null) {
          // If no line was specified, center around current line in
          // stack frame
          line = Math.max(
            1,
            this._stackFrameLine - Math.floor(ListCommand._linesToPrint / 2),
          );
        }
      }

      return {
        source,
        line,
      };
    }

    throw new Error(ListCommand._formatError);
  }

  async _printSourceLines(ref: SourceReference): Promise<void> {
    const sourceLines = await this._debugger.getSourceLines(
      ref.source,
      ref.line,
      ListCommand._linesToPrint,
    );

    if (ref.source.path != null) {
      this._console.outputLine(`Listing ${ref.source.path}`);
    }

    if (sourceLines.length === 0) {
      throw new Error(`No source found at line ${ref.line}.`);
    }

    const maxLineNumber = ref.line + sourceLines.length - 1;
    const maxLength = String(maxLineNumber).length;

    let lineNumber = ref.line;
    for (const sourceLine of sourceLines) {
      let sep = ' |';
      if (this._sourceIsStackFrame && lineNumber === this._stackFrameLine) {
        sep = '=>';
      }
      this._console.outputLine(
        `${leftPad(String(lineNumber), maxLength)}${sep}   ${sourceLine}`,
      );
      lineNumber++;
    }

    this._source = ref.source;
    this._nextLine = ref.line + sourceLines.length;
  }

  _sourceIsEmpty(): boolean {
    return (
      this._source.path == null &&
      (this._source.sourceReference == null ||
        this._source.sourceReference === 0)
    );
  }
}
