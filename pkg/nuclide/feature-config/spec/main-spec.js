'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import nuclideFeatureConfig from '../lib/main';

describe('main', () => {
  it('returns numbers when numbers are set', () => {
    nuclideFeatureConfig.set('foobar', 5);
    expect(nuclideFeatureConfig.get('foobar')).toEqual(5);
  });

  it('returns booleans when numbers are set', () => {
    nuclideFeatureConfig.set('cat', true);
    expect(nuclideFeatureConfig.get('cat')).toEqual(true);
  });

  it('passes values to observers on change', () => {
    const spy = jasmine.createSpy('spy');
    nuclideFeatureConfig.observe('animal', spy);
    nuclideFeatureConfig.set('animal', 'yup');
    expect(spy).toHaveBeenCalled();
  });

  it('calls callbacks passed to `onDidChange`', () => {
    const spy = jasmine.createSpy('willis');
    nuclideFeatureConfig.onDidChange('mars.attacks', spy);
    nuclideFeatureConfig.set('mars.attacks', 42);
    expect(spy).toHaveBeenCalled();
  });
});
