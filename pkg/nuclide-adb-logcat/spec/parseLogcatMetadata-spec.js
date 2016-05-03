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
import parseLogcatMetadata from '../lib/parseLogcatMetadata';

describe('parseLogcatMetadata', () => {

  const getParsed = () => {
    const parsed = parseLogcatMetadata('[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]');
    invariant(parsed);
    return parsed;
  };

  it('parses the date and time', () => {
    expect(getParsed().time).toBe('01-14 17:15:01.003');
  });

  it('parses the pid', () => {
    expect(getParsed().pid).toBe(640);
  });

  it('parses the tid', () => {
    expect(getParsed().tid).toBe(654);
  });

  it('parses the priority', () => {
    expect(getParsed().priority).toBe('I');
  });

  it('parses the tag', () => {
    expect(getParsed().tag).toBe('ProcessStatsService');
  });

});
