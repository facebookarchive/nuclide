'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Regenerates the .proxy baseline files in the spec/fixtures directory.

import {parseServiceDefinition} from './service-parser';
import {generateProxy} from './proxy-generator';
import {stripLocationsFileName} from './location';
import fs from 'fs';
import nuclideUri from '../../commons-node/nuclideUri';

const dir = nuclideUri.join(__dirname, '../spec/fixtures');
for (const file of fs.readdirSync(dir)) {
  if (file.endsWith('.def')) {
    const serviceName = nuclideUri.basename(file, '.def');
    const preserveFunctionNames = false;
    const definitionPath = nuclideUri.join(dir, file);

    const definitionSource = fs.readFileSync(definitionPath, 'utf8');
    const definitions = parseServiceDefinition(
      definitionPath,
      definitionSource,
      [],
    );

    stripLocationsFileName(definitions);

    const json = mapDefinitions(definitions);
    fs.writeFileSync(
      definitionPath.replace('.def', '.def.json'),
      JSON.stringify(json, null, 4),
      'utf8',
    );

    const code = generateProxy(serviceName, preserveFunctionNames, definitions);
    fs.writeFileSync(definitionPath.replace('.def', '.proxy'), code, 'utf8');
  }
}

function mapDefinitions(map) {
  const obj = {};
  for (const it of map.values()) {
    let value;
    switch (it.kind) {
      case 'interface':
        value = {
          constructorArgs: it.constructorArgs,
          instanceMethods: mapToJSON(it.instanceMethods),
          staticMethods: mapToJSON(it.staticMethods),
        };
        break;
      default:
        value = it;
        break;
    }
    obj[it.name] = value;
  }
  return obj;
}

function mapToJSON(map) {
  const result = {};
  for (const it of map.entries()) {
    result[it[0]] = it[1];
  }
  return result;
}
