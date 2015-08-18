# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os

from json_helpers import json_load


def create_config_for_package(path):
    '''Reads the package.json at `path` and returns a config created by
    `create_config_for_manifest`.
    '''
    return create_config_for_manifest(path, json_load(path))


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
    flowCheck = nuclide_config.get('flowCheck', False)

    config = {}
    config['name'] = manifest['name']
    config['repository'] = manifest.get('repository')
    config['version'] = manifest.get('version')
    config['description'] = manifest.get('description')
    config['packageType'] = package_type
    config['isNodePackage'] = package_type == 'Node'
    config['localDependencies'] = {}
    config['dependencies'] = manifest.get('dependencies', {})
    config['devDependencies'] = manifest.get('devDependencies', {})

    # Apparently both spellings are acceptable:
    config['bundleDependencies'] = manifest.get('bundleDependencies', {})
    config['bundledDependencies'] = manifest.get('bundledDependencies', {})

    config['scripts'] = manifest.get('scripts', {})
    config['packageRootAbsolutePath'] = os.path.dirname(path)
    config['testRunner'] = test_runner
    config['excludeTestsFromContinuousIntegration'] = disableTests

    config['flowCheck'] = flowCheck

    # Check for custom dependencies.
    if 'customDeps' in nuclide_config:
        extra_json = os.path.join(
            os.path.dirname(path), nuclide_config['customDeps'])
        if os.path.exists(extra_json):
            extra_manifest = json_load(extra_json)
            # Track the base dependencies from the published package.json plus
            # the sideloaded "custom" dependencies separately.
            # `config['dependencies']` is the merged set of both.
            config['baseDependencies'] = config['dependencies'].copy()
            config['customDependencies'] = extra_manifest.get(
                'dependencies', {})
            config['dependencies'].update(config['customDependencies'])

    return config
