'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _waits_for;










function _load_waits_for() {return _waits_for = _interopRequireDefault(require('../waits_for'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

it('waits', (0, _asyncToGenerator.default)(function* () {
  let condition = false;
  Promise.resolve().then(function () {return condition = true;});
  yield (0, (_waits_for || _load_waits_for()).default)(function () {return condition;});
})); /**
      * Copyright (c) 2015-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the license found in the LICENSE file in
      * the root directory of this source tree.
      *
      * 
      * @format
      */it("can't wait anymore", (0, _asyncToGenerator.default)(function* () {yield expect((0, (_waits_for || _load_waits_for()).default)(function () {return false;}, undefined, 1)).rejects.toThrow('but it never did');}));it('gives a message', (0, _asyncToGenerator.default)(function* () {yield expect((0, (_waits_for || _load_waits_for()).default)(function () {return false;}, 'lol', 1)).rejects.toThrow('lol');
}));