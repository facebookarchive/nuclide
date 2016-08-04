'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import typeof * as ArcanistService from '../../nuclide-arcanist-rpc';
import typeof * as FileSystemService from '../../nuclide-server/lib/services/FileSystemService';

import nullthrows from 'nullthrows';

import {RemoteConnection} from './RemoteConnection';
import {RemoteDirectory} from './RemoteDirectory';
import {RemoteFile} from './RemoteFile';
import {ServerConnection} from './ServerConnection';
import NuclideTextBuffer from './NuclideTextBuffer';

import {
  SshHandshake,
  decorateSshConnectionDelegateWithTracking,
} from './SshHandshake';

import {
  getService,
  getServiceByNuclideUri,
} from './service-manager';

export {
  RemoteConnection,
  RemoteDirectory,
  RemoteFile,
  ServerConnection,
  SshHandshake,
  NuclideTextBuffer,
  decorateSshConnectionDelegateWithTracking,
  getService,
  getServiceByNuclideUri,
};

export function getFileSystemServiceByNuclideUri(uri: NuclideUri): FileSystemService {
  return nullthrows(getServiceByNuclideUri('FileSystemService', uri));
}

export function getArcanistServiceByNuclideUri(uri: NuclideUri): ArcanistService {
  return nullthrows(getServiceByNuclideUri('ArcanistService', uri));
}
