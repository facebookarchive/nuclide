"use strict";

var _http = _interopRequireDefault(require("http"));

var _querystring = _interopRequireDefault(require("querystring"));

function utils() {
  const data = _interopRequireWildcard(require("../lib/utils"));

  utils = function () {
    return data;
  };

  return data;
}

function _asyncRequest() {
  const data = _interopRequireDefault(require("../../../modules/big-dig/src/client/utils/asyncRequest"));

  _asyncRequest = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('NuclideServer utils test', () => {
  let server;
  let customHandler;
  beforeEach(async () => {
    let connected = false;
    server = _http.default.createServer((req, res) => {
      if (customHandler) {
        customHandler(req, res);
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('okay');
      }
    });
    server.listen(36845, '127.0.0.1', 511
    /* backlog */
    , () => {
      connected = true;
    });
    await (0, _waits_for().default)(() => connected);
  });
  afterEach(() => {
    server.close();
    customHandler = null;
  });
  it('parses the request body', async () => {
    const bodyHandler = jest.fn();

    customHandler = (req, res) => {
      utils() // $FlowFixMe(asuarez): Use Flow builtin defs for IncomingMessage.
      .parseRequestBody(req).then(bodyHandler).then(() => res.end());
    };

    (0, _asyncRequest().default)({
      uri: 'http://127.0.0.1:36845/abc',
      method: 'POST',
      body: 'string_abc'
    });
    await (0, _waits_for().default)(() => bodyHandler.mock.calls.length > 0);
    expect(bodyHandler.mock.calls[0][0]).toBe('string_abc');
  });
  it('gets query params', () => {
    const params = utils().getQueryParameters('http://fburil.com?one=2&yoga=def');
    expect(params).toEqual({
      one: '2',
      yoga: 'def'
    });
  });
  describe('serializeArgs', () => {
    it('serializes empty args', () => {
      const {
        args,
        argTypes
      } = utils().serializeArgs([]);
      expect(args).toEqual([]);
      expect(argTypes).toEqual([]);
    });
    it('serializes undefined args', () => {
      const {
        args,
        argTypes
      } = utils().serializeArgs(['abc', undefined]);
      expect(args).toEqual(['abc', '']);
      expect(argTypes).toEqual(['string', 'undefined']);
    });
    it('serializes object args', () => {
      const {
        args,
        argTypes
      } = utils().serializeArgs([{
        def: 'lol'
      }]);
      expect(args).toEqual([JSON.stringify({
        def: 'lol'
      })]);
      expect(argTypes).toEqual(['object']);
    });
  });
  describe('deserializeArgs', () => {
    it('deserializes strings and undefined', () => {
      const url = 'http://localhost:8090/?args=abc&args=&argTypes=string&argTypes=undefined';
      const [str, undef] = utils().deserializeArgs(url);
      expect(str).toBe('abc');
      expect(undef).not.toBeDefined();
    });
    it('deserializes objects', () => {
      const escapedObj = _querystring.default.escape(JSON.stringify({
        def: 'lol'
      }));

      const url = 'http://localhost:8090/?args=' + escapedObj + '&argTypes=object';
      const [obj] = utils().deserializeArgs(url);
      expect(obj).toEqual({
        def: 'lol'
      });
    });
  });
  it('serializeArgs then deserializeArgs for strings with non-escaped chars', () => {
    const {
      args,
      argTypes
    } = utils().serializeArgs(['a d+']);
    const [str] = utils().deserializeArgs('http://localhost:8090/?' + _querystring.default.stringify({
      args,
      argTypes
    }));
    expect(str).toBe('a d+');
  });
});