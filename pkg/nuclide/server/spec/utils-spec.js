'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var http = require('http');
var utils = require('../lib/utils');
var querystring = require('querystring');

describe('NuclideServer utils test', () => {
  var server, customHandler;

  beforeEach(() => {
    var connected = false;
    server = http.createServer((req, res) => {
      if (customHandler) {
        customHandler(req, res);
      } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('okay');
      }
    });
    server.listen(36845, '127.0.0.1', () => {
      connected = true;
    });
    waitsFor(() => connected);
  });

  afterEach(() => {
    server.close();
    customHandler = null;
    waits(1); // wait for the consumed port handle to return to the OS
  });

  it('can do http request in an async way', () => {
    waitsForPromise(async () => {
      var {body, response} = await utils.asyncRequest('http://127.0.0.1:36845/abc');
      expect(body).toBe('okay');
      expect(response.statusCode).toBe(200);
    });
  });

  it('parses the request body', () => {
    var bodyHandler = jasmine.createSpy();
    customHandler = (req, res) => {
      utils.parseRequestBody(req).then(bodyHandler);
    };
    utils.asyncRequest({uri: 'http://127.0.0.1:36845/abc', method: 'POST', body: 'string_abc'}, () => {});
    waitsFor(() => bodyHandler.callCount > 0);
    runs(() => expect(bodyHandler.argsForCall[0][0]).toBe('string_abc'));
  });

  it('gets query params', () => {
    var params = utils.getQueryParameters('http://fburil.com?one=2&yoga=def');
    expect(params).toEqual({one: '2', yoga: 'def'});
  });

  describe('serializeArgs', () => {
    it('serializes empty args', () => {
      var {args, argTypes} = utils.serializeArgs([]);
      expect(args).toEqual([]);
      expect(argTypes).toEqual([]);
    });

    it('serializes undefined args', () => {
      var {args, argTypes} = utils.serializeArgs(['abc', undefined]);
      expect(args).toEqual(['abc', '']);
      expect(argTypes).toEqual(['string', 'undefined']);
    });

    it('serializes object args', () => {
      var {args, argTypes} = utils.serializeArgs([{def: 'lol'}]);
      expect(args).toEqual([JSON.stringify({def: 'lol'})]);
      expect(argTypes).toEqual(['object']);
    });
  });

  describe('deserializeArgs', () => {
    it('deserializes strings and undefined', () => {
      var url = 'http://localhost:8090/?args=abc&args=&argTypes=string&argTypes=undefined';
      var [str, undef] = utils.deserializeArgs(url);
      expect(str).toBe('abc');
      expect(undef).not.toBeDefined();
    });

    it('deserializes objects', () => {
      var escapedObj = querystring.escape(JSON.stringify({def: 'lol'}));
      var url = 'http://localhost:8090/?args=' + escapedObj + '&argTypes=object';
      var [obj] = utils.deserializeArgs(url);
      expect(obj).toEqual({def: 'lol'});
    });
  });

  it('serializeArgs then deserializeArgs for strings with non-escaped chars', () => {
    var {args, argTypes} = utils.serializeArgs(['a d+']);
    var [str] = utils.deserializeArgs('http://localhost:8090/?' + querystring.stringify({args, argTypes}));
    expect(str).toBe('a d+');
  });

});
