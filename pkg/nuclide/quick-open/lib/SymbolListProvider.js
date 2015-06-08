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

const HACK_SEARCH_PROVIDER = 'hack';

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
        return {[basename]: searchRequests};
      });

      var outputs = [];
      try {
        outputs = await Promise.all(queries);
      } catch(e) {
        this.getLogger().error(e);
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

   // TODO(mikeo): add new icons based on the type of symbol
   var nameClasses = ['primary-line', 'file', 'icon', 'icon-file-text'].join(' ');
   var fileClasses = ['secondary-line', 'path', 'no-icon'].join(' ');

   return (
     <div className={'two-lines'}>
       <div className={nameClasses}>{name}</div>
       <div className={fileClasses}>{filename}</div>
     </div>
   );
  }

  getLogger() {
   return logger || require('nuclide-logging').getLogger();
  }
}

module.exports = SymbolListProvider;
