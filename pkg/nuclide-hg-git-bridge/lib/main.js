'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';

import {arrayCompact} from '../../commons-node/collection';
import {diffSets} from '../../commons-node/observable';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {Observable} from 'rxjs';

export {default as repositoryContainsPath} from './repositoryContainsPath';
export {default as repositoryForPath} from './repositoryForPath';

export function getHgRepositories(): Set<HgRepositoryClient> {
  return new Set(
    arrayCompact(atom.project.getRepositories())
      .filter(repository => repository.getType() === 'hg'),
  );
}

export function getHgRepositoryStream(): Observable<HgRepositoryClient> {
  const currentRepositories =
    observableFromSubscribeFunction(atom.project.onDidChangePaths.bind(atom.project))
    .startWith(null)
    .map(() => getHgRepositories());

  return diffSets(currentRepositories).flatMap(
    repoDiff => Observable.from(repoDiff.added),
  );
}
