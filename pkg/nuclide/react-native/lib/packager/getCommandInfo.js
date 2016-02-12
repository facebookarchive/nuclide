'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CommandInfo} from './types';

import {fsPromise} from '../../../commons';
import * as RemoteUri from '../../../remote-uri';
import ini from 'ini';
import path from 'path';
import {BuckUtils} from '../../../buck/base/lib/BuckUtils';

const {findNearestFile} = fsPromise;

/**
 * Get the command that will run the packager server based on the current workspace.
 * TODO: We need to have a solid concept of an "active project" that's consistent across Nuclide
 *       (i.e. where we should look for commands like this) and use that here. The current behavior
 *       of everything having its own algorithm is bad.
 */
export async function getCommandInfo(): Promise<?CommandInfo> {
  const localDirectories = atom.project.getDirectories()
    .map(dir => dir.getPath())
    .filter(uri => !RemoteUri.isRemote(uri));

  for (const dir of localDirectories) {
    const commandInfo =
      await getCommandFromNodePackage(dir); // eslint-disable-line babel/no-await-in-loop
    if (commandInfo != null) {
      return commandInfo;
    }
  }

  for (const dir of localDirectories) {
    const commandInfo = await getCommandFromBuck(dir); // eslint-disable-line babel/no-await-in-loop
    if (commandInfo != null) {
      return commandInfo;
    }
  }
}

async function getCommandFromNodePackage(dir: string): Promise<?CommandInfo> {
  const projectRoot = await findNearestFile('package.json', dir);
  if (projectRoot == null) {
    return null;
  }
  const filePath = path.join(projectRoot, 'package.json');
  const content = await fsPromise.readFile(filePath);
  const parsed = JSON.parse(content);
  const isReactNative = parsed.dependencies && parsed.dependencies['react-native'];
  if (!isReactNative) {
    return null;
  }

  // TODO(matthewwithanm): In the future, agree on a specifically named scripts field in
  // package.json and use that?
  const packagerScriptPath =
    path.join(projectRoot, 'node_modules', 'react-native', 'packager', 'packager.sh');
  const packagerScriptExists = await fsPromise.exists(packagerScriptPath);

  if (!packagerScriptExists) {
    return null;
  }

  return {
    cwd: projectRoot,
    command: packagerScriptPath,
  };
}

async function getCommandFromBuck(dir: string): Promise<?CommandInfo> {
  const buckUtils = new BuckUtils();
  const projectRoot = await buckUtils.getBuckProjectRoot(dir);
  if (projectRoot == null) {
    return null;
  }

  // TODO(matthewwithanm): Move this to BuckUtils?
  const filePath = path.join(projectRoot, '.buckConfig');
  const content = await fsPromise.readFile(filePath);
  const parsed = ini.parse(`scope = global\n${content}`);
  const section = parsed['react-native'];
  if (section == null || section.server == null) {
    return null;
  }
  return {
    cwd: projectRoot,
    command: section.server,
  };
}
