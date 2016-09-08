'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-console */


const argv = require('yargs')
  .usage('Usage: $0 -d path/to/definition -n serviceName')
  .options({
    definitionPath: {
      demand: true,
      describe: 'Path to definition',
      type: 'string',
    },
    serviceName: {
      demand: true,
      describe: 'Service name',
      type: 'string',
    },
    preserveFunctionNames: {
      demand: false,
      default: false,
      describe: 'Preserve function names',
      type: 'boolean',
    },
    useBasename: {
      demand: false,
      default: false,
      describe: 'Removes full paths from definitions in favor of base names',
      type: 'boolean',
    },
    save: {
      demand: false,
      default: false,
      describe: 'Save the proxy next to definition file',
      type: 'boolean',
    },
    code: {
      demand: false,
      default: false,
      describe: 'Prints the proxy code',
      type: 'boolean',
    },
    json: {
      demand: false,
      default: false,
      describe: 'Prints details in JSON format',
      type: 'boolean',
    },
    validate: {
      demand: false,
      default: false,
      describe: 'Validate the proxy by running it',
      type: 'boolean',
    },
  })
  .argv;

const fs = require('fs');
const path = require('path');

const createProxyFactory = require('./main').createProxyFactory;
const proxyFilename = require('./main').proxyFilename;
const stripLocationsFileName = require('./location').stripLocationsFileName;

const generateProxy = require('./proxy-generator').generateProxy;
const parseServiceDefinition = require('./service-parser').parseServiceDefinition;

const definitionPath = path.resolve(argv.definitionPath);
const preserveFunctionNames = argv.preserveFunctionNames;
const serviceName = argv.serviceName;

const filename = proxyFilename(definitionPath);
const definitionSource = fs.readFileSync(definitionPath, 'utf8');
const defs = parseServiceDefinition(definitionPath, definitionSource);
if (argv.useBasename) {
  stripLocationsFileName(defs);
}
const code = generateProxy(argv.serviceName, argv.preserveFunctionNames, defs);

if (argv.validate) {
  try {
    const fakeClient: any = {};
    const factory = createProxyFactory(
      serviceName,
      preserveFunctionNames,
      definitionPath,
    );
    factory(fakeClient);
  } catch (e) {
    console.error(`Failed to validate "${definitionPath}"`);
    throw e;
  }
}

if (argv.save) {
  fs.writeFileSync(filename, code);
}

if (argv.json) {
  console.log(JSON.stringify({
    src: definitionPath,
    dest: filename,
    code: argv.code ? code : undefined,
  }, null, 2));
} else if (argv.code) {
  console.log(code);
}
