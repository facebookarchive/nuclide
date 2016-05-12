'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import util from 'util';

describe('aaa-nuclide', () => {
  it('print the environment', () => {
    // eslint-disable-next-line no-console
    console.log(util.inspect(process.env));

    const userConfigPath = atom.config.getUserConfigPath();
    const rawConfig = atom.config.getRawValue('', {sources: userConfigPath});

    // eslint-disable-next-line no-console
    console.log(util.inspect(rawConfig, {depth: null}));

    expect(true).toBe(true);
  });
});
