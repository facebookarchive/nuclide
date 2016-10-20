#!/usr/bin/env node
'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* NON-TRANSPILED FILE */
/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

/* eslint-disable no-console */

require('../../pkg/nuclide-node-transpiler');

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .option('save', {
    describe: 'Save the generated proxies to disk',
    type: 'boolean',
  })
  .help('help')
  .argv;

const child_process = require('child_process');
const glob = require('glob');
const os = require('os');
const path = require('path');

const basedir = path.join(__dirname, '../..');

const loadServicesConfig = require('../../pkg/nuclide-rpc/lib/loadServicesConfig');
const servicesConfigs = glob.sync(path.join(basedir, 'pkg/*'))
  .reduce((acc, dirname) => acc.concat(loadServicesConfig(dirname)), []);

let numWorkers = Math.max(os.cpus().length - 1, 1);
while (numWorkers--) {
  spawnWorker();
}

function spawnWorker() {
  if (!servicesConfigs.length) {
    return;
  }
  const servicesConfig = servicesConfigs.shift();
  const ps = child_process.spawn(
    require.resolve('../../pkg/nuclide-rpc/bin/generate-proxy.js'),
    [
      '--definitionPath', servicesConfig.definition,
      '--serviceName', servicesConfig.name,
      '--preserveFunctionNames', Boolean(servicesConfig.preserveFunctionNames),
      '--useBasename',
      '--validate',
      '--json',
      argv.save ? '--save' : '',
    ]
  )
  .on('exit', code => {
    if (code) {
      process.exit(code);
    } else {
      try {
        const json = JSON.parse(out);
        const a = path.relative(basedir, json.src);
        if (argv.save) {
          const b = path.relative(path.dirname(json.src), json.dest);
          console.log(`${a} => ${b}`);
        } else {
          console.log(`${a}`);
        }
      } catch (err) {
        console.error(`Error ${err} parsing:\n${out}`);
        process.exit(1);
      }
      spawnWorker();
    }
  });

  let out = '';
  ps.stdout.on('data', data => { out += data; });
  ps.stderr.on('data', data => { console.error(data.toString()); });
}
