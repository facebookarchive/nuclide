"use strict";

function _featureConfig() {
  const data = _interopRequireDefault(require("../feature-config"));

  _featureConfig = function () {
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
describe('main', () => {
  it('returns numbers when numbers are set', () => {
    _featureConfig().default.set('foobar', 5);

    expect(_featureConfig().default.get('foobar')).toEqual(5);
  });
  it('returns booleans when numbers are set', () => {
    _featureConfig().default.set('cat', true);

    expect(_featureConfig().default.get('cat')).toEqual(true);
  });
  it('passes values to observers on change', () => {
    const spy = jest.fn();

    _featureConfig().default.observe('animal', spy);

    _featureConfig().default.set('animal', 'yup');

    expect(spy).toHaveBeenCalled();
  });
  it('can observeAsStream', () => {
    const spy = jest.fn();

    _featureConfig().default.observeAsStream('animal').subscribe(spy);

    _featureConfig().default.set('animal', 'yup');

    expect(spy).toHaveBeenCalled();
  });
  it('passes options to observe', () => {
    const spy = jest.fn();

    _featureConfig().default.observe('animal', {
      scope: []
    }, spy);

    _featureConfig().default.set('animal', 'yup');

    expect(spy).toHaveBeenCalled();
  });
  it('calls callbacks passed to `onDidChange`', () => {
    const spy = jest.fn();

    _featureConfig().default.onDidChange('mars.attacks', spy);

    _featureConfig().default.set('mars.attacks', 42);

    expect(spy).toHaveBeenCalled();
  });
  it('resets to defaults with "unset"', () => {
    _featureConfig().default.setSchema('purple.pants', {
      type: 'number',
      default: 15
    });

    _featureConfig().default.set('purple.pants', 25);

    expect(_featureConfig().default.get('purple.pants')).toEqual(25);

    _featureConfig().default.unset('purple.pants');

    expect(_featureConfig().default.get('purple.pants')).toEqual(15);
  });
});