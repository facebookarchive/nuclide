/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  FileResult,
  Provider,
} from '../../nuclide-quick-open/lib/types';
import type {
  HackSearchPosition,
  HackLanguageService,
} from '../../nuclide-hack-rpc/lib/HackService-types';

import {isFileInHackProject, getHackLanguageForUri} from './HackLanguage';
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

export const HackSymbolProvider: Provider = {
  providerType: 'DIRECTORY',
  name: 'HackSymbolProvider',
  display: {
    title: 'Hack Symbols',
    prompt: 'Search Hack symbols... (e.g. @function %constant #class)',
    action: 'nuclide-hack-symbol-provider:toggle-provider',
  },

  isEligibleForDirectory(directory: atom$Directory): Promise<boolean> {
    return isFileInHackProject(directory.getPath());
  },

  async executeQuery(
    query: string,
    directory: atom$Directory,
  ): Promise<Array<FileResult>> {
    if (query.length === 0) {
      return [];
    }

    const service: ?HackLanguageService = await getHackLanguageForUri(directory.getPath());
    if (service == null) {
      return [];
    }

    const directoryPath = directory.getPath();
    const results: Array<HackSearchPosition> = await service.executeQuery(directoryPath, query);
    return ((results: any): Array<FileResult>);
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
