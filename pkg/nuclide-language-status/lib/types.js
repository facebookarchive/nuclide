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

import type {Observable} from 'rxjs';
import type {StatusData} from '../../nuclide-language-service/lib/LanguageService';

export type LanguageStatusProvider = {
  name: string,
  grammarScopes: Array<string>,
  priority: number,

  observeStatus(editor: TextEditor): Promise<?Observable<StatusData>>,
};
