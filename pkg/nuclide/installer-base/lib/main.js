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
  version: PackageVersion;
};

type InstallConfig = {
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
async function getInstalledPackages(): Promise<{[key: PackageName]: PackageVersion}> {
  var {asyncExecute} = require('nuclide-commons');
  var apm = atom.packages.getApmPath();
  var json;
  try {
    var {stdout} = await asyncExecute(apm, ['ls', '--json']);
    json = stdout;
  } catch (e) {
    /*eslint-disable no-console*/
    // Write to the console because this make it easier for users to report errors.
    console.error(`Could not get the list of Atom packages from ${apm} ls --json.`);
    /*eslint-enable no-console*/
    throw Error(`${apm} ls --json failed with exit code ${e.exitCode}`);
  }

  var installedPackages = {};
  JSON.parse(json)['user'].forEach(pkg => {
    installedPackages[pkg['name']] = pkg['version'];
  });
  return installedPackages;
}

function findPackagesToInstall(
  config: InstallConfig,
  installedPackages: {[key: PackageName]: PackageVersion}
  ): Array<string> {
  var packagesToInstall = [];
  config.packages.forEach(pkg => {
    var {name, version} = pkg;
    if (!name) {
      throw Error(`Entry without a name in ${JSON.stringify(config, null, 2)}`);
    }
    if (!version) {
      throw Error(`Entry without a version in ${JSON.stringify(config, null, 2)}`);
    }
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
