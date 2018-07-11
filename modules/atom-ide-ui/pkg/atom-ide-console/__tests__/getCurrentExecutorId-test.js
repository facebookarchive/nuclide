"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDummyExecutor = createDummyExecutor;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _getCurrentExecutorId() {
  const data = _interopRequireDefault(require("../lib/getCurrentExecutorId"));

  _getCurrentExecutorId = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
function createDummyExecutor(id) {
  return {
    id,
    name: id,
    scopeName: 'text.plain',
    send: code => {},
    output: _RxMin.Observable.create(observer => {})
  };
}

const baseAppState = {
  createPasteFunction: null,
  currentExecutorId: 'a',
  maxMessageCount: Number.POSITIVE_INFINITY,
  executors: new Map([['a', createDummyExecutor('a')]]),
  providers: new Map(),
  providerStatuses: new Map(),
  records: Immutable().List(),
  history: []
};
describe('getCurrentExecutorId', () => {
  it('gets the current executor', () => {
    expect((0, _getCurrentExecutorId().default)(baseAppState)).toBe('a');
  });
  it('returns an executor even if the current id is null', () => {
    const appState = Object.assign({}, baseAppState, {
      currentExecutorId: null
    });
    expect((0, _getCurrentExecutorId().default)(appState)).toBe('a');
  });
});