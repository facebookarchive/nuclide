# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import sys

from json_helpers import json_load

# Detects errors in Nuclide pacakge.json files.
#  - missing/empty description
#  - missing/incorrect repository
#  - missing/incorrect version
#  - unsorted dependencies
#  - unsorted devDependencies
class PackageLinter(object):
    def __init__(self, package_map):
        self._had_error = False
        self._package_map = package_map

    def validate_packages(self):
        for package_name in self._package_map:
            self.validate_package(package_name, self._package_map[package_name])
        return not self._had_error

    def validate_package(self, package_name, package):
        self.expect_field_in(package_name, package, 'packageType', ['Node', 'Atom'])
        self.expect_field_in(package_name, package, 'testRunner', ['npm', 'apm'])
        if not 'description' in package:
            self.report_error('Missing "description" for %s', package_name)
        elif not package['description']:
            self.report_error('Empty "description" for %s', package_name)
        self.expect_field(package_name, package,
                'repository', 'https://github.com/facebook/nuclide')
        self.expect_field(package_name, package, 'version', '0.0.0')
        self.expect_alpha_sort(package_name, package, 'dependencies')
        self.expect_alpha_sort(package_name, package, 'devDependencies')
        if not package['name'].startswith('nuclide-') and not 'isLegacyPackage' in package:
            self.report_error('Package names must start with "nuclide-" found %s', package['name'])
        if not package['isNodePackage']:
            self.expect_field(package_name, package, 'testRunner', 'apm')
        self.validate_dependencies(package, 'dependencies')
        self.validate_dependencies(package, 'devDependencies')

    def validate_dependencies(self, package, field):
        if field in package:
            for dependent_package_name in package[field]:
                dependent_package = self._package_map.get(dependent_package_name)
                self.validate_dependency(package, dependent_package, dependent_package_name)

    def validate_dependency(self, package, dependent_package, dependent_package_name):
        if not dependent_package:
            if dependent_package_name.startswith('nuclide-'):
                self.report_error('Missing dependency %s from %s', dependent_package_name,
                        package['name'])
            return
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

    def report_error(self, message, *args):
        logging.error('PACKAGE ERROR: ' + message, *args)
        self._had_error = True
