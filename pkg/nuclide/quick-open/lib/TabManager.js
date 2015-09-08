'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {Directory, Disposable} from 'atom';
import type {quickopen$ProviderSpec} from './types';

import {array} from 'nuclide-commons';
import {Emitter} from 'atom';

// Keep `action` in sync with listeners in main.js.
var DEFAULT_TABS: Array<quickopen$ProviderSpec> = [
  {
    providerName: 'OmniSearchResultProvider',
    title: 'All Results',
    action: 'nuclide-quick-open:toggle-omni-search',
  },
  {
    providerName: 'FileListProvider',
    title: 'Filenames',
    action: 'nuclide-quick-open:toggle-quick-open',
  },
  {
    providerName: 'OpenFileListProvider',
    title: 'Open Files',
    action: 'nuclide-quick-open:toggle-openfilename-search',
  },
];

var DYNAMIC_TABS: {[key: string]: quickopen$ProviderSpec} = {
  biggrep: {
    providerName: 'BigGrepListProvider',
    title: 'BigGrep',
    action: 'nuclide-quick-open:toggle-biggrep-search',
  },
  hack: {
    providerName: 'SymbolListProvider',
    title: 'Symbols',
    action: 'nuclide-quick-open:toggle-symbol-search',
  },
};

async function getServicesForDirectory(directory: Directory): Promise<Array<{name:string}>> {
  var {getClient} = require('nuclide-client');
  var directoryPath = directory.getPath();
  var client = getClient(directoryPath);
  if (!client) {
    // If the RemoteConnection for the Directory has not been re-established yet, then `client` may
    // be null. For now, we just ignore this, but ideally we would find a way to register a listener
    // that notifies us when the RemoteConnection is created that runs updateRenderableTabs().
    return [];
  }

  var remoteUri = require('nuclide-remote-uri');
  var {path: rootDirectory} = remoteUri.parse(directoryPath);
  return await client.getSearchProviders(rootDirectory);
}

function getEligibleServices(): Promise<Array<Array<{name:string}>>> {
  var directories = atom.project.getDirectories();
  var services = directories.map(getServicesForDirectory);
  return Promise.all(services);
}

var DID_CHANGE_TABS_EVENT = 'did-change-tabs';

class TabManager {
  _tabsToRender: Array<quickopen$ProviderSpec>;
  _getEligibleServices: () => Promise<Array<Array<{name:string}>>>;
  _emitter: Emitter;
  _subscription: Disposable;

  constructor(
    getEligibleServicesFn: () => Promise<Array<Array<{name:string}>>> = getEligibleServices
  ) {
    this._tabsToRender = DEFAULT_TABS.slice();
    this._getEligibleServices = getEligibleServicesFn;
    this._emitter = new Emitter();
    this._subscription = atom.project.onDidChangePaths(() => this._updateRenderableTabs());
    this._updateRenderableTabs(); // Note this is asynchronous.
  }

  /**
   * Gets the last known list of tabs to render synchronously.
   * @return an array that should not be modified by the client. We would declare the return type
   *     to be `Iterable<quickopen$ProviderSpec>` to underscore this point, but that would be
   *     inconvenient because then the return value would not have its own `.map()` method.
   */
  getTabs(): Array<quickopen$ProviderSpec> {
    return this._tabsToRender;
  }

  /** @return the tab that should have focus, by default. */
  getDefaultTab(): quickopen$ProviderSpec {
    return this._tabsToRender[0];
  }

  /**
   * Subscribe to be notified when the list of tabs changes.
   * @param callback The return value will be ignored.
   * @return Disposable that can be used to remove this subscription.
   */
  onDidChangeTabs(callback: (newTabs: Array<quickopen$ProviderSpec>) => mixed): Disposable {
    return this._emitter.on(DID_CHANGE_TABS_EVENT, callback);
  }

  async _updateRenderableTabs(): Promise<void> {
    var services = await this._getEligibleServices();

    // Array<Array<{name:string}>> => Array<{name:string}>.
    var flattenedServices = Array.prototype.concat.apply([], services);
    var dynamicTabs = flattenedServices
      .filter(service => DYNAMIC_TABS.hasOwnProperty(service.name))
      .map(service => DYNAMIC_TABS[service.name]);

    // Insert dynamic tabs at index 1 (after the OmniSearchProvider).
    var tabsToRender = DEFAULT_TABS.slice();
    tabsToRender.splice(1, 0, ...dynamicTabs);

    if (this._isNewListOfTabs(tabsToRender)) {
      this._tabsToRender = tabsToRender;
      this._emitter.emit(DID_CHANGE_TABS_EVENT, tabsToRender);
    }
  }

  /** @return  */
  _isNewListOfTabs(tabsToRender: Array<quickopen$ProviderSpec>): boolean {
    var existingTabs = this._tabsToRender;
    if (existingTabs.length !== tabsToRender.length) {
      return true;
    }

    var mismatchedTab = array.find(
      existingTabs,
      (oldTab: quickopen$ProviderSpec, index: number) => {
        var newTab = tabsToRender[index];
        if (oldTab.providerName !== newTab.providerName) {
          return newTab;
        }
      });
    return !!mismatchedTab;
  }

  /**
   * In practice, it is unlikely that this will ever be called because TabManager is exposed as a
   * singleton. Nevertheless, it is here for completeness/unit testing.
   */
  dispose() {
    this._subscription.dispose();
    this._emitter.dispose();
  }
}

var instance;

module.exports = {
  /** Clients of TabManager should prefer using getInstance() to creating a TabManager directly. */
  getInstance(): TabManager {
    if (!instance) {
      instance = new TabManager();
    }
    return instance;
  },

  /** Exclusively for use with `import type` and unit tests. */
  TabManager,
};
