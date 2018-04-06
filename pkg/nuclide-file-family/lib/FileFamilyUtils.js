/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {FileGraph} from './types';

import {arrayUnique} from 'nuclide-commons/collection';

export function getAlternatesFromGraph(graph: FileGraph, activeUri: string) {
  return arrayUnique(
    graph.relations
      .filter(
        r =>
          r.from === activeUri &&
          (r.labels.has('test') || r.labels.has('alternate')),
      )
      .map(relation => relation.to),
  );
}
