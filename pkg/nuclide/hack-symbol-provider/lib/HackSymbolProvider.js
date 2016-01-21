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
} from '../../quick-open-interfaces';
import type {HackSearchPosition} from '../../hack-base/lib/HackService';

import {getHackSearchService} from './getHackSearchService';
import path from 'path';
import React from 'react-for-atom';

export type HackFileResult = FileResult & HackSearchPosition;

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

function bestIconForItem(item: HackFileResult): string {
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

export const HackSymbolProvider: Provider<HackFileResult> = {

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

  async isEligibleForDirectory(directory: atom$Directory): Promise<boolean> {
    const service = await getHackSearchService(directory);
    return service != null;
  },

  async executeQuery(
    query: string,
    directory?: atom$Directory
  ): Promise<Array<HackFileResult>> {
    if (query.length === 0 || directory == null) {
      return [];
    }

    const service = await getHackSearchService(directory);
    if (service == null) {
      return [];
    }

    const directoryPath = directory.getPath();
    return (await service.queryHack(directoryPath, query): Array<HackFileResult>);
  },

  getComponentForItem(item: HackFileResult): ReactElement {
    const filePath = item.path;
    const filename = path.basename(filePath);
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
