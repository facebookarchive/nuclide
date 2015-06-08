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
  GroupedResultPromise,
} from './types';

var logger;
var pathUtil = require('path');
var React = require('react-for-atom');

var QuickSelectionProvider = require('./QuickSelectionProvider');

var assign = Object.assign || require('object-assign');
var cx = require('react-classset');

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
}

function bestIconForItem(item) {
  if (!item.additionalInfo) {
    return ICONS.default;
  }
  // look for exact match
  if (ICONS[item.additionalInfo]) {
    return ICONS[item.additionalInfo];
  };
  // look for presence match, e.g. in 'static method in FooBarClass'
  for (var keyword in ICONS) {
    if (item.additionalInfo.indexOf(keyword) !== -1) {
      return ICONS[keyword];
    }
  }
  return ICONS.unknown;
}

function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

class SymbolListProvider extends QuickSelectionProvider {
  getPromptText() {
    return 'Symbol Search: prefix @ = function % = constants # = class';
  }

  async executeQuery(query: string): GroupedResultPromise {
    var {getClient} = require('nuclide-client');
    if (query.length === 0) {
      return [];
    } else {
      var queries = atom.project.getDirectories().map(async (directory) => {
        var directoryPath = directory.getPath();
        var basename = directory.getBaseName();

        var client = getClient(directoryPath);

        var url = require('url');
        var {protocol, host, path: rootDirectory} = url.parse(directoryPath);

        var allProviders = await client.getSearchProviders(rootDirectory);
        var providers = allProviders.filter(p => p.name === HACK_SEARCH_PROVIDER);
        if (!providers.length) {
          return [];
        }
        var shouldPrependBasePath = !!(protocol && host);
        var searchRequests = {};
        providers.forEach(provider => {
          var request = client.doSearchQuery(rootDirectory,  provider.name, query);
          if (shouldPrependBasePath) {
            request = request.then(
              response => {
                response.results.forEach(r => {r.path = `${protocol}//${host}${r.path}`});
                return response;
              }
            );
          }
          searchRequests[provider.name] = request;
        });
        var queries = {};
        queries[basename] = searchRequests;
        return queries;
      });

      var outputs = [];
      try {
        outputs = await Promise.all(queries);
      } catch(e) {
        getLogger().error(e);
      }
      return assign.apply(null, [{}].concat(outputs));
    }
  }

  // Returns a component with the name of the symbol on top, and the file's name on the bottom.
  // Styling based on https://github.com/atom/fuzzy-finder/blob/master/lib/fuzzy-finder-view.coffee
  getComponentForItem(item: FileResult): ReactElement {
    var filePath = item.path;
    var filename = pathUtil.basename(filePath);
    var name = item.name;

    var icon = bestIconForItem(item);
    var symbolClasses = cx('file', 'icon', icon);
    return (
      <div title={item.additionalInfo || ''}>
        <span className={symbolClasses}><code>{name}</code></span>
        <span className="omnisearch-symbol-result-filename">{filename}</span>
      </div>
    );
  }
}

module.exports = SymbolListProvider;
