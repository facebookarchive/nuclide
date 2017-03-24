/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  FileResult,
  GlobalProviderType,
} from '../../nuclide-quick-open/lib/types';
import type {
  HackLanguageService,
  HackSearchPosition,
} from '../../nuclide-hack-rpc/lib/HackService-types';

import {getHackLanguageForUri} from './HackLanguage';
import {
  collect,
  arrayCompact,
  arrayFlatten,
} from '../../commons-node/collection';
import nuclideUri from '../../commons-node/nuclideUri';
import React from 'react';

const ICONS = {
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

function bestIconForItem(item: HackSearchPosition): string {
  if (!item.additionalInfo) {
    return ICONS.default;
  }
  // Look for exact match.
  if (ICONS[item.additionalInfo]) {
    return ICONS[item.additionalInfo];
  }
  // Look for presence match, e.g. in 'static method in FooBarClass'.
  for (const keyword in ICONS) {
    if (item.additionalInfo.indexOf(keyword) !== -1) {
      return ICONS[keyword];
    }
  }
  return ICONS.unknown;
}

async function getHackDirectoriesByService(
  directories: Array<atom$Directory>, // top-level project directories
): Promise<Array<[HackLanguageService, Array<NuclideUri>]>> {
  const promises: Array<Promise<?[HackLanguageService, NuclideUri]>> =
    directories.map(async directory => {
      const service = await getHackLanguageForUri(directory.getPath());
      return service ? [service, directory.getPath()] : null;
    });
  const serviceDirectories: Array<?[HackLanguageService, NuclideUri]> =
    await Promise.all(promises);

  const results: Map<HackLanguageService, Array<NuclideUri>> =
    collect(arrayCompact(serviceDirectories));

  return Array.from(results.entries());
}

export const HackSymbolProvider: GlobalProviderType = {
  providerType: 'GLOBAL',
  name: 'HackSymbolProvider',
  display: {
    title: 'Hack Symbols',
    prompt: 'Search Hack symbols... (e.g. @function %constant #class)',
    action: 'nuclide-hack-symbol-provider:toggle-provider',
  },

  async isEligibleForDirectories(
    directories: Array<atom$Directory>,
  ): Promise<boolean> {
    const serviceDirectories = await getHackDirectoriesByService(directories);
    const eligibilities = await Promise.all(serviceDirectories.map(
      ([service, dirs]) => service.supportsSymbolSearch(dirs),
    ));
    return eligibilities.some(e => e);
  },

  async executeQuery(
    query: string,
    directories: Array<atom$Directory>,
  ): Promise<Array<FileResult>> {
    if (query.length === 0) {
      return [];
    }

    const serviceDirectories = await getHackDirectoriesByService(directories);
    const results = await Promise.all(serviceDirectories.map(
      ([service, dirs]) => service.symbolSearch(query, dirs)));
    const flattenedResults: Array<HackSearchPosition> = arrayFlatten(results);

    return ((flattenedResults: any): Array<FileResult>);
    // Why the weird cast? Because services are expected to return their own
    // custom type with symbol-provider-specific additional detail. We upcast it
    // now to FileResult which only has the things that Quick-Open cares about
    // like line, column, ... Later on, Quick-Open invokes getComponentForItem
    // (below) to render each result: it does a downcast so it can render
    // whatever additional details.
  },

  getComponentForItem(uncastedItem: FileResult): React.Element<any> {
    const item = ((uncastedItem: any): HackSearchPosition);
    const filePath = item.path;
    const filename = nuclideUri.basename(filePath);
    const name = item.name || '';

    const icon = bestIconForItem(item);
    const symbolClasses = `file icon ${icon}`;
    return (
      <div title={item.additionalInfo || ''}>
        <span className={symbolClasses}><code>{name}</code></span>
        <span className="omnisearch-symbol-result-filename">{filename}</span>
      </div>
    );
  },
};
