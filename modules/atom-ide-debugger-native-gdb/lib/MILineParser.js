"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Logger() {
  const data = require("./Logger");

  _Logger = function () {
    return data;
  };

  return data;
}

function _MIRecord() {
  const data = require("./MIRecord");

  _MIRecord = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * A parser for MI output records. See the grammar at
 * https://sourceware.org/gdb/onlinedocs/gdb/GDB_002fMI-Output-Syntax.html#GDB_002fMI-Output-Syntax
 */
class MILineParser {
  constructor() {
    this._completeInput = '';
    this._line = '';
    this._lineParserDispatch = new Map([['~', token => this._parseStream('console', token)], ['@', token => this._parseStream('target', token)], ['&', token => this._parseStream('log', token)], ['^', token => this._parseResult(token)], ['*', token => this._parseAsyncOutput('async-exec', token)], ['+', token => this._parseAsyncOutput('async-status', token)], ['=', token => this._parseAsyncOutput('async-notify', token)]]);
    this._cEncoded = new Map([['a', 'a'], ['b', '\b'], ['f', '\f'], ['n', '\n'], ['t', '\t'], ['v', '\v']]);
    this._valueParsers = new Map([['"', () => this._parseCStringTail()], ['{', () => this._parseTuple()], ['[', () => this._parseList()]]);
  }

  parseMILine(line) {
    this._completeInput = line; // gdb still sends the prompt, but it isn't significant, so just return an
    // empty record.

    let trimmed = line.trim();

    if (trimmed.startsWith('(gdb)')) {
      return new (_MIRecord().MIRecord)();
    }

    let end = 0;

    while (trimmed[end] != null && trimmed[end] >= '0' && trimmed[end] <= '9') {
      end++;
    }

    const tokenValue = end > 0 ? parseInt(trimmed.substr(0, end), 10) : null;
    trimmed = trimmed.substr(end);

    const parser = this._lineParserDispatch.get(trimmed[0]);

    trimmed = trimmed.substr(1);

    if (parser == null) {
      const error = `Line is not an MI record at: '${line}'`;
      (0, _Logger().logVerbose)(error);
      throw new Error(error);
    }

    this._line = trimmed;
    return parser(tokenValue);
  } // console-stream-output -> "~" c-string nl
  // target-stream-output -> "@" c-string nl
  // log-stream-output -> "&" c-string nl


  _parseStream(target, token) {
    if (token != null) {
      throw new Error(`Token is not expected on stream record: '${this._completeInput}'`);
    }

    const text = this._parseCString();

    return new (_MIRecord().MIStreamRecord)(target, text);
  }

  // parse a C string as returned by gdb
  _parseCString() {
    const match = this._line.match(/^"(.*)/);

    if (match == null) {
      throw new Error(`Value is not quoted as a C string at: ${this._line}`);
    }

    this._line = match[1];
    return this._parseCStringTail();
  } // result-record -> [token] "^" result-class ( "," result )* nl
  // result-class -> "done" | "running" | "connected" | "error" | "exit"


  _parseResult(token) {
    let end = 0;

    while (this._line[end] != null && this._line[end] >= 'a' && this._line[end] <= 'z') {
      end++;
    }

    if (end === 0) {
      throw new Error(`Result record expected at '${this._line}'`);
    }

    const resultClass = this._ensureResultClass(this._line.substr(0, end));

    this._line = this._line.substr(end);

    const result = this._parseResultMap();

    return new (_MIRecord().MIResultRecord)(token, result, resultClass);
  } // exec-async-output -> [ token ] "*" async-output nl
  // status-async-output -> [ token ] "+" async-output nl
  // notify-async-output -> [ token ] "=" async-output nl
  // async-output -> async-class ( "," result )*
  // matches the header of an async record


  _parseAsyncOutput(type, token) {
    // NB the grammar doesn't precisely specify what characters may
    // constitute async-class, but throughout gdb the convention is
    // lower-case alphabetics so it's probably safe to assume that.
    let end = 0;

    while (this._line[end] != null && (this._line[end] >= 'a' && this._line[end] <= 'z' || this._line[end] === '-')) {
      end++;
    }

    if (end === 0) {
      throw new Error(`Async class expected at '${this._line}'`);
    }

    const asyncClass = this._line.substr(0, end);

    this._line = this._line.substr(end);
    let result = new Map();

    if (this._line !== '') {
      result = this._parseResultMap();
    }

    return new (_MIRecord().MIAsyncRecord)(token, result, asyncClass, type);
  } // at this point we have (, result)+ nl from multiple rules
  //


  _parseResultMap() {
    const result = {};

    while (this._line != null) {
      if (this._line[0] !== ',') {
        break;
      }

      const equals = this._line.indexOf('=', 1);

      if (equals === -1) {
        break;
      }

      const varname = this._line.substr(1, equals - 1);

      this._line = this._line.substr(equals + 1); // This is mega hacky. In C++ the idea of a function breakpoint matching
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

      if (varname === 'bkpt' && this._line != null && this._line[0] === '{') {
        this._line = `[${this._line}]`;
      }

      result[varname] = this._parseValue();
    }

    return result;
  } // value -> const | tuple | list
  // const -> c-string
  // tuple -> "{}" | "{" result ( "," result )* "}"
  // list -> "[]" | "[" value ( "," value )* "]" | "[" result ( "," result )* "]"
  // matches the leading part of a value


  _parseValue() {
    this._line = this._line.trim();

    const handler = this._valueParsers.get(this._line[0]);

    this._line = this._line.substr(1);

    if (handler == null) {
      throw new Error(`Invalid result; value expected at: '${this._line}'`);
    }

    return handler();
  } // tuple -> "{}" | "{" result ( "," result )* "}"
  // The leading { has already been removed


  _parseTuple(endChar = '}') {
    if (this._line[0] === endChar) {
      this._line = this._line.substr(1);
      return {};
    } // parseResultMap expects a leading comma


    this._line = ',' + this._line;

    const result = this._parseResultMap();

    let error = false;

    if (this._line.length > 0) {
      const close = this._line[0];
      this._line = this._line.substr(1);
      error = close !== endChar;
    } else {
      error = true;
    }

    if (error) {
      throw new Error(`Tuple was not properly closed at '${this._line}'`);
    }

    return result;
  } // list -> "[]" | "[" value ( "," value )* "]" | "[" result ( "," result )* "]"
  // the leading [ has already been stripped
  //
  // matches a result (varname=value)


  _parseList() {
    const result = [];

    if (this._line[0] === ']') {
      this._line = this._line.substr(1);
      return result;
    }

    while (true) {
      this._line = this._line.trim();

      if (this._valueParsers.get(this._line[0]) != null) {
        result.push(this._parseValue());
      } else {
        const equals = this._line.indexOf('=');

        if (equals === -1) {
          throw new Error(`value or result expected at ${this._line}`);
        }

        const varname = this._line.substr(0, equals);

        this._line = this._line.substr(equals + 1);

        const value = this._parseValue();

        result.push({
          [varname]: value
        });
      }

      this._line = this._line.trim();
      const close = this._line[0];

      if (close !== ']' && close !== ',') {
        throw new Error(`',' or ']' expected at: ${this._line}`);
      }

      this._line = this._line.substr(1);

      if (close === ']') {
        break;
      }
    }

    return result;
  }

  _ensureResultClass(resultClass) {
    if (resultClass !== 'done' && resultClass !== 'running' && resultClass !== 'connected' && resultClass !== 'error' && resultClass !== 'exit') {
      throw new Error(`Result class expected at '${this._line}'`);
    }

    return resultClass;
  } // $TODO escapes that include values, e.g. "A\x42C" should be "ABC"
  // Parse a C string for which the leading quote has already been stripped


  _parseCStringTail() {
    let parsed = '';
    let ended = false;
    let escaped = false;
    let i;

    for (i = 0; i < this._line.length && !ended; i++) {
      const c = this._line[i];

      if (escaped) {
        const translated = this._cEncoded.get(c);

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

exports.default = MILineParser;