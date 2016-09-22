'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Provider,
  ProviderType,
} from '../../nuclide-quick-open/lib/types';
import type {
  FileResult,
} from '../../nuclide-quick-open/lib/rpc-types';

const FIXTURE = [
  'ac', 'accumsan', 'adipiscing', 'amet', 'auctor', 'consectetur', 'dictum', 'dolor', 'efficitur',
  'eget', 'elit', 'enim', 'eros', 'eu', 'Fusce', 'imperdiet', 'in', 'ipsum', 'lacus', 'leo',
  'libero', 'lorem', 'Lorem', 'luctus', 'mattis', 'maximus', 'mi', 'Morbi', 'Nam', 'nec', 'non',
  'Nulla', 'Nullam', 'odio', 'placerat', 'quis', 'sagittis', 'sapien', 'scelerisque', 'Sed',
  'semper', 'sit', 'tellus', 'tempus', 'tincidunt', 'turpis', 'ultricies', 'Ut', 'vel', 'venenatis',
  'vestibulum', 'Vestibulum', 'vitae',
];

const ExampleProvider: Provider = {

  /**
   * A unique name, used internally by quick-open to store cached results.
   */
  getName(): string {
    return 'ExampleProvider';
  },

  /**
   * One of 'GLOBAL', 'DIRECTORY'.
   * DIRECTORY providers work in the context of a mounted directory (e.g. Hack symbol search).
   * GLOBAL providers work regardless of mounted directories (e.g. open tabs search; web requests).
   */
  getProviderType(): ProviderType {
    return 'DIRECTORY';
  },

  /**
   * Whether this provider can render in a dedicated tab. If returning `false`, results from the
   * provider will only be shown in the OmniSearch result list.
   * If returning `true`, the provider should also provide the `getPromptText` and `getTabTitle`
   * methods.
   */
  isRenderable(): boolean {
    return true;
  },

  /**
   * Returns the Atom action for toggling this provider. Used to render the associated keybinding.
   * Only applies to renderable providers.
   */
  getAction(): string {
    return 'sample-quickopen-provider-example:toggle-provider';
  },

  /**
   * Optional: return a specific delay (in ms) used to debounce queries to this provider.
   * Default: 200ms. Useful for e.g. reducing the delay for cheap queries (e.g. opened files).
   */
  getDebounceDelay(): number {
    return 0;
  },

  /**
   * Shown as a placeholder in the query input.
   * Only applies to renderable providers.
   */
  getPromptText(): string {
    return 'Search Lorem Ipsum';
  },

  /**
   * The title of the quick-open tab that exclusively contains results from this provider.
   */
  getTabTitle(): string {
    return 'IpsumSearch';
  },

  /**
   * Only required if providerType === 'DIRECTORY'.
   */
  isEligibleForDirectory(directory: atom$Directory): Promise<boolean> {
    return Promise.resolve(true);
  },

  /**
   * Return the actual search results.
   */
  executeQuery(query: string, directory?: atom$Directory): Promise<Array<FileResult>> {
    if (!query.length) {
      return Promise.resolve([]);
    }
    const results = (
      FIXTURE
        .filter(f => f.indexOf(query) !== -1)
        .map(str => ({path: '/foo/bar/' + str + '.js'}))
    );
    return new Promise((resolve, reject) => {
      setTimeout(() => { resolve(results); }, 1000);
    });
  },

  /**
   * getComponentForItem Optional function that returns a React Element.
   * Useful for overriding the default view of a quick-open result.
   */
  // import {React} from 'react-for-atom';
  // getComponentForItem(item: FileResult): React.Element {
  //   var {
  //     matchIndexes,
  //     path,
  //   } = item;
  //   return (
  //     <div className="">
  //       {path}
  //     </div>
  //   );
  // };
};

module.exports = ExampleProvider;
