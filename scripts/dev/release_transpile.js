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

// This file is both the main and worker process.
if (process.send) {
  runChild();
} else {
  runParent();
}

function runParent() {
  const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .option('overwrite', {
      describe: 'Overwrite original files with transpile output.',
      type: 'boolean',
    })
    .help('help')
    .argv;

  const assert = require('assert');
  const child_process = require('child_process');
  const fs = require('fs');
  const glob = require('glob');
  const os = require('os');
  const path = require('path');

  const basedir = path.join(__dirname, '../..');
  const numWorkers = os.cpus().length - 1;

  const count = {
    skipped: 0,
    services: 0,
    transpiled: 0,
  };

  const services = [];
  ['services-3.json', 'fb/fb-services-3.json'].forEach(jsonFilename => {
    const configPath = path.join(basedir, 'pkg/nuclide-server', jsonFilename);
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath));
      config.forEach(service => {
        const def = service.definition || service.implementation;
        const servicePath = path.join(basedir, 'pkg/nuclide-server', def);
        services.push(servicePath);
      });
    } else {
      // eslint-disable-next-line no-console
      console.log('Service config "%s" not found.', configPath);
    }
  });

  const jsFiles = glob.sync(path.join(basedir, '**/*.js'), {
    ignore: [
      '**/node_modules/**',
      '**/VendorLib/**',
    ],
  });

  // Sanity checks
  assert(jsFiles.length > 10);
  assert(services.length > 10);
  jsFiles.forEach(filename => {
    assert(path.isAbsolute(filename));
  });
  services.forEach(service => {
    assert(path.isAbsolute(service));
    fs.statSync(service);
  });

  // eslint-disable-next-line no-console
  console.log('%s workers. %s files...', numWorkers, jsFiles.length);

  for (let i = 0; i < numWorkers; i++) {
    child_process.fork(__filename)
      .on('message', function(m) {
        if (m.error) {
          // eslint-disable-next-line no-console
          console.error('Transpile failed. %s', m.error);
          process.exit(1);
        } else if (m.transpile === true) {
          count.transpiled++;
        } else if (m.transpile === false) {
          count.skipped++;
        }
        if (jsFiles.length) {
          this.send({cmd: 'next', filename: jsFiles.pop()});
        } else {
          this.disconnect();
        }
      })
      .on('exit', code => {
        if (code !== 0) {
          process.exit(code);
        }
      })
      .send({cmd: 'init', overwrite: argv.overwrite, services});
  }

  process.once('exit', code => {
    if (code !== 0) { return; }
    // eslint-disable-next-line no-console
    console.log(
      'transpiled: %s | skipped: %s | services: %s | %ds',
      count.transpiled,
      count.skipped,
      services.length,
      process.uptime().toFixed(2)
    );
  });
}

function runChild() {
  const fs = require('fs');

  const NodeTranspiler = require('../../pkg/nuclide-node-transpiler/lib/NodeTranspiler');
  const nodeTranspiler = new NodeTranspiler();

  let services;
  let overwrite;

  process.on('message', m => {
    if (m.cmd === 'next') {
      run(m.filename, (err, ret) => {
        if (process.connected) {
          if (err) {
            process.send({error: String(err)});
          } else {
            process.send(ret);
          }
        }
      });
    } else if (m.cmd === 'init') {
      services = new Set(m.services);
      overwrite = m.overwrite;
    }
  });

  process.send({ready: true});

  function run(filename, cb) {
    const src = fs.readFileSync(filename);

    const ret = {
      filename,
      transpile: NodeTranspiler.shouldCompile(src),
    };

    if (!ret.transpile) {
      process.nextTick(() => { cb(null, ret); });
      return;
    }

    let code;
    let pending = 0;

    try {
      pending++;
      code = nodeTranspiler.transformWithCache(src, filename, done);
    } catch (err) {
      process.nextTick(() => { done(err); });
      return;
    }

    // Services are never overwritten.
    if (overwrite && !services.has(filename)) {
      pending++;
      fs.writeFile(filename, code, done);
    }

    function done(err) {
      if (err) {
        pending = 0;
        cb(err);
      } else if (--pending === 0) {
        cb(null, ret);
      }
    }
  }
}
