"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Format() {
  const data = _interopRequireDefault(require("./Format"));

  _Format = function () {
    return data;
  };

  return data;
}

function _TokenizedLine() {
  const data = _interopRequireDefault(require("./TokenizedLine"));

  _TokenizedLine = function () {
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
 *  strict-local
 * @format
 */
class BreakpointListCommand {
  constructor(con, debug) {
    this.name = 'list';
    this.helpText = 'Lists all breakpoints.';
    this._console = con;
    this._debugger = debug;
  }

  async execute(line) {
    const breakpoints = this._debugger.getAllBreakpoints().sort((left, right) => left.index - right.index);

    if (breakpoints.length === 0) {
      return;
    }

    const lastBreakpoint = breakpoints[breakpoints.length - 1];
    const indexSize = String(lastBreakpoint.index).length;

    const stopped = this._debugger.getStoppedAtBreakpoint();

    breakpoints.forEach(bpt => {
      const attributes = [bpt.state];

      if (!bpt.verified) {
        attributes.push('unverified');
      }

      const stoppedHere = bpt.id != null && stopped === bpt;
      const index = (0, _Format().default)(`${stoppedHere ? '*' : ' '}#${bpt.index}`, indexSize + 1);
      const attrs = attributes.length === 0 ? '' : `(${attributes.join(',')})`;
      const cond = bpt.condition();

      this._console.outputLine(`${index} ${bpt.toString()} ${attrs}${cond == null ? '' : ` if ${cond}`}`);
    });
  }

}

exports.default = BreakpointListCommand;