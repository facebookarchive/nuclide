/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import nuclideUri from 'nuclide-commons/nuclideUri';

import fsPromise from '../../commons-node/fsPromise';
import {getCategoryLogger} from '../../nuclide-logging';

import {
  GraphQLRC,
} from '../../nuclide-graphql-language-service/lib/config/GraphQLConfig';

const GRAPHQL_LOGGER_CATEGORY = 'nuclide-graphql';
export const logger = getCategoryLogger(GRAPHQL_LOGGER_CATEGORY);

export const GRAPHQL_CONFIG_FILE_NAME = '.graphqlrc';

export function findGraphQLConfigDir(fileUri: NuclideUri): Promise<?string> {
  return fsPromise.findNearestFile(GRAPHQL_CONFIG_FILE_NAME, fileUri);
}

export async function getGraphQLConfig(
  configDir: NuclideUri,
): Promise<GraphQLRC> {
  const rawGraphQLConfig = await fsPromise.readFile(
    nuclideUri.join(configDir, GRAPHQL_CONFIG_FILE_NAME),
  );
  const configJSON = rawGraphQLConfig.toString();
  try {
    const graphqlrc = JSON.parse(configJSON);
    return new GraphQLRC(graphqlrc, configDir);
  } catch (error) {
    throw new Error(error);
  }
}
