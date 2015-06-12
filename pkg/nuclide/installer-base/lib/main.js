'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type PackageName = string;
type PackageVersion = string;

type InstallConfigEntry = {
  name: PackageName;
  version: ?PackageVersion;
};

type InstallConfig = {
  defaultVersion: PackageVersion;
  packages: Array<InstallConfigEntry>;
};

/**
 * Installs the Atom packages specified in the config.
 * @return Promise that resolves if the installation succeeds.
 */
async function installPackagesInConfig(config: InstallConfig): Promise {
  var installedPackages = await getInstalledPackages();
  var packagesToInstall = findPackagesToInstall(config, installedPackages);
  await installApmPackages(packagesToInstall);
}

/**
 * Calls `apm ls --json`, parses the JSON written to stdout, and filters the value
 * of the `"user"` property of the JSON to produce a map of (name, version) pairs
 * that correspond to user-installed Atom packages.
 */
function getInstalledPackages(apm): Promise<{[key: PackageName]: PackageVersion}> {
  var {BufferedProcess} = require('atom');
  return new Promise((resolve, reject) => {
    var json = '';
    var apm = atom.packages.getApmPath();
    new BufferedProcess({
      command: apm,
      args: ['ls', '--json'],
      stdout(data: string) {
        json += data;
      },
      exit(exitCode: number) {
        if (exitCode === 0) {
          var installedPackages = {};
          JSON.parse(json)['user'].forEach(pkg => {
            installedPackages[pkg['name']] = pkg['version'];
          });
          resolve(installedPackages);
        } else {
          /*eslint-disable no-console*/
          // Write to the console because this make it easier for users to report errors.
          console.error(`Could not get the list of Atom packages from ${apm} ls --json.`);
          /*eslint-enable no-console*/
          reject(`apm ls --json failed with exit code ${exitCode}`);
        }
      },
    });
  });
}

function findPackagesToInstall(
  config: InstallConfig,
  installedPackages: {[key: PackageName]: PackageVersion}
  ): Array<string> {
  var {defaultVersion} = config;
  var packagesToInstall = [];
  config.packages.forEach(pkg => {
    var {name} = pkg;
    var version = pkg.version || defaultVersion;
    if (installedPackages[name] !== version) {
      packagesToInstall.push(`${name}@${version}`);
    }
  });
  return packagesToInstall;
}

/**
 * Installs the list of Atom packages serially. 
 */
function installApmPackages(packages: Array<string>): Promise {
  var {asyncExecute, PromiseQueue} = require('nuclide-commons');
  var queue = new PromiseQueue();
  var apm = atom.packages.getApmPath();
  var promises = [];
  packages.forEach(pkg => {
    var executor = (resolve, reject) => asyncExecute(apm, ['install', pkg]).then(resolve, reject);
    var promise = queue.submit(executor);
    promises.push(promise);
  });
  return Promise.all(promises);
}

module.exports = {
  installPackagesInConfig,
  __test__: {
    findPackagesToInstall,
  },
};
