'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                        * All rights reserved.
                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                        * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                        * the root directory of this source tree.
                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                        *  strict
                                                                                                                                                                                                                                                        * @format
                                                                                                                                                                                                                                                        */

/*
                                                                                                                                                                                                                                                            * Async implementation of Jasmine's waitsFor
                                                                                                                                                                                                                                                            */exports.default = (() => {var _ref = (0, _asyncToGenerator.default)(
  function* (
  fn,
  message,
  timeout = 1000)
  {
    const startTime = Date.now();
    while (!Boolean(fn())) {
      if (Date.now() - startTime > timeout) {
        throw new Error(
        message != null ?
        message :
        'Expected the function to start returning "true" but it never did');

      }
      // eslint-disable-next-line no-await-in-loop
      yield new Promise(function (resolve) {return setTimeout(resolve, 50);});
    }
  });function waitsFor(_x, _x2) {return _ref.apply(this, arguments);}return waitsFor;})();