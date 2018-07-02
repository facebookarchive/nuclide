"use strict";

var _atom = require("atom");

function _getSignatureDatatip() {
  const data = _interopRequireDefault(require("../lib/getSignatureDatatip"));

  _getSignatureDatatip = function () {
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
 *  strict-local
 * @format
 */
describe('getSignatureDatatip', () => {
  const point = new _atom.Point(0, 0);
  const range = new _atom.Range(point, point);
  it('is able to escape markdown in the label', () => {
    expect((0, _getSignatureDatatip().default)({
      signatures: [{
        label: 'f<T>(__arg__, *args, **kwargs)',
        documentation: '**real markdown**',
        parameters: [{
          label: '**kwargs',
          documentation: 'parameter test'
        }]
      }]
    }, point)).toEqual({
      markedStrings: [{
        type: 'markdown',
        value: 'f&lt;T&gt;\\(\\_\\_arg\\_\\_, \\*args, <u>**\\*\\*kwargs**</u>\\)'
      }, {
        type: 'markdown',
        value: 'parameter test'
      }, {
        type: 'markdown',
        value: '**real markdown**'
      }],
      range
    });
  });
  it('is able to bolden ambiguous parameters', () => {
    expect((0, _getSignatureDatatip().default)({
      signatures: [{
        label: 'path(path, path, path)',
        parameters: [{
          label: 'path'
        }, {
          label: 'path'
        }, {
          label: 'path'
        }]
      }],
      activeParameter: 1
    }, point)).toEqual({
      markedStrings: [{
        type: 'markdown',
        value: 'path\\(path, <u>**path**</u>, path\\)'
      }],
      range
    });
  });
});