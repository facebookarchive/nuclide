"use strict";

function _Encoder() {
  const data = _interopRequireDefault(require("../Encoder"));

  _Encoder = function () {
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
describe('Encoder', () => {
  it('should and decode correctly', () => {
    const test = {
      name: 'thing',
      number: 5,
      buf: Buffer.from('hello world')
    };

    const encoded = _Encoder().default.encode(test);

    const decoded = _Encoder().default.decode(encoded);

    expect(decoded.name).toEqual(test.name);
    expect(decoded.number).toEqual(test.number);
    expect(decoded.buf).toEqual(test.buf);
  });
  it('should work with nested objects', () => {
    const test = {
      name: 'thing',
      number: 50,
      buf: Buffer.from('this is a test'),
      subObj: {
        name: 'anotherObject',
        anotherBuf: Buffer.from('another test')
      }
    };

    const encoded = _Encoder().default.encode(test);

    const decoded = _Encoder().default.decode(encoded);

    expect(decoded.name).toEqual(test.name);
    expect(decoded.number).toEqual(test.number);
    expect(decoded.buf).toEqual(test.buf);
    const subObj = decoded.subObj;
    expect(subObj.name).toEqual(test.subObj.name);
    expect(subObj.anotherBuf).toEqual(test.subObj.anotherBuf);
  });
});