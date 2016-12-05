'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DeepLinkParams} from '../../nuclide-deep-link/lib/types';
import type {RemoteProjectsService} from '../../nuclide-remote-projects';

import invariant from 'assert';
import {goToLocation} from '../../commons-atom/go-to-location';
import nuclideUri from '../../commons-node/nuclideUri';
import {asyncFilter} from '../../commons-node/promise';
import {
  getArcanistServiceByNuclideUri,
  getFileSystemServiceByNuclideUri,
} from '../../nuclide-remote-connection';

function ensureArray(x: string | Array<string>): Array<string> {
  return typeof x === 'string' ? [x] : x;
}

export async function openArcDeepLink(
  params: DeepLinkParams,
  remoteProjectsService: ?RemoteProjectsService,
): Promise<void> {
  const {project, path, line, column} = params;
  try {
    invariant(typeof project === 'string', 'Must provide an Arcanist project');
    invariant(path, 'Must provide a valid path');

    if (remoteProjectsService != null) {
      await new Promise(resolve => remoteProjectsService.waitForRemoteProjectReload(resolve));
    }

    // Fetch the Arcanist project of each open project.
    // This also gets parent projects, in case we have a child project mounted.
    const arcInfos = await Promise.all(atom.project.getPaths().map(async dir => {
      const arcService = getArcanistServiceByNuclideUri(dir);
      const matches = [];
      let currentDir = dir;
      for (;;) {
        const info = await arcService.findArcProjectIdAndDirectory(currentDir);
        if (info == null) {
          break;
        }
        matches.push(info);
        currentDir = nuclideUri.dirname(info.directory);
      }
      return matches;
    }));

    const matches = []
      .concat(...arcInfos)
      .filter(Boolean)
      .filter(arcInfo => arcInfo.projectId === project);

    if (matches.length === 0) {
      // TODO: send URL to other windows if they exist
      // TODO: remember previous directories for this arcanist project
      throw new Error(
        `The file you are trying to open is in the \`${project}\` project ` +
        'but you do not have the project open.<br />' +
        'Please add the project manually and try again.',
      );
    }

    // Params can be strings or arrays. Always convert to an array
    const paths = ensureArray(path);
    const lines = line == null ? null : ensureArray(line);
    const columns = column == null ? null : ensureArray(column);

    // If there are multiple matches, prefer one which contains the first file.
    // Otherwise, we still want to support the case of opening a new file.
    let match = matches[0];
    if (matches.length > 1) {
      const existing = await asyncFilter(matches, async arcInfo => {
        const {directory} = arcInfo;
        const fsService = getFileSystemServiceByNuclideUri(directory);
        return fsService.exists(nuclideUri.join(nuclideUri.getPath(directory), paths[0]));
      });
      match = existing[0] || match;
    }

    for (let i = 0; i < paths.length; i++) {
      const localPath = nuclideUri.join(match.directory, paths[i]);
      const intLine = lines == null ? undefined : parseInt(lines[i], 10) - 1;
      const intColumn = columns == null ? undefined : parseInt(columns[i], 10) - 1;
      goToLocation(localPath, intLine, intColumn);
    }
  } catch (err) {
    atom.notifications.addError(err.message, {dismissable: true});
  }
}
