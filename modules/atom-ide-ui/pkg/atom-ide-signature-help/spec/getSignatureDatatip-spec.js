/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import {Point, Range} from 'atom';
import getSignatureDatatip from '../lib/getSignatureDatatip';

describe('getSignatureDatatip', () => {
  const point = new Point(0, 0);
  const range = new Range(point, point);

  it('is able to escape markdown in the label', () => {
    expect(
      getSignatureDatatip(
        {
          signatures: [
            {
              label: 'f<T>(__arg__, *args, **kwargs)',
              documentation: '**real markdown**',
              parameters: [
                {
                  label: '**kwargs',
                  documentation: 'parameter test',
                },
              ],
            },
          ],
        },
        point,
      ),
    ).toEqual({
      markedStrings: [
        {
          type: 'markdown',
          value: 'f&lt;T&gt;\\(\\_\\_arg\\_\\_, \\*args, **\\*\\*kwargs**\\)',
        },
        {type: 'markdown', value: 'parameter test'},
        {type: 'markdown', value: '**real markdown**'},
      ],
      range,
    });
  });

  it('is able to bolden ambiguous parameters', () => {
    expect(
      getSignatureDatatip(
        {
          signatures: [
            {
              label: 'path(path, path, path)',
              parameters: [{label: 'path'}, {label: 'path'}, {label: 'path'}],
            },
          ],
          activeParameter: 1,
        },
        point,
      ),
    ).toEqual({
      markedStrings: [
        {type: 'markdown', value: 'path\\(path, **path**, path\\)'},
      ],
      range,
    });
  });
});
