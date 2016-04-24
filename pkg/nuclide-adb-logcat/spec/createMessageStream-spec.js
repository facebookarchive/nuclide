'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import createMessageStream from '../lib/createMessageStream';
import Rx from 'rxjs';

describe('createMessageStream', () => {

  it('splits the output by message', () => {
    waitsForPromise(async () => {
      const output$ = Rx.Observable.from([
        '[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]',
        'Prepared write state in 0ms',
        '',
        '[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]',
        'Prepared write state in 0ms',
        '',
      ]);

      const message$ =  createMessageStream(output$)
        .map(message => message.text)
        .toArray();

      const messages = await message$.toPromise();
      expect(messages.length).toBe(2);
      messages.forEach(message => {
        expect(message).toBe('Prepared write state in 0ms');
      });
    });
  });

});
