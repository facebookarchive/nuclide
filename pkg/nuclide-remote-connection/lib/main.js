'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Directory as LocalDirectoryType} from 'atom';

import {RemoteConnection} from './RemoteConnection';
import {RemoteDirectory} from './RemoteDirectory';
import {RemoteFile} from './RemoteFile';
import {ServerConnection} from './ServerConnection';

import NuclideTextBuffer from './NuclideTextBuffer';

import {
  SshHandshake,
  decorateSshConnectionDelegateWithTracking,
} from './SshHandshake';

import {getFileForPath} from './client';

import {
  getService,
  getServiceByNuclideUri,
  getServiceLogger,
} from './service-manager';

export {
  RemoteConnection,
  RemoteDirectory,
  RemoteFile,
  ServerConnection,
  SshHandshake,
  NuclideTextBuffer,
  decorateSshConnectionDelegateWithTracking,
  getFileForPath,
  getService,
  getServiceByNuclideUri,
  getServiceLogger,
};

export type Directory = LocalDirectoryType | RemoteDirectory;
