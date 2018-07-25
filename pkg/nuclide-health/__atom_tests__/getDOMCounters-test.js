"use strict";

var _electron = require("electron");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _getDOMCounters() {
  const data = _interopRequireDefault(require("../lib/getDOMCounters"));

  _getDOMCounters = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 * @emails oncall+nuclide
 */
if (!(_electron.remote != null)) {
  throw new Error("Invariant violation: \"remote != null\"");
}

describe('getDOMCounters', () => {
  it('returns reasonable values', async () => {
    const counters = await (0, _getDOMCounters().default)();

    if (!(counters != null)) {
      throw new Error('Expected non-null counters');
    }

    expect(counters.nodes).toBeGreaterThan(10);
    expect(counters.attachedNodes).toBeLessThan(counters.nodes);
    expect(counters.jsEventListeners).toBeGreaterThan(10);
    (0, _log4js().getLogger)().debug('getDOMCounters():', JSON.stringify(counters));
  });
  it('returns null if a debugger is attached', async () => {
    const chromeDebugger = _electron.remote.getCurrentWebContents().debugger;

    if (!(chromeDebugger != null)) {
      throw new Error("Invariant violation: \"chromeDebugger != null\"");
    }

    chromeDebugger.attach('1.1');
    const counters = await (0, _getDOMCounters().default)();
    expect(counters).toBeNull();
    chromeDebugger.detach();
  });
});