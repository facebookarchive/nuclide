/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

jest.disableAutomock();

import {flattenPHPQueryData} from '../flattenPHPQueryData.js';

describe('flattenPHPQueryData', () => {
  it('should flatten shallow objects', () => {
    const dataObject = {
      id: 1,
      fruit: 'mellon',
    };

    const flattenedObject = flattenPHPQueryData(dataObject);
    expect(flattenedObject).toEqual(dataObject);
  });

  it('should not encode the data', () => {
    const dataObject = {
      message: 'A message with spaces',
    };

    const flattenedObject = flattenPHPQueryData(dataObject);
    expect(flattenedObject).toEqual(dataObject);
  });

  it('should not ignore null or undefined values', () => {
    const dataObject = {
      pid: undefined,
      vid: null,
    };
    const expectedObject = {
      vid: undefined,
    };

    const flattenedObject = flattenPHPQueryData(dataObject);
    expect(flattenedObject).toEqual(expectedObject);
  });

  it('should flatten arrays', () => {
    const dataObject = {
      vector: [1, 2],
    };
    const expectedObject = {
      'vector[0]': 1,
      'vector[1]': 2,
    };

    const flattenedObject = flattenPHPQueryData(dataObject);
    expect(flattenedObject).toEqual(expectedObject);
  });

  it('should flatten nested arrays', () => {
    const dataObject = {
      matrix: [[1, 2], [3, 4]],
    };
    const expectedObject = {
      'matrix[0][0]': 1,
      'matrix[0][1]': 2,
      'matrix[1][0]': 3,
      'matrix[1][1]': 4,
    };

    const flattenedObject = flattenPHPQueryData(dataObject);
    expect(flattenedObject).toEqual(expectedObject);
  });

  it('should flatten objects', () => {
    const dataObject = {
      fruit: {
        name: 'mellon',
        color: 'green',
      },
    };
    const expectedObject = {
      'fruit[name]': 'mellon',
      'fruit[color]': 'green',
    };

    const flattenedObject = flattenPHPQueryData(dataObject);
    expect(flattenedObject).toEqual(expectedObject);
  });

  it('should flatten nested objects', () => {
    const dataObject = {
      fruit: {
        mellon: {
          color: 'green',
        },
      },
    };
    const expectedObject = {
      'fruit[mellon][color]': 'green',
    };

    const flattenedObject = flattenPHPQueryData(dataObject);
    expect(flattenedObject).toEqual(expectedObject);
  });

  it('should flatten nested structured', () => {
    const dataObject = {
      oid: '',
      audience: [
        {
          friends: '30',
          ids: ['1234567890'],
        },
      ],
    };
    const expectedObject = {
      oid: '',
      'audience[0][friends]': '30',
      'audience[0][ids][0]': '1234567890',
    };

    const flattenedObject = flattenPHPQueryData(dataObject);
    expect(flattenedObject).toEqual(expectedObject);
  });

  it('should serialize even if magic methods are defined', () => {
    const serializedData = flattenPHPQueryData({hasOwnProperty: 1});
    expect(serializedData).toEqual({hasOwnProperty: 1});
  });
});
