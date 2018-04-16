/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/**
 * A parser for MI output records. See the grammar at
 * https://sourceware.org/gdb/onlinedocs/gdb/GDB_002fMI-Output-Syntax.html#GDB_002fMI-Output-Syntax
 */

import type {
  AsyncRecordType,
  MICommandResult,
  ResultClass,
  StreamTarget,
  Value,
} from './MIRecord';

import {logVerbose} from './MIDebugSession';
import invariant from 'assert';
import {
  MIAsyncRecord,
  MIRecord,
  MIResultRecord,
  MIStreamRecord,
} from './MIRecord';

export default class MILineParser {
  _completeInput: string = '';
  _line: string = '';

  _lineParserDispatch: Map<string, (token: ?number) => MIRecord> = new Map([
    ['~', (token: ?number) => this._parseStream('console', token)],
    ['@', (token: ?number) => this._parseStream('target', token)],
    ['&', (token: ?number) => this._parseStream('log', token)],
    ['^', (token: ?number) => this._parseResult(token)],
    ['*', (token: ?number) => this._parseAsyncOutput('async-exec', token)],
    ['+', (token: ?number) => this._parseAsyncOutput('async-status', token)],
    ['=', (token: ?number) => this._parseAsyncOutput('async-notify', token)],
  ]);

  // matches the gdb prompt
  _promptPattern = /^\s*\(gdb\)\s*$/;

  // matches the token and classifier parts of an MI record
  _lineClassifierPattern = /^\s*(\d+)?([*+=^~@&^])(.*)\s*$/;

  parseMILine(line: string): MIRecord {
    this._completeInput = line;

    // gdb still sends the prompt, but it isn't significant, so just return an
    // empty record.
    if (line.match(this._promptPattern) != null) {
      return new MIRecord();
    }

    const match = line.match(this._lineClassifierPattern);
    if (match == null) {
      const error = `Line is not an MI record at: '${line}'`;
      logVerbose(error);
      throw new Error(error);
    }

    const [, token, classifier, tail] = match;
    const parser = this._lineParserDispatch.get(classifier);
    invariant(parser != null, `Could not find parser for ${line}`);

    const tokenValue: ?number = token == null ? null : parseInt(token, 10);

    this._line = tail;
    return parser(tokenValue);
  }

  // console-stream-output -> "~" c-string nl
  // target-stream-output -> "@" c-string nl
  // log-stream-output -> "&" c-string nl
  _parseStream(target: StreamTarget, token: ?number): MIRecord {
    if (token != null) {
      throw new Error(
        `Token is not expected on stream record: '${this._completeInput}'`,
      );
    }

    const text = this._parseCString();
    return new MIStreamRecord(target, text);
  }

  _cEncoded: Map<string, string> = new Map([
    ['a', 'a'],
    ['b', '\b'],
    ['f', '\f'],
    ['n', '\n'],
    ['t', '\t'],
    ['v', '\v'],
  ]);

