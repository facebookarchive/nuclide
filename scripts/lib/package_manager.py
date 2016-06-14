# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import fnmatch
import re

import utils

NUCLIDE_PATH = os.path.realpath(os.path.join(os.path.dirname(__file__), '../..'))
PACKAGES_PATH = os.path.join(NUCLIDE_PATH, 'pkg')


class PackageManager(object):
    EXCLUDE_DIRS = ['node_modules', 'VendorLib']

    def __init__(self):
        # Keys are names of packages and values are the corresponding configs.
        self._package_map = load_package_configs()
        self._all_files = self._find_all_files()
        self._eslintable_files = None

    def get_configs(self):
        sorted_packages = sorted(self._package_map.items(),
                                 key=lambda x: x[1]['name'])
        for package_name, package_config in sorted_packages:
            logging.debug('Including package: %s', package_name)
            yield package_config

    def is_local_dependency(self, package_name):
        return package_name in self._package_map

    def get_nuclide_path(self):
        return NUCLIDE_PATH

    def get_package_map(self):
        return self._package_map

    def _find_all_files(self):
        """Finds all of the files that are of usual interest.

        That is, any file in the Nuclide directory that is not in `node_modules`
        or `VendorLib`.
        """
        found = []
        for root, dirs, files in os.walk(NUCLIDE_PATH):
            dirs[:] = [d for d in dirs if d not in self.EXCLUDE_DIRS]
            found += [os.path.join(root, f) for f in files]
        return found

    def get_eslintable_files(self):
        """Gets all of the files that are lintable by eslint.

        Patterns used in `.eslintignore` must be kept compatible with `fnmatch`.
        otherwise you'll get different results when running the eslint bin.
        Asking eslint directly for the files it can lint is the correct way to
        do this, but it is really slow.
        """
        if self._eslintable_files is None:
            eslintrc = os.path.join(NUCLIDE_PATH, '.eslintrc.js')
            eslintignore = os.path.join(NUCLIDE_PATH, '.eslintignore')
            with open(eslintignore, 'r') as read_f:
                eslint_ignore_text = read_f.read()
            eslint_ignore_rules = [
                fnmatch.translate(rule)
                for rule in eslint_ignore_text.split('\n')
                if rule and not rule.startswith('#')
            ]
            ignore = re.compile(r'|'.join(eslint_ignore_rules))
            self._eslintable_files = [
                f
                for f in self._all_files
                if f.endswith('.js') and not ignore.match(f)
            ]
            # eslint ignores it's own config
            self._eslintable_files.remove(eslintrc)
        return self._eslintable_files


def load_package_configs():
    '''Returns a map where keys are names of packages and values are package configs.'''
    package_map = {}

    # Performs a depth-first search of the project root for package.json files.
    for (path, dirs, files) in os.walk(PACKAGES_PATH):
        if 'package.json' in files:
            # No need to explore subdirectories once package.json is found.
            del dirs[:]
            package_json = os.path.join(path, 'package.json')
            config = create_config_for_package(package_json)
            # config will be None for packages such as sample packages.
            if config:
                package_name = config['name']
                # Update the map now that the config is complete.
                package_map[package_name] = config

    return package_map


def create_config_for_package(path):
    '''Create a config for a parsed package.json. Returns None if it is not a
    Nuclide package.

    No code in this library should parse a package.json file directly. Instead,
    it should operate on a package config that is created by this method.
    Because we may read extra properties in package.json, such as "customDeps",
    it is critical that all scripts operate on a normalized package config
    rather than a raw package.json.
    '''
    pkg = utils.json_load(path)
    nuclide_config = pkg.get('nuclide')

    # Skip if not a nuclide package.
    if nuclide_config is None:
        return None

    config = {}

    # Standard package.json fields
    config['name'] = pkg['name']
    config['repository'] = pkg.get('repository')
    config['version'] = pkg.get('version')
    config['description'] = pkg.get('description')
    config['main'] = pkg.get('main')
    config['dependencies'] = pkg.get('dependencies', {})
    config['optionalDependencies'] = pkg.get('optionalDependencies', {})
    config['devDependencies'] = pkg.get('devDependencies', {})
    # Both spellings are acceptable:
    config['bundleDependencies'] = pkg.get('bundleDependencies', {})
    config['bundledDependencies'] = pkg.get('bundledDependencies', {})
    config['scripts'] = pkg.get('scripts', {})
    config['private'] = pkg.get('private', False)
    config['engines'] = pkg.get('engines')

    # Custom Nuclide fields
    config['packageRootAbsolutePath'] = os.path.dirname(path)
    config['packageType'] = nuclide_config.get('packageType')
    config['isNodePackage'] = nuclide_config.get('packageType') == 'Node'
    config['testRunner'] = nuclide_config.get('testRunner')
    config['testsCannotBeRunInParallel'] = nuclide_config.get(
        'testsCannotBeRunInParallel', False)
    config['excludeTestsFromContinuousIntegration'] = nuclide_config.get(
        'excludeTestsFromContinuousIntegration', False)
    config['atomTestRunner'] = pkg.get('atomTestRunner')
    config['_atomModuleCache'] = pkg.get('_atomModuleCache')

    return config
