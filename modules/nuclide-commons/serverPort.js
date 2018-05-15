'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.getAvailableServerPort = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let getAvailableServerPort = exports.getAvailableServerPort = (() => {var _ref = (0, _asyncToGenerator.default)(













  function* () {
    return new Promise(function (resolve, reject) {
      const server = _net.default.createServer();
      server.unref();
      server.on('error', reject);
      server.listen({ port: 0 }, function () {
        const port = server.address().port;
        server.close(function () {
          resolve(port);
        });
      });
    });
  });return function getAvailableServerPort() {return _ref.apply(this, arguments);};})(); /**
                                                                                           * Copyright (c) 2017-present, Facebook, Inc.
                                                                                           * All rights reserved.
                                                                                           *
                                                                                           * This source code is licensed under the BSD-style license found in the
                                                                                           * LICENSE file in the root directory of this source tree. An additional grant
                                                                                           * of patent rights can be found in the PATENTS file in the same directory.
                                                                                           *
                                                                                           *  strict
                                                                                           * @format
                                                                                           */var _net = _interopRequireDefault(require('net'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}