  // parse a C string as returned by gdb
  _parseCString(): string {
    const match = this._line.match(/^"(.*)/);
    if (match == null) {
      throw new Error(`Value is not quoted as a C string at: ${this._line}`);
    }

    this._line = match[1];
    return this._parseCStringTail();
  }

  // result-record -> [token] "^" result-class ( "," result )* nl
  // result-class -> "done" | "running" | "connected" | "error" | "exit"

  // matches the header of a result record
  _resultRecordPattern = /^([a-z]+)(?:(,.*)|$)/;
  _parseResult(token: ?number): MIRecord {
    const match = this._line.match(this._resultRecordPattern);
    if (match == null) {
      throw new Error(`Result record expected at '${this._line}'`);
    }

    const resultClass = this._ensureResultClass(match[1]);
    this._line = match[2];

    const result = this._parseResultMap();

    return new MIResultRecord(token, result, resultClass);
  }

  // exec-async-output -> [ token ] "*" async-output nl
  // status-async-output -> [ token ] "+" async-output nl
  // notify-async-output -> [ token ] "=" async-output nl
  // async-output -> async-class ( "," result )*

  // matches the header of an async record
  _asyncOutputPattern = /^([a-z-]+)(?:(,.*)|$)/;
  _parseAsyncOutput(type: AsyncRecordType, token: ?number): MIRecord {
    // NB the grammar doesn't precisely specify what characters may
    // constitute async-class, but throughout gdb the convention is
    // lower-case alphabetics so it's probably safe to assume that.
    const match = this._line.match(this._asyncOutputPattern);
    if (match == null) {
      throw new Error(`Async class expected at '${this._line}'`);
    }

    const [, asyncClass, tail] = match;

    let result = new Map();
    if (tail != null) {
      this._line = tail;
      result = this._parseResultMap();
    }

    return new MIAsyncRecord(token, result, asyncClass, type);
  }

  // at this point we have (, result)+ nl from multiple rules
  //
  // matches another result record (varname=value)
  _resultContinuationPattern = /^,([^=]+)=(.*)$/;
  _parseResultMap(): MICommandResult {
    const result: MICommandResult = {};

    while (this._line != null) {
      const match = this._line.match(this._resultContinuationPattern);
      if (match == null) {
        break;
      }

      const [, varname, tail] = match;
      this._line = tail;

      // This is mega hacky. In C++ the idea of a function breakpoint matching
      // multiple source locations had to be introduced because of overloading.
      // A function breakpoint set returns a breakpoint id for the main
      // breakpoint, and then id.1, id.2, etc. for all the actual source/line
      // locations. But the implementation actually has a nasty bug in MI (or
      // maybe "feature" for backwards compatibility): the result record
      // contains a list of tuples not actually contained in a list. i.e. we
      // would expect
      // 1^done,bkpt=[{id="1",...},{id="1.1",...}, {id="1.2",...}]
      // but what we actually get is
      // 1^done,bkpt={id="1",...},{id="1.1",...}, {id="1.2",...}
      // which does not conform to the documented grammar of a result record and
      // breaks the parser.

      if (varname === 'bkpt' && tail != null && tail[0] === '{') {
        this._line = `[${tail}]`;
      }
      result[varname] = this._parseValue();
    }

    return result;
  }

  // value -> const | tuple | list
  // const -> c-string
  // tuple -> "{}" | "{" result ( "," result )* "}"
  // list -> "[]" | "[" value ( "," value )* "]" | "[" result ( "," result )* "]"

  // matches the leading part of a value
  _valuePattern = /^\s*(["{[])(.*)$/;

  _valueParsers: Map<string, () => any> = new Map([
    ['"', () => this._parseCStringTail()],
    ['{', () => this._parseTuple()],
    ['[', () => this._parseList()],
  ]);

  _parseValue(): Value {
    const match = this._line.match(this._valuePattern);
    if (match == null) {
      throw new Error(`Invalid result; value expected at: '${this._line}'`);
    }

    const [, leading, rest] = match;
    this._line = rest;

    const parser = this._valueParsers.get(leading);
    invariant(parser != null, `BUG Could not find value parser for ${leading}`);
    return parser();
  }

  // tuple -> "{}" | "{" result ( "," result )* "}"
  // The leading { has already been removed
  _tupleTailPattern = /^(.)(.*)$/;
  _parseTuple(endChar: string = '}'): Value {
    // is it an empty tuple?
    let match = this._line.match(this._tupleTailPattern);
    if (match != null && match[1] === endChar) {
      this._line = match[2];
      return {};
    }

    // parseResultMap expects a leading comma
    this._line = ',' + this._line;
    const result = this._parseResultMap();

    match = this._line.match(this._tupleTailPattern);
    let error = false;

    if (match != null) {
      const [, close, rest] = match;

      error = close !== endChar;
      this._line = rest;
    } else {
      error = true;
    }

    if (error) {
      throw new Error(`Tuple was not properly closed at '${this._line}'`);
    }

    return result;
  }

  // list -> "[]" | "[" value ( "," value )* "]" | "[" result ( "," result )* "]"
  // the leading [ has already been stripped
  //

  // matches the end of a list
  _listTailPattern = /^](.*)$/;

  // matches a result (varname=value)
  _resultPattern = /^([^=]+)=(.*)$/;
  _parseList(): Value {
    const result: Array<Value | MICommandResult> = [];
    const match = this._line.match(this._listTailPattern);
    if (match != null) {
      this._line = match[1];
      return result;
    }

    while (true) {
      if (this._line.match(this._valuePattern) != null) {
        result.push(this._parseValue());
      } else {
        const resultMatch = this._line.match(this._resultPattern);
        if (resultMatch == null) {
          throw new Error(`value or result expected at ${this._line}`);
        }
        const [, varname, tail] = resultMatch;
        this._line = tail;
        const value = this._parseValue();
        result.push({[varname]: value});
      }

      const tailMatch = this._line.match(/^\s*([\],])(.*)$/);
      if (tailMatch == null) {
        throw new Error(`',' or ']' expected at: ${this._line}`);
      }

      const [, close, rest] = tailMatch;
      this._line = rest;

      if (close === ']') {
        break;
      }
    }

    return result;
  }

  _ensureResultClass(resultClass: string): ResultClass {
    if (
      resultClass !== 'done' &&
      resultClass !== 'running' &&
      resultClass !== 'connected' &&
      resultClass !== 'error' &&
      resultClass !== 'exit'
    ) {
      throw new Error(`Result class expected at '${this._line}'`);
    }

    return resultClass;
  }

  // $TODO escapes that include values, e.g. "A\x42C" should be "ABC"
  // Parse a C string for which the leading quote has already been stripped
  _parseCStringTail(): string {
    let parsed: string = '';
    let ended: boolean = false;
    let escaped: boolean = false;
    let i: number;

    for (i = 0; i < this._line.length && !ended; i++) {
      const c: string = this._line[i];
      if (escaped) {
        const translated: ?string = this._cEncoded.get(c);
        parsed += translated != null ? translated : c;
        escaped = false;
      } else if (c === '\\') {
        escaped = true;
      } else if (c === '"') {
        ended = true;
      } else {
        parsed += c;
      }
    }

    if (!ended) {
      throw new Error(`End quote missing on string at: '${this._line}'`);
    }

    this._line = this._line.substr(i);
    return parsed;
  }
}
