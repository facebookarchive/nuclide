# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import sys

from json_helpers import json_load

try:
    from ConfigParser import ConfigParser, NoOptionError
except ImportError:
    from configparser import ConfigParser, NoOptionError

EXPECTED_NPM_TEST_COMMAND = 'node --harmony node_modules/.bin/jasmine-node-transpiled spec'
PATH_TO_ATOM_INTERFACES = './node_modules/nuclide-atom-interfaces/1.0/'

# Detects errors in Nuclide pacakge.json files.
#  - missing/empty description
#  - missing/incorrect repository
#  - missing/incorrect version
#  - missing/incorrect scripts/test property
#  - missing/incorrect .flowconfig
#  - packages used in Atom must declare nuclide-atom-interfaces in devDependencies
#  - unsorted dependencies
#  - unsorted devDependencies
class PackageLinter(object):
    def __init__(self, package_map):
        self._had_error = False
        self._package_map = package_map

    def validate_packages(self):
        for package_name in self._package_map:
            if not self.is_whitelisted_package(package_name):
                self.validate_package(package_name, self._package_map[package_name])
        return not self._had_error

    def is_whitelisted_package(self, package_name):
        return False

    def validate_package(self, package_name, package):
        self.expect_field_in(package_name, package, 'packageType', ['Node', 'Atom'])
        self.expect_field_in(package_name, package, 'testRunner', ['npm', 'apm'])
        if package['testRunner'] == 'npm':
            self.verify_npm_package(package)
        else:
            self.verify_apm_package(package)

        if not 'description' in package:
            self.report_error('Missing "description" for %s', package_name)
        elif not package['description']:
            self.report_error('Empty "description" for %s', package_name)
        self.expect_field(package_name, package,
                'repository', 'https://github.com/facebook/nuclide')
        self.expect_field(package_name, package, 'version', '0.0.0')
        self.expect_alpha_sort(package_name, package, 'dependencies')
        self.expect_alpha_sort(package_name, package, 'devDependencies')

        package_name = package['name']
        has_valid_prefix = False
        prefixes = self.get_valid_package_prefixes()
        for prefix in prefixes:
            if package_name.startswith(prefix):
                has_valid_prefix = True
                break
        if not has_valid_prefix and not 'isLegacyPackage' in package:
            self.report_error('Package name %s must start with one of %s', package_name, prefixes)

        if not package['isNodePackage']:
            self.expect_field(package_name, package, 'testRunner', 'apm')
        self.validate_dependencies(package, 'dependencies')
        self.validate_dependencies(package, 'devDependencies')

    def verify_npm_package(self, package):
        self.verify_npm_test_property(package)
        self.read_flowconfig_for_package(package)

    def verify_npm_test_property(self, package):
        '''npm packages should use nuclide-jasmine for running tests.'''
        package_name = package['name']
        if not 'scripts' in package:
            self.report_error(
                'Package %s should have a "scripts" section with a "test" property.',
                package_name)
        elif not 'test' in package['scripts']:
            if package_name in ['nuclide-atom-interfaces', 'nuclide-node-transpiler']:
                # nuclide-atom-interfaces does not contain any code, so no tests.
                # nuclide-node-transpiler is a dependency of nuclide-jasmine, so it cannot
                # use nuclide-jasmine as a test runner. As it stands, it has no tests.
                return

            self.report_error(
                ('Package %s should have a "test" property in its "scripts" section ' +
                    'to define how its tests are run.'),
                package_name)
        elif package['scripts']['test'] != EXPECTED_NPM_TEST_COMMAND:
            if package_name == 'nuclide-jasmine':
                # nuclide-jasmine must have a slightly different test script than
                # EXPECTED_NPM_TEST_COMMAND.
                return

            self.report_error(
                'Package %s should have a "test" property with the value: %s',
                package_name,
                EXPECTED_NPM_TEST_COMMAND)

    def verify_apm_package(self, package):
        self.verify_apm_test_property(package)
        config = self.read_flowconfig_for_package(package)
        if config:
            try:
                config.get('libs', PATH_TO_ATOM_INTERFACES)
            except NoOptionError:
                self.report_error(
                    'Package %s should have an entry for %s in its [libs] section.',
                    package['name'],
                    PATH_TO_ATOM_INTERFACES)

    def verify_apm_test_property(self, package):
        '''apm packages should not specify a separate test runner.'''
        package_name = package['name']
        if 'scripts' in package and 'test' in package['scripts']:
            self.report_error(
                ('Package %s should not have a custom scripts/test section ' +
                    'because it will use apm as its test runner.'),
                package_name)

        if (not 'nuclide-atom-interfaces' in package.get('devDependencies', {}) and
                package_name != 'nuclide-atom-interfaces'):
            self.report_error(
                ('Package %s should have nuclide-atom-interfaces in its devDependencies ' +
                    'because it uses apm as its test runner.'),
                package_name)

    def read_flowconfig_for_package(self, package):
        flowconfig_path = os.path.join(package['packageRootAbsolutePath'], '.flowconfig')
        if not os.path.isfile(flowconfig_path):
            self.report_error('Expected .flowconfig file at %s not found.', flowconfig_path)
            return None

        config = ConfigParser(allow_no_value=True)
        config.read(flowconfig_path)
        return config

    def validate_dependencies(self, package, field):
        if field in package:
            for dependent_package_name in package[field]:
                dependent_package = self._package_map.get(dependent_package_name)
                self.validate_dependency(package, dependent_package, dependent_package_name, field)

    def validate_dependency(self, package, dependent_package, dependent_package_name, field):
        if not dependent_package:
            if dependent_package_name.startswith('nuclide-'):
                self.report_error('Missing dependency %s from %s', dependent_package_name,
                        package['name'])
            return

        if dependent_package_name == 'nuclide-jasmine' and field != 'devDependencies':
            self.report_error(
                'Package %s depends directly on nuclide-jasmine, but should be in devDependencies.',
                package['name'])

        if package['testRunner'] == 'npm' and dependent_package['testRunner'] != 'npm':
            self.report_error('Cannot reference non-npm package %s from npm package %s',
                    dependent_package_name, package['name'])
        elif not dependent_package['isNodePackage']:
            self.report_error(
                'Cannot depend on Atom package %s from package %s. Use Atom Services API instead.',
                dependent_package_name, package['name'])

    def expect_alpha_sort(self, package_name, package, field):
        if field not in package:
            return
        last = None
        for value in package[field]:
            if last:
                if last >= value:
                    self.report_error('Unsorted field "%s" in %s near %s',
                            field, package_name, value)
                    return
            last = value

    def expect_field(self, package_name, package, field, value):
        fieldValue = package.get(field, None)
        if fieldValue is None:
            self.report_error('Missing field "%s" for "%s"', field, package_name)
        elif package[field] != value:
            self.report_error('Incorrect "%s" for %s. Found %s expected %s',
                    field, package_name, fieldValue, value)

    def expect_field_in(self, package_name, package, field, values):
        fieldValue = package.get(field, None)
        if fieldValue is None:
            self.report_error('Missing field "%s" for %s', field, package_name)
        elif not fieldValue in values:
            self.report_error('Incorrect "%s" for %s. Found %s',
                    field, package_name, fieldValue)

    def get_valid_package_prefixes(self):
        return ['nuclide-', 'hyperclick']

    def report_error(self, message, *args):
        logging.error('PACKAGE ERROR: ' + message, *args)
        self._had_error = True
