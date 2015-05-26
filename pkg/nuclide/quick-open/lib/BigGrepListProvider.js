'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var logger;
var pathUtil = require('path');
var React = require('react-for-atom');

var {QuickSelectionProvider} = require('./QuickSelectionProvider');

const BIGGREP_SEARCH_PROVIDER = 'biggrep';

function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

class BigGrepListProvider extends QuickSelectionProvider {
  getPromptText() {
    return 'Big Grep Search';
  }

  async executeQuery(query: string): Promise<Array<FileResult>> {
    var {getClient} = require('nuclide-client');
    if (query.length === 0) {
      return [];
    } else {
      var url = require('url');
      var {find} = require('nuclide-commons').array;
      var queries = atom.project.getDirectories().map(async (directory) => {
        var directoryPath = directory.getPath();
        var client = getClient(directoryPath);

        var {protocol, host, path: rootDirectory} = url.parse(directoryPath);
        var providers = await client.getSearchProviders(rootDirectory);

        if (!find(providers, (p) => p.name === BIGGREP_SEARCH_PROVIDER)) {
          return [];
        }
        var {results} = await client.doSearchQuery(rootDirectory, BIGGREP_SEARCH_PROVIDER, query);

        // If this is a remote file, prepend protocol://host to path.
        if (protocol && host) {
          results.forEach(r => r.path = `${protocol}//${host}${r.path}`);
        }

        return results;
      });

      var outputs = [];
      try {
        outputs = await Promise.all(queries);
      } catch(e) {
        getLogger().error(e);
      }

      // Flattens results.
      return [].concat.apply([], outputs);
    }
  }

  // Returns a component with the name of the symbol on top, and the file's name on the bottom.
  // Styling based on https://github.com/atom/fuzzy-finder/blob/master/lib/fuzzy-finder-view.coffee
  getComponentForItem(item: FileResult): ReactElement {
    var filePath = item.path;
    var filename = pathUtil.basename(filePath);
    var context = item.context;

    var nameClasses = ['primary-line', 'file', 'icon', 'icon-file-text'].join(' ');
    var fileClasses = ['secondary-line', 'path', 'no-icon'].join(' ');

    return (
      <div className={'two-lines'}>
        <div className={nameClasses}>{filename}</div>
        <div className={fileClasses}>{context}</div>
      </div>
    );
  }
}

module.exports = BigGrepListProvider;
