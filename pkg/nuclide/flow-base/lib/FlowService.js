'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';

import type {FlowInstance as FlowInstanceT} from './FlowInstance';

// Diagnostic information, returned from findDiagnostics.
export type Diagnostics = {
  // The location of the .flowconfig where these messages came from.
  flowRoot: NuclideUri,
  messages: Array<Diagnostic>,
};

/*
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */
export type Diagnostic = Array<SingleMessage>;

export type SingleMessage = {
  path: ?NuclideUri;
  descr: string;
  line: number;
  endline: number;
  start: number;
  end: number;
}

export type Loc = {
  file: NuclideUri;
  line: number;
  column: number;
}

import {findFlowConfigDir} from './FlowHelpers';

// string rather than NuclideUri because this module will always execute at the location of the
// file, so it will always be a real path and cannot be prefixed with nuclide://
const flowInstances: Map<string, FlowInstanceT> = new Map();

async function getInstance(file: string): Promise<?FlowInstanceT> {
  const root = await findFlowConfigDir(file);
  if (root == null) {
    return null;
  }

  let instance = flowInstances.get(root);
  if (!instance) {
    const {FlowInstance} = require('./FlowInstance');
    instance = new FlowInstance(root);
    flowInstances.set(root, instance);
  }
  return instance;
}

async function runWithInstance<T>(
  file: string,
  f: (instance: FlowInstanceT) => Promise<T>
): Promise<?T> {
  const instance = await getInstance(file);
  if (instance == null) {
    return null;
  }

  return await f(instance);
}

export function dispose(): void {
  flowInstances.forEach(instance => instance.dispose());
  flowInstances.clear();
}

export function flowFindDefinition(
  file: NuclideUri,
  currentContents: string,
  line: number,
  column: number
): Promise<?Loc> {
  return runWithInstance(
    file,
    instance => instance.flowFindDefinition(
      file,
      currentContents,
      line,
      column,
    )
  );
}

export function flowFindDiagnostics(
  file: NuclideUri,
  currentContents: ?string
): Promise<?Diagnostics> {
  return runWithInstance(
    file,
    instance => instance.flowFindDiagnostics(
      file,
      currentContents,
    )
  );
}

export function flowGetAutocompleteSuggestions(
  file: NuclideUri,
  currentContents: string,
  line: number,
  column: number,
  prefix: string,
  activatedManually: boolean,
): Promise<any> {
  return runWithInstance(
    file,
    instance => instance.flowGetAutocompleteSuggestions(
      file,
      currentContents,
      line,
      column,
      prefix,
      activatedManually,
    )
  );
}

export async function flowGetType(
  file: NuclideUri,
  currentContents: string,
  line: number,
  column: number,
  includeRawType: boolean,
): Promise<?{type: string, rawType?: string}> {
  return runWithInstance(
    file,
    instance => instance.flowGetType(
      file,
      currentContents,
      line,
      column,
      includeRawType,
    )
  );
}
