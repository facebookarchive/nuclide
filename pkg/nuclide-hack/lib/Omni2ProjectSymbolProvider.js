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

// $FlowFB
import type {
  ProjectSymbolSearchProvider,
  ProjectSymbol,
} from '../../fb-go-to-project-symbol-omni2-provider/lib/types';

import {Observable} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getHackLanguageForUri} from './HackLanguage';

const Omni2ProjectSymbolProvider: ProjectSymbolSearchProvider = {
  searchSymbolsForDirectory(
    query: string,
    directory: atom$Directory,
    callback: (Array<ProjectSymbol>) => mixed,
  ): IDisposable {
    const directoryPath = directory.getPath();

    const results = Observable.defer(() => getHackLanguageForUri(directoryPath))
      .switchMap(
        service =>
          service == null
            ? Observable.of([])
            : service.symbolSearch(query, [directoryPath]),
      )
      .map(searchResults => searchResults || [])
      .catch(() => Observable.of([]));

    return new UniversalDisposable(results.subscribe(callback));
  },
};

export default Omni2ProjectSymbolProvider;
