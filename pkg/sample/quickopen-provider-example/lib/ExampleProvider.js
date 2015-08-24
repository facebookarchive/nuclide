'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FIXTURE = ['ac', 'accumsan', 'adipiscing', 'amet', 'auctor', 'consectetur', 'dictum', 'dolor', 'efficitur', 'eget', 'elit', 'enim', 'eros', 'eu', 'Fusce', 'imperdiet', 'in', 'ipsum', 'lacus', 'leo', 'libero', 'lorem', 'Lorem', 'luctus', 'mattis', 'maximus', 'mi', 'Morbi', 'Nam', 'nec', 'non', 'Nulla', 'Nullam', 'odio', 'placerat', 'quis', 'sagittis', 'sapien', 'scelerisque', 'Sed', 'semper', 'sit', 'tellus', 'tempus', 'tincidunt', 'turpis', 'ultricies', 'Ut', 'vel', 'venenatis', 'vestibulum', 'Vestibulum', 'vitae'];

class ExampleProvider {

  // One of 'GLOBAL', 'DIRECTORY'.
  // DIRECTORY providers work in the context of a mounted directory (e.g. Hack symbol search).
  // GLOBAL providers work regardless of mounted directories (e.g. open tabs search; web requests).
  getProviderType(): string {
    return 'DIRECTORY';
  }

  /**
   * Returns the Atom action for toggling this provider. Used to render the associated keybinding.
   */
  getAction(): string {
    return 'sample-quickopen-provider-example:toggle-provider';
  }

  getDebounceDelay(): number {
    return 0;
  }

  getPromptText(): string {
    return 'Search Lorem Ipsum';
  }

  getTabTitle(): string {
    return 'IpsumSearch';
  }

  // Only required if providerType === 'DIRECTORY'
  isEligibleForDirectory(directory: atom$Directory): boolean {
    return true;
  }

  executeQuery(query: string, directory?: atom$Directory): Promise<Array<{path: string;}>> {
    if (!query.length) {
      return Promise.resolve([]);
    }
    var results = (
      FIXTURE
        .filter(f => f.indexOf(query) !== -1)
        .map(str => ({path: '/foo/bar/' + str + '.js'}))
    );
    return new Promise((resolve, reject) => {
      setTimeout(() => { resolve(results); }, 1000);
    });
  }

  /**
   * getComponentForItem Optional function that returns a React Element.
   * Useful for overriding the default view of a quick-open result.
   */
  /*
  var React = require('react-for-atom');
  getComponentForItem(item: FileResult): ReactElement {
    var {
      matchIndexes,
      path,
    } = item;
    return (
      <div className="">
        {path}
      </div>
    );
  };
  */
}

module.exports = new ExampleProvider();
