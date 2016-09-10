'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {observeStream} from '../stream';
import Stream from 'stream';

describe('commons-node/stream', () => {

  it('observeStream', () => {
    waitsForPromise(async () => {
      const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
      const stream = new Stream.PassThrough();
      const promise = observeStream(stream).toArray().toPromise();
      input.forEach(value => { stream.write(value, 'utf8'); });
      stream.end();
      const output = await promise;
      expect(output.join('')).toEqual(input.join(''));
    });
  });

  it('observeStream - error', () => {
    waitsForPromise(async () => {
      const stream = new Stream.PassThrough();
      const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
      const output = [];
      const promise = new Promise((resolve, reject) => {
        observeStream(stream).subscribe(
          v => output.push(v),
          e => resolve(e),
          () => {},
        );
      });
      const error = new Error('Had an error');

      input.forEach(value => { stream.write(value, 'utf8'); });
      stream.emit('error', error);

      const result = await promise;
      expect(output).toEqual(input);
      expect(result).toBe(error);
    });
  });

});
