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
var SymbolListProvider = require('./SymbolListProvider');
var BigGrepListProvider = require('./BigGrepListProvider');
var FileListProvider = require('./FileListProvider');
var OpenFileListProvider = require('./OpenFileListProvider');

var assign = Object.assign || require('object-assign');

var MAX_RESULTS_PER_SERVICE = 5;
var CUSTOM_RENDERERS = {
  hack: SymbolListProvider,
  biggrep: BigGrepListProvider,
  filelist: FileListProvider,
  openfiles: OpenFileListProvider,
};

class OmniSearchResultProvider extends QuickSelectionProvider {
  getPromptText() {
    return 'Search for anything...';
  }

  async executeQuery(query: string): GroupedResultPromise {
    if (query.length === 0) {
      return {
        workspace: {
          openfiles: require('./OpenFileListProvider').getOpenTabsForQuery(query)
        }
      };
    } else {
      var queries = atom.project.getDirectories().map(
        async(directory) => this._getQueriesForDirectory(query, directory)
      );

      queries.push(Promise.resolve({
        workspace: {
          openfiles: require('./OpenFileListProvider').getOpenTabsForQuery(query),
        },
      }));

      try {
        var outputs = await Promise.all(queries);
      } catch(e) {
        this.getLogger().error(e);
      }
      return assign.apply(null, [{}].concat(outputs));
    }
  }

  async _getQueriesForDirectory(query: string, directory: any): any {
    var {getClient} = require('nuclide-client');
    var directoryPath = directory.getPath();
    var basename = directory.getBaseName();
    var client = getClient(directoryPath);

    var url = require('url');
    var {protocol, host, path: rootDirectory} = url.parse(directoryPath);
    var providers = await client.getSearchProviders(rootDirectory);

    var searchRequests = {};
    // fileName search
    searchRequests.filelist = client.searchDirectory(directoryPath, query)
      .then(files => {
        return {
          results: files.slice(0, MAX_RESULTS_PER_SERVICE)
        };
      });
    var shouldPrependBasePath = !!(protocol && host);
    providers.forEach(provider => {
      searchRequests[provider.name] =
        client
          .doSearchQuery(rootDirectory, provider.name, query)
          .then(
            results => assign(
              {},
              results,
              {
                results: results
                  .results
                  .slice(0, MAX_RESULTS_PER_SERVICE)
                  .map(r => {
                    r.path = shouldPrependBasePath ? `${protocol}//${host}${r.path}` : r.path;
                    return r;
                  })
              }
            )
          );
    });
    var queryMap = {};
    queryMap[basename] = searchRequests;
    return queryMap;
  }

  getComponentForItem(item: FileResult, serviceName: ?string): ReactElement {

    var customRenderer = CUSTOM_RENDERERS[serviceName];
    if (customRenderer) {
      return (new customRenderer()).getComponentForItem(item);
    }
    var filename = pathUtil.basename(item.path);

    return (
      <div className="file icon icon-file-text">
        {filename}
      </div>
    );
  }

  getLogger() {
    if (!logger) {
      logger = require('nuclide-logging').getLogger();
    }
    return logger;
  }
}

module.exports = OmniSearchResultProvider;
