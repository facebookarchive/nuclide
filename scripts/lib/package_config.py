# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os

import utils


def create_config_for_package(path):
    '''Reads the package.json at `path` and returns a config created by
    `create_config_for_manifest`.
    '''
    return create_config_for_manifest(path, utils.json_load(path))


def create_config_for_manifest(path, manifest):
    '''Create a config for a parsed package.json. Returns None if it is not a
    Nuclide package.

    No code in this library should parse a package.json file directly. Instead,
    it should operate on a package config that is created by this method.
    Because we may read extra properties in package.json, such as "customDeps",
    it is critical that all scripts operate on a normalized package config
    rather than a raw package.json.
    '''
    nuclide_config = manifest.get('nuclide')
    # Skip if not a nuclide package.
    if nuclide_config is None:
        return None

    package_type = nuclide_config.get('packageType')
    test_runner = nuclide_config.get('testRunner')
    disableTests = nuclide_config.get(
        'excludeTestsFromContinuousIntegration', False)
    windows_incompatible = nuclide_config.get('windowsIncompatible', False)

    config = {}
    config['name'] = manifest['name']
    config['repository'] = manifest.get('repository')
    config['version'] = manifest.get('version')
    config['description'] = manifest.get('description')
    config['main'] = manifest.get('main')
    config['packageType'] = package_type
    config['isNodePackage'] = package_type == 'Node'
    config['localDependencies'] = {}
    config['dependencies'] = manifest.get('dependencies', {})
    config['optionalDependencies'] = manifest.get('optionalDependencies', {})
    config['devDependencies'] = manifest.get('devDependencies', {})
    config['private'] = manifest.get('private', False)
    # optionalDependencies override dependencies and do not get installed.
    # So we remove them from dependencies.
    for dep in config['optionalDependencies'].keys():
        config['dependencies'].pop(dep, None)

    # Apparently both spellings are acceptable:
    config['bundleDependencies'] = manifest.get('bundleDependencies', {})
    config['bundledDependencies'] = manifest.get('bundledDependencies', {})

    config['scripts'] = manifest.get('scripts', {})
    config['packageRootAbsolutePath'] = os.path.dirname(path)
    config['testRunner'] = test_runner
    config['testsCannotBeRunInParallel'] = nuclide_config.get('testsCannotBeRunInParallel', False)
    config['excludeTestsFromContinuousIntegration'] = disableTests

    config['windowsIncompatible'] = windows_incompatible

    if 'engines' in manifest:
        config['engines'] = manifest.get('engines')

    if '_atomModuleCache' in manifest:
        config['_atomModuleCache'] = manifest.get('_atomModuleCache')

    return config
