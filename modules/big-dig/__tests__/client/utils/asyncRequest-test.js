"use strict";

var _http = _interopRequireDefault(require("http"));

function _asyncRequest() {
  const data = _interopRequireDefault(require("../../../src/client/utils/asyncRequest"));

  _asyncRequest = function () {
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
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('asyncRequest', () => {
  let server;
  beforeEach(async () => {
    server = _http.default.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('okay');
    });
    await new Promise(resolve => {
      server.listen(36845, '127.0.0.1', 511
      /* backlog */
      , resolve);
    });
  });
  afterEach(() => {
    server.close();
  });
  it('can do http request in an async way', async () => {
    const {
      body,
      response
    } = await (0, _asyncRequest().default)({
      uri: 'http://127.0.0.1:36845/abc'
    });
    expect(body).toBe('okay');
    expect(response.statusCode).toBe(200);
  });
});