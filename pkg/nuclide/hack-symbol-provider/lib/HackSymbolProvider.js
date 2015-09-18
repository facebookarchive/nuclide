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
  FileResult,
  Provider,
  ProviderType,
} from 'nuclide-quick-open-interfaces';

var path = require('path');
var React = require('react-for-atom');

var HACK_SEARCH_PROVIDER = 'hack';

var ICONS = {
  'interface': 'icon-puzzle',
  'function': 'icon-zap',
  'method': 'icon-zap',
  'typedef': 'icon-tag',
  'class': 'icon-code',
  'abstract class': 'icon-code',
  'constant': 'icon-quote',
  'trait': 'icon-checklist',
  'enum': 'icon-file-binary',
  'default': 'no-icon',
  'unknown': 'icon-squirrel',
};

function bestIconForItem(item: FileResult): string {
  if (!item.additionalInfo) {
    return ICONS.default;
  }
  // Look for exact match.
  if (ICONS[item.additionalInfo]) {
    return ICONS[item.additionalInfo];
  }
  // Look for presence match, e.g. in 'static method in FooBarClass'.
  for (var keyword in ICONS) {
    if (item.additionalInfo.indexOf(keyword) !== -1) {
      return ICONS[keyword];
    }
  }
  return ICONS.unknown;
}

var HackSymbolProvider: Provider = {

  getName(): string {
    return 'HackSymbolProvider';
  },

  getProviderType(): ProviderType {
    return 'DIRECTORY';
  },

  isRenderable(): boolean {
    return true;
  },

  getAction(): string {
    return 'nuclide-hack-symbol-provider:toggle-provider';
  },

  getPromptText(): string {
    return 'Search Hack symbols. Available prefixes: @function %constant #class';
  },

  getTabTitle(): string {
    return 'Hack Symbols';
  },

  isEligibleForDirectory(directory: atom$Directory): boolean {
    return true;
  },

  async executeQuery(query: string, directory: atom$Directory): Promise<Array<FileResult>> {
    if (query.length === 0) {
      return [];
    }
    var directoryPath = directory.getPath();
    var {getClient} = require('nuclide-client');
    var client = getClient(directoryPath);
    if (client == null) {
      return [];
    }
    var remoteUri = require('nuclide-remote-uri');
    var {protocol, hostname, path: rootDirectory} = remoteUri.parse(directoryPath);
    var allProviders = await client.getSearchProviders(rootDirectory);
    if (!allProviders.some(p => p.name === HACK_SEARCH_PROVIDER)) {
      return [];
    }
    var request = await client.doSearchQuery(rootDirectory, HACK_SEARCH_PROVIDER, query);
    var shouldPrependBasePath = !!(protocol && hostname);
    if (shouldPrependBasePath) {
      return request.results.map(result => ({
        ...result,
        path: `${protocol}//${hostname}${result.path}`,
      }));
    }
    return request.results;
  },

  getComponentForItem(item: FileResult): ReactElement {
    var filePath = item.path;
    var filename = path.basename(filePath);
    var name = item.name || '';

    var icon = bestIconForItem(item);
    var symbolClasses = `file icon ${icon}`;
    return (
      <div title={item.additionalInfo || ''}>
        <span className={symbolClasses}><code>{name}</code></span>
        <span className="omnisearch-symbol-result-filename">{filename}</span>
      </div>
    );
  },
};

module.exports = HackSymbolProvider;
