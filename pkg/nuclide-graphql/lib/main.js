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

import {
  graphqlLanguageService,
  resetGraphQLLanguageService,
} from './GraphQLLanguage';
import passesGK from '../../commons-node/passesGK';

export async function activate() {
  if (
    process.platform !== 'win32' &&
    !(await passesGK('nuclide_fb_graphql_vscode_ext'))
  ) {
    graphqlLanguageService.activate();
  }
}

export function deactivate(): void {
  if (process.platform !== 'win32') {
    resetGraphQLLanguageService();
  }
}
