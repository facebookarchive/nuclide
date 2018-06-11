/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export type SuggestedProjectPath = {
  projectPath: NuclideUri,
  suggested: boolean,
  hostLabel: string,
};

export interface DebuggerSourcePathsService {
  addKnownSubdirectoryPaths(
    remote: boolean,
    translatedPath: string,
    searchPaths: Array<string>,
  ): void;
  observeSuggestedAndroidProjectPaths(
    callback: (Array<SuggestedProjectPath>) => void,
  ): IDisposable;
}
