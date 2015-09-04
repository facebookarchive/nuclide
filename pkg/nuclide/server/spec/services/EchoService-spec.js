'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import path from 'path';
import ServiceTestHelper from './ServiceTestHelper';

describe('EchoServer', () => {
  var testHelper, service;
  beforeEach(() => {
    testHelper = new ServiceTestHelper();
    waitsForPromise(() => testHelper.start([{
      name: 'EchoService',
      definition: path.join(__dirname, 'EchoService.def'),
      implementation: path.join(__dirname, 'EchoService.js'),
    }]));

    runs(() => {
      service = testHelper.getRemoteService(path.join(__dirname, 'EchoService.def'));
    });
  });

  // Basic types.
  it('Echoes a string.', () => {
    var expected = 'Hello World.';
    waitsForPromise(async () => {
      var results = await service.echoString(expected);
      expect(results).toBe(expected);
    });
  });
  it('Echoes a number.', () => {
    var expected = 231312;
    waitsForPromise(async () => {
      var results = await service.echoNumber(expected);
      expect(results).toBe(expected);
    });
  });
  it('Echoes a boolean.', () => {
    var expected = false;
    waitsForPromise(async () => {
      var results = await service.echoBoolean(expected);
      expect(results).toBe(expected);
    });
  });

  // More complex types.
  it('Echoes a date.', () => {
    var expected = new Date();
    waitsForPromise(async () => {
      var results = await service.echoDate(expected);
      expect(results.getTime()).toBe(expected.getTime());
    });
  });
  it('Echoes a Regex.', () => {
    var expected = /nuclide/ig;
    waitsForPromise(async () => {
      var results = await service.echoRegExp(expected);
      expect(results.source).toBe(expected.source);
    });
  });
  it('Echoes a Buffer.', () => {
    var expected = new Buffer('Test Buffer Content.');
    waitsForPromise(async () => {
      var results = await service.echoBuffer(expected);
      expect(results.equals(expected)).toBe(true);
    });
  });

  // Parameterized types.
  it('Echoes an Array<Array<Date>>.', () => {
    var a = new Date();
    var b = new Date(1995, 11, 17, 3, 24, 0);
    var expected = [[ a, b ]];

    waitsForPromise(async () => {
      var results = await service.echoArrayOfArrayOfDate(expected);
      expect(results.length).toBe(1);
      expect(results[0].length).toBe(2);
      expect(results[0][0].getTime()).toBe(a.getTime());
      expect(results[0][1].getTime()).toBe(b.getTime());
    });
  });
  it('Echoes an Object.', () => {
    var a = null;
    var b = new Buffer('testBuffer');

    waitsForPromise(async () => {
      var results = await service.echoObject({a, b});
      expect(results.a).toBe(null);
      expect(results.b.equals(b)).toBe(true);
    });
  });
  it('Echoes a Set.', () => {
    var original = new Set(['a', 'b']);
    waitsForPromise(async () => {
      var results = await service.echoSet(original);
      expect(results.has('a')).toBeTruthy();
      expect(results.has('b')).toBeTruthy();
      expect(results.has('c')).toBeFalsy();
    });
  });
  it('Echoes a Map.', () => {
    var original = new Map([
      ['a', new Date()],
      ['b', new Date(1995, 11, 17, 3, 24, 0)],
    ]);
    waitsForPromise(async () => {
      var results = await service.echoMap(original);
      expect(results.has('a')).toBeTruthy();
      expect(results.get('a').getTime()).toBeTruthy(original.get('a').getTime());

      expect(results.has('b')).toBeTruthy();
      expect(results.get('b').getTime()).toBeTruthy(original.get('b').getTime());

      expect(results.has('c')).toBeFalsy();
    });
  });
  it('Echoes a Tuple.', () => {
    var original = [3, 'hello'];
    waitsForPromise(async () => {
      var results = await service.echoTuple(original);
      expect(results.length).toBe(original.length);
      expect(results[0]).toBe(original[0]);
      expect(results[1]).toBe(original[1]);
    });
  });

  // Echo value types.
  it('Echoes a value type (struct).', () => {
    var expected = {
      a: new Date(),
      b: new Buffer('Buffer Test Data.'),
    };

    waitsForPromise(async () => {
      invariant(service);
      var results = await service.echoValueType(expected);

      expect(results.a.getTime()).toBe(expected.a.getTime());
      expect(results.b.equals(expected.b)).toBe(true);
    });
  });

  // Echo a NuclideUri.
  it('Echoes a NuclideUri.', () => {
    var expected = testHelper._connection.getUriOfRemotePath('/fake/file.txt');
    waitsForPromise(async () => {
      invariant(service);
      var results = await service.echoNuclideUri(expected);
      expect(results).toBe(expected);
    });
  });

  afterEach(() => testHelper.stop());
});
