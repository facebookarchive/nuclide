'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _DebuggerInterface;

function _load_DebuggerInterface() {
  return _DebuggerInterface = require('./DebuggerInterface');
}

var _Format;

function _load_Format() {
  return _Format = _interopRequireDefault(require('./Format'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ListCommand {

  constructor(con, debug) {
    this.name = 'list';
    this.helpText = "[line | source[:line] | @[:line]]: list source file contents. '@' may be used to refer to the source at the current stack frame.";
    this.detailedHelpText = `
list [line | source[:line] | @[:line]]

Lists source files.

With no arguments, list tries to continue displaying the current source file. If
a file has been previously listed, then that is the current source file; otherwise,
the current source file is the file containing the location of the selected stack
frame.

If just a line number is given, then the current source file will be listed starting
at that line.

If just a source file is given, then that file will be listed started at the beginning.
If a line number is also given, then the listing will start at that line.

'@' may be used as a shorthand for the source file of the current location in the
selected stack frame. With no line number, the listing will attempt to center the
current location in the ouput. Otherwise, listing will begin at the given line number.
  `;
    this._source = {};
    this._nextLine = 1;
    this._sourceIsStackFrame = false;
    this._stackFrameLine = 0;

    this._console = con;
    this._debugger = debug;
  }

  async execute(args) {
    let ref;

    switch (args.length) {
      case 0:
        if (this._sourceIsEmpty()) {
          ref = await this._parseSourcePath('@');
        } else {
          ref = {
            source: this._previousSource(),
            line: this._nextLine
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

  _previousSource() {
    if (this._sourceIsEmpty()) {
      throw new Error('There is no current source file to list.');
    }

    return this._source;
  }

  async _parseSourcePath(sourceRef) {
    // just line on current source
    let match = sourceRef.match(/^(\d+)$/);
    if (match != null) {
      const [, line] = match;
      return {
        source: this._previousSource(),
        line: parseInt(line, 10)
      };
    }

    // source:line (where source may be '@' meaning current stack frame source)
    match = sourceRef.match(/^([^:]+)(:(\d+))?$/);
    if (match != null) {
      const [, sourcePath,, lineStr] = match;
      let line = lineStr != null ? parseInt(lineStr, 10) : 1;

      let source = { path: sourcePath };

      this._sourceIsStackFrame = sourcePath === '@';

      if (this._sourceIsStackFrame) {
        const stackFrame = await this._debugger.getCurrentStackFrame();
        if (stackFrame == null || stackFrame.source == null) {
          throw new Error('Source is not available for the current stack frame.');
        }

        source = stackFrame.source;
        this._stackFrameLine = stackFrame.line;

        if (lineStr == null) {
          // If no line was specified, center around current line in
          // stack frame
          line = Math.max(1, this._stackFrameLine - Math.floor(ListCommand._linesToPrint / 2));
        }
      }

      return {
        source,
        line
      };
    }

    throw new Error(ListCommand._formatError);
  }

  async _printSourceLines(ref) {
    let sourceLines;

    try {
      sourceLines = await this._debugger.getSourceLines(ref.source, ref.line, ListCommand._linesToPrint);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this._console.outputLine('Source file does not exist.');
        return;
      }

      this._console.outputLine('Error reading source file.');
      return;
    }

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
      this._console.outputLine(`${(0, (_Format || _load_Format()).default)(String(lineNumber), maxLength)}${sep}   ${sourceLine}`);
      lineNumber++;
    }

    this._source = ref.source;
    this._nextLine = ref.line + sourceLines.length;
  }

  _sourceIsEmpty() {
    return this._source.path == null && (this._source.sourceReference == null || this._source.sourceReference === 0);
  }
}
exports.default = ListCommand; /**
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

ListCommand._formatError = "Format is 'list [source[:line]]'.";
ListCommand._linesToPrint = 25;