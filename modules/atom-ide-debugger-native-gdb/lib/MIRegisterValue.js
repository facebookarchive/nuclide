"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIRegisterValueParser = exports.MIRegisterIndexedValues = exports.MIRegisterNamedValues = exports.MIRegisterSimpleValue = exports.MIRegisterValue = void 0;

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
// The MI documentation doesn't cover this, but gdb will return structured values
// for registers which contain packed arrays of simple types (MMX et al.)
// Furthermore, if the register can hold different widths of values, then
// there is an intermediate node for each possible representation it can hold.
//
// The syntax is similar to MI result record values:
// value => simple_value | named_list | indexed_list
// simple_value => float-value | integer-value
// named_list => '{' identifer '=' value ( ',' identifier '=' value ) * '}'
// indexed_list => '{' value ( ',' value ) *  '}'
//
class MIRegisterValue {
  toString() {
    return '';
  }

  isContainer() {
    return false;
  }

  containedValues() {
    return [];
  }

  get containerKeyIsString() {
    return false;
  }

  get length() {
    return 0;
  }

  valueAt(index) {
    return null;
  }

}

exports.MIRegisterValue = MIRegisterValue;

class MIRegisterSimpleValue extends MIRegisterValue {
  constructor(value) {
    super();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  toString() {
    return this._value;
  }

}

exports.MIRegisterSimpleValue = MIRegisterSimpleValue;

class MIRegisterNamedValues extends MIRegisterValue {
  constructor(values) {
    super();
    this._values = values;
  }

  isContainer() {
    return true;
  }

  get names() {
    return [...this._values.keys()];
  }

  get containerKeyIsString() {
    return true;
  }

  get length() {
    return this._values.size;
  }

  valueAt(index) {
    return this._values.get(index);
  }

  containedValues() {
    return [...this._values].map(entry => {
      return {
        name: entry[0],
        expressionSuffix: `.${entry[0]}`,
        value: entry[1]
      };
    });
  }

  toString() {
    return `{${[...this._values].map(([k, v]) => `${k}:${v.toString()}`).join(',')}}`;
  }

}

exports.MIRegisterNamedValues = MIRegisterNamedValues;

class MIRegisterIndexedValues extends MIRegisterValue {
  constructor(values) {
    super();
    this._values = values;
  }

  isContainer() {
    return true;
  }

  get length() {
    return this._values.length;
  }

  valueAt(index) {
    return this._values[parseInt(index, 10)];
  }

  get values() {
    return this._values;
  }

  containedValues() {
    return this._values.map((entry, index) => {
      return {
        name: `${index}`,
        expressionSuffix: `[${index}]`,
        value: entry
      };
    });
  }

  toString() {
    return `[${this._values.map(_ => _.toString()).join(',')}]`;
  }

}

exports.MIRegisterIndexedValues = MIRegisterIndexedValues;

class MIRegisterValueParser {
  // matches name = something
  constructor(expression) {
    this._namePattern = /^\s*([a-zA-Z_][a-zA-Z_0-9]*)\s*=(.*)/;
    this._originalExpression = expression;
  }

  parse() {
    this._expression = this._originalExpression;

    const value = this._parse();

    if (this._expression !== '') {
      throw new Error('Extra characters at end of expression');
    }

    return value;
  }

  _parse() {
    this._expression = this._expression.trim();

    if (this._expression === '') {
      throw new Error('Premature end of register value expression');
    }

    if (this._expression[0] !== '{') {
      // expression value goes until the next ',', '}', or end of string.
      const match = this._expression.match(/^([^,}]*)(.*)$/);

      if (!(match != null)) {
        throw new Error("Invariant violation: \"match != null\"");
      }

      const [, value, rest] = match;
      this._expression = rest;
      return new MIRegisterSimpleValue(value.trim());
    }

    this._expression = this._expression.substr(1); // if we have "name = " then we have a named list; otherwise, an indexed
    // list.

    if (this._expression.match(this._namePattern) != null) {
      return this._parseNamedList();
    }

    return this._parseIndexedList();
  }

  _parseIndexedList() {
    const values = [];

    while (true) {
      const value = this._parse();

      if (!this._expandArrayInto(value, values)) {
        values.push(value);
      }

      if (this._checkEndOfList()) {
        break;
      }
    }

    return new MIRegisterIndexedValues(values);
  } // gdb/MI will sometimes reformat an array if it contains multiple repeated
  // values. This is great for saving space in displayable output, but we want
  // the expansion to be available to be expanded in tree display.


  _expandArrayInto(value, values) {
    if (value instanceof MIRegisterSimpleValue) {
      const repeatedValuePattern = /^(.*) <repeats (\d+) times>$/;
      const match = value.value.match(repeatedValuePattern);

      if (match != null) {
        const [, repeatedValue, countStr] = match;
        const count = parseInt(countStr, 10);

        for (let i = 0; i < count; i++) {
          values.push(new MIRegisterSimpleValue(repeatedValue));
        }

        return true;
      }
    }

    return false;
  }

  _parseNamedList() {
    const values = new Map();

    while (true) {
      const match = this._expression.match(this._namePattern);

      if (match != null) {
        const [, name, rest] = match;
        this._expression = rest;

        const value = this._parse();

        values.set(name, value);
        continue;
      }

      if (this._checkEndOfList()) {
        break;
      }
    }

    return new MIRegisterNamedValues(values);
  }

  _checkEndOfList() {
    this._expression = this._expression.trim();

    if (this._expression !== '') {
      const sepChar = this._expression[0];
      this._expression = this._expression.substr(1);

      if (sepChar === '}') {
        return true;
      } else if (sepChar === ',') {
        return false;
      }
    }

    throw new Error('Improperly formatted list in register value');
  }

}

exports.MIRegisterValueParser = MIRegisterValueParser;