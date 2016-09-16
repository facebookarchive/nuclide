'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as HackService from '../../nuclide-hack-rpc/lib/HackService';
import type {ServerConnection} from '../../nuclide-remote-connection';

import {getConfig} from './config';
import {getServiceByConnection} from '../../nuclide-remote-connection';
import {wordAtPosition} from '../../commons-atom/range';

const HACK_SERVICE_NAME = 'HackService';

const HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

export function getIdentifierAndRange(
  editor: atom$TextEditor,
  position: atom$Point,
): ?{id: string, range: atom$Range} {
  const matchData = wordAtPosition(editor, position, HACK_WORD_REGEX);
  return (matchData == null || matchData.wordMatch.length === 0) ? null
      : {id: matchData.wordMatch[0], range: matchData.range};
}

export function getIdentifierAtPosition(editor: atom$TextEditor, position: atom$Point): ?string {
  const result = getIdentifierAndRange(editor, position);
  return result == null ? null : result.id;
}

function initializeService(service: HackService): Promise<void> {
  const config = getConfig();
  const useIdeConnection = config.useIdeConnection;
  // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
  return service.initialize(
    config.hhClientPath,
    useIdeConnection,
    config.logLevel);
}

export async function getInitializedHackService(
  connection: ?ServerConnection,
): Promise<HackService> {
  const hackService: HackService = getServiceByConnection(HACK_SERVICE_NAME, connection);
  await initializeService(hackService);
  return hackService;
}
