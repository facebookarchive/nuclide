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

export type HackDiagnosticsResult = {
  // The location of the .hhconfig where these messages came from.
  hackRoot: NuclideUri;
  messages: Array<{
    message: HackDiagnostic;
  }>;
};

/**
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */
export type HackDiagnostic = Array<SingleHackMessage>;

export type SingleHackMessage = {
  path: NuclideUri;
  descr: string;
  code: number;
  line: number;
  start: number;
  end: number;
};

export type HackFunctionDetails = {
  params: Array<{name: string}>;
};

export type HackCompletion = {
  name: string;
  type: string;
  pos: {
    filename: NuclideUri,
    line: number;
    char_start: number;
    char_end: number;
  };
  func_details: ?HackFunctionDetails;
};

export type HackCompletionsResult = {
  hackRoot: NuclideUri;
  completions: Array<HackCompletion>;
};
