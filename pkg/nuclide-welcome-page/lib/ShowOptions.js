/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {ShowAll, ShowOne} from './types';

export function showAll(): ShowAll {
  return {
    type: 'SHOW_ALL',
    args: {},
  };
}

export function showOne(topic: string): ShowOne {
  return {
    type: 'SHOW_ONE',
    args: {topic},
  };
}
