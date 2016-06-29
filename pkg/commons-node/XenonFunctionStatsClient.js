'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Definition} from '../nuclide-definition-service';

import {performGraphQLQuery} from '../commons-node/fb-interngraph';
import arcanistClient from '../nuclide-arcanist-client';
import invariant from 'assert';

const XENON_QUERY: string = `\
Query xenonQuery {
  xenon_function_stats({full_name:<full_name>,file:<file>}) {
    callers, count, ds, exclusive_gcpu, file, full_name, inclusive_gcpu, line, name, products
  }
}`;

/** Type signature of the objects in the `callers` array returned from
    the Xenon GraphQL endpoint. */
export type XenonCaller = {
  caller: string; // Function name
  file: string; // File path
  line: number; // Line number where the function is called from
  count: number;// Number of times the function call was found in stack traces
};

/** Type signature of the objects in the `products` array returned from
    the Xenon GraphQL endpoint. */
export type XenonProduct = {
  product: string; // Name of product (timeline, photos, m_iphone, etc.)
  count: number; // Number of times the function call was found in this product's stack traces
};

export type XenonFunctionStats = {
  callers: Array<XenonCaller>; // Call sites of the function
  count: number;
  ds: string; // Date stamp in YYYY-MM-DD format
  // Exclusive CPU time is only the time spent in the function itself.
  exclusive_gcpu: number;
  file: string;
  fullName: string;
  // Inclusive CPU time is the sum of the time spent in the function itself, **as well as**
  // the sum of the times of all functions that it calls.
  inclusive_gcpu: number;
  line: number;
  name: string;
  products: Array<XenonProduct>;
};

/** Returns XenonFunctionStats object given a Definition. Promise is rejected if definition
 * name or path field is null or empty, or if the GraphQL query fails. Promise Returns null
 * if stats not found for given definition. */
export async function getXenonStatsForFunction(def: Definition): Promise<?XenonFunctionStats> {
  // Build `full_name` param
  if (def.name == null || def.name === '') {
    throw new Error('Empty name field in definition');
  }
  invariant(def.name != null);
  let full_name: string = def.name;
  if (full_name.startsWith('\\')) { // Name could have leading '\'
    full_name = full_name.substr(1);
  }

  // Build `file` param
  if (def.path === '') {
    throw new Error('Empty path field in definition');
  }
  const projectRelativePath = await arcanistClient.getProjectRelativePath(def.path);
  const projectId = await arcanistClient.findArcProjectIdOfPath(def.path);
  if (projectRelativePath == null || projectId == null) {
    throw new Error('Couldn\'t get relative path or couldn\'t get project name');
  }
  // TODO (reesjones) Is this the only case where the arc project ID != the repo dir name?
  const projectName = (projectId === 'facebook-www') ? 'www' : projectId;
  const file = projectName.concat('/' + projectRelativePath);

  const response = await performGraphQLQuery(XENON_QUERY, {full_name, file});

  if (Object.hasOwnProperty.call(response, 'error_class')) {
    throw new Error('Error querying xenon: ' + response.error);
  }
  const stats = response[0];
  if (stats != null) {
    stats.callers = JSON.parse(response[0].callers);
    stats.products = JSON.parse(response[0].products);
  }
  return stats;
}
