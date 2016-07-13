'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Immutable from 'immutable';
import type {NuclideUri} from '../../nuclide-remote-uri';

export type BookShelfState = {
  repositoryPathToState: Immutable.Map<NuclideUri, BookShelfRepositoryState>;
};

export type SerializedBookShelfState = {
  repositoryPathToState: Array<[string, SerializedBookShelfRepositoryState]>;
};

export type BookShelfRepositoryState = {
  activeShortHead: string;
  isRestoring: boolean;
  shortHeadsToFileList: Immutable.Map<string, Array<NuclideUri>>;
};

export type SerializedBookShelfRepositoryState = {
  activeShortHead: string;
  shortHeadsToFileList: Array<[string, Array<string>]>;
};
