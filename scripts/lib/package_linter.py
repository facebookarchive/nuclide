# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import re
import sys

from json_helpers import json_load

try:
    from ConfigParser import ConfigParser, NoOptionError
except ImportError:
    from configparser import ConfigParser, NoOptionError

DEFAULT_NPM_TEST_COMMAND = 'node --harmony node_modules/.bin/jasmine-node-transpiled spec'
NPM_TEST_COMMANDS = {
  'nuclide-inline-imports': 'node --harmony node_modules/.bin/jasmine-focused spec',
  'nuclide-jasmine': 'node --harmony bin/jasmine-node-transpiled spec',
}
PATH_TO_ATOM_INTERFACES = './node_modules/nuclide-external-interfaces/1.0/'
DEPENDENCY_BLACKLIST = {
  'lodash': 'it is a large dependency that we do not want to take on.',
  'nuclide-debugger-interfaces': 'it should be in devDependencies',
  'nuclide-external-interfaces': 'it should be in devDependencies.',
  'nuclide-home-interfaces': 'it should be in devDependencies.',
  'q': 'we should use real Promise objects.',
  'underscore': 'it is a large dependency that we do not want to take on.',
}
VERSION_BLACKLIST = {
  'fb-nuclide-installer': 'The installer needs to be versioned.',
}
PACKAGES_WITHOUT_TESTS = [
    'hyperclick-interfaces',
    'nuclide-debugger-interfaces', # contains no code, so no tests.
    'nuclide-external-interfaces', # contains no code, so no tests.
    'nuclide-home-interfaces', # contains no code, so no tests.
    # nuclide-node-transpiler is a dependency of nuclide-jasmine, so it cannot
    # use nuclide-jasmine as a test runner. As it stands, it has no tests.
    'nuclide-node-transpiler',
]
PACKAGE_NAME_WHITELIST = [
    'hyperclick', # we want to upstream this to atom, so do not require nuclide- prefix
    'hyperclick-interfaces',
]
PATH_TO_FORMAT_PACKAGE_JSON_SCRIPT = 'fbobjc/Tools/Nuclide/scripts/dev/fix-package-json-files'

EXACT_SEMVER_RE = re.compile(r'^\d+\.\d+\.\d+$')

# Detects errors in Nuclide pacakge.json files.
#  - missing/empty description
#  - missing/incorrect repository
#  - missing/incorrect version
#  - missing/incorrect scripts/test property
#  - missing/incorrect .flowconfig
#  - packages used in Atom must declare nuclide-external-interfaces in devDependencies
#  - unsorted dependencies
#  - unsorted devDependencies
class PackageLinter(object):
    def __init__(self, package_map):
        self._had_error = False
        self._package_map = package_map
        is_python_2_7_or_later = sys.version_info >= (2, 7)
        self._preserves_json_property_order = is_python_2_7_or_later
        self._supports_config_parser_allow_no_value = is_python_2_7_or_later
        self._current_file_being_linted = None

    def validate_packages(self):
        self.validate_all_packages()

        for package_name in self._package_map:
            if not self.is_whitelisted_package(package_name):
                package = self._package_map[package_name]
                # It is admittedly a little gross to set this as a field rather than threading it
                # through validate_package() or creating a new "Validator" object for each package
                # that has the path to the package.json as a field so it doesn't have to be used as
                # a "global". However, that would make this class harder to subclass. Fortunately,
                # this logic is very fast, so it doesn't seem like we'll have to make it
                # multi-threaded any time soon, so we can get away with sharing this field.
                self._current_file_being_linted = os.path.join(
                        package['packageRootAbsolutePath'], 'package.json')
                self.validate_package(package_name, package)
        return not self._had_error

    def validate_all_packages(self):
        '''This method can be overridden by subclasses.'''
        pass

    def is_whitelisted_package(self, package_name):
        return False

    def validate_package(self, package_name, package):
        # Show packages being linted when --verbose flag is specified
        logging.debug('Linting package %s', package_name)

        self.verify_package_name(package_name, package)
        self.verify_main_property(package_name, package)

        self.expect_field_in(package_name, package, 'packageType', ['Node', 'Atom'])
        self.expect_field_in(package_name, package, 'testRunner', ['npm', 'apm'])
        self.validate_shrinkwrap_for_package(package)
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
        if package_name not in VERSION_BLACKLIST:
            self.expect_field(package_name, package, 'version', '0.0.0')

        # Custom dependencies are added to the `dependencies` dict last, which means they will
        # likely be out of alpha order. Check the `base` and `custom` dependencies instead, which
        # preserve the order from the package.json files.
        if 'customDependencies' in package:
            self.expect_alpha_sort(package_name, package, 'baseDependencies')
            self.expect_alpha_sort(package_name, package, 'customDependencies')
        else:
            self.expect_alpha_sort(package_name, package, 'dependencies')
        self.expect_alpha_sort(package_name, package, 'devDependencies')

        package_name = package['name']
        has_valid_prefix = False
        prefixes = self.get_valid_package_prefixes()
        for prefix in prefixes:
            if package_name.startswith(prefix):
                has_valid_prefix = True
                break
        if not has_valid_prefix:
            self.report_error('Package name %s must start with one of %s', package_name, prefixes)

        if not package['isNodePackage']:
            self.expect_field(package_name, package, 'testRunner', 'apm')
        self.validate_dependencies(package, 'dependencies')
        self.validate_dependencies(package, 'devDependencies')
        self.validate_babelrc(package)

        if self.is_internal_name(package_name):
            self.expect_field(package_name, package, 'private', True)

    def verify_package_name(self, package_name, package):
        if package_name in PACKAGE_NAME_WHITELIST:
            return
        expected_package_name = ''
        path = package['packageRootAbsolutePath']
        while True:
            path, component = os.path.split(path)
            if component == 'pkg':
                break
            if expected_package_name == '':
                expected_package_name = component
            else:
                expected_package_name = component + '-' + expected_package_name
        if package_name != expected_package_name:
            self.report_error('Expected package name %s found %s', expected_package_name, package_name)

    def verify_main_property(self, package_name, package):
        if package['main'] is None:
            return
        package_main = package['main'];
        main_file = os.path.normpath(os.path.join(package['packageRootAbsolutePath'], package_main) + '.js')
        if not package_main.startswith('./'):
            # stylistic only - omitting the "./" works
            self.report_error('Package %s should have a "main" file that starts with "./"', package_name)
        if package_main.endswith('.js'):
            # stylistic only - (like an import/require) adding the ".js" works
            self.report_error('Package %s should have a "main" file without a ".js" extension', package_name)
        if not os.path.isfile(main_file):
            self.report_error('Package %s should have a "main" file that exits', package_name)

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
            if package_name in PACKAGES_WITHOUT_TESTS:
                return

            self.report_error(
                ('Package %s should have a "test" property in its "scripts" section ' +
                    'to define how its tests are run.'),
                package_name)
        elif package['scripts']['test'] != NPM_TEST_COMMANDS.get(package_name, DEFAULT_NPM_TEST_COMMAND):
            self.report_error(
                'Package %s should have a "test" property with the value: %s',
                package_name,
                DEFAULT_NPM_TEST_COMMAND)

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
            try:
                value = config.get('options', 'unsafe.enable_getters_and_setters')
                if value != 'true':
                    self.report_error(
                        'unsafe.enable_getters_and_setters in %s was "%s" instead of "true".',
                        package['name'],
                        value)
            except NoOptionError:
                self.report_error(
                    'Package %s should have an entry for %s in its [options] section.',
                    package['name'],
                    'unsafe.enable_getters_and_setters')


    def verify_apm_test_property(self, package):
        '''apm packages should not specify a separate test runner.'''
        package_name = package['name']
        if 'scripts' in package and 'test' in package['scripts']:
            self.report_error(
                ('Package %s should not have a custom scripts/test section ' +
                    'because it will use apm as its test runner.'),
                package_name)

        if (not 'nuclide-external-interfaces' in package.get('devDependencies', {}) and
                package_name != 'nuclide-external-interfaces'):
            self.report_error(
                ('Package %s should have nuclide-external-interfaces in its devDependencies ' +
                    'because it uses apm as its test runner.'),
                package_name)

    def read_flowconfig_for_package(self, package):
        if not self._supports_config_parser_allow_no_value:
            sys.stderr.write('Python 2.7 or later is required to parse .flowconfig properly.\n')
            return None

        flowconfig_path = os.path.join(package['packageRootAbsolutePath'], '.flowconfig')
        if not os.path.isfile(flowconfig_path):
            self.report_error('Expected .flowconfig file at %s not found.', flowconfig_path)
            return None

        config = ConfigParser(allow_no_value=True)
        config.read(flowconfig_path)
        return config

    def validate_babelrc(self, package):
        # See https://phabricator.fb.com/D2301649 for details on why this exists.
        babelrc_path = os.path.join(package['packageRootAbsolutePath'], '.babelrc')
        if not os.path.isfile(babelrc_path):
            self.report_error('Expected .babelrc file at %s not found.', babelrc_path)
            return

        babel_options = json_load(babelrc_path)
        expected_options = {'breakConfig': True}
        if not babel_options == expected_options:
            self.report_error('.babelrc file %s had options %s but expected %s' %
                (babelrc_path, babel_options, expected_options))

    def validate_shrinkwrap_for_package(self, package):
        shrinkwrap_path = os.path.join(package['packageRootAbsolutePath'], 'npm-shrinkwrap.json')
        if not os.path.isfile(shrinkwrap_path):
            # TODO: Enable this once we have shrinkwraps for all packages
            # self.report_error('Expected npm-shrinkwrap.json file at %s not found.', shrinkwrap_path)
            None
        else:
            try:
                shrinkwrap = json_load(shrinkwrap_path)
            except:
                self.report_error('Shrinkwrap file %s not valid JSON.', shrinkwrap_path)
                return

            # Shrinkwrap file must include all top level dependencies
            # And versions of top level dependencies must match
            all_deps = package['dependencies'].copy()
            all_deps.update(package['devDependencies'])
            for dependent_name in shrinkwrap['dependencies'].keys():
                if dependent_name not in all_deps:
                    self.report_error(
                        'Shrinkwrap file %s contains dependency %s which is not in package.json.',
                        shrinkwrap_path, dependent_name)
                elif shrinkwrap['dependencies'][dependent_name]['version'] != all_deps[dependent_name]:
                    self.report_error(
                        'Mismatched version for package %s in shrinkwrap file %s. ' +
                        'package.json contains version %s. Found %s in shrinkwrap file.',
                        dependent_name, shrinkwrap_path, all_deps[dependent_name],
                        shrinkwrap['dependencies'][dependent_name]['version'])

            # All dependencies in the package.json must occur in the Shrinkwrap file.
            for dependent_name in all_deps:
                if dependent_name not in shrinkwrap['dependencies']:
                    self.report_error(
                        'Shrinkwrap file %s missing top level dependency for package %s',
                        shrinkwrap_path, dependent_name)

    def validate_dependencies(self, package, field):
        if field not in package:
            return

        for dependent_package_name, version in package[field].items():
            self.validate_version(package['name'], dependent_package_name, version)

            dependent_package = self._package_map.get(dependent_package_name)
            self.validate_dependency(package, dependent_package, dependent_package_name, field)
            if field == 'dependencies' and dependent_package_name in DEPENDENCY_BLACKLIST:
                self.report_error(
                    '%s should not depend on %s because %s',
                    package['name'],
                    dependent_package_name,
                    DEPENDENCY_BLACKLIST[dependent_package_name])

    def validate_version(self, package_name, dependency, version):
        if not version:
            self.report_error(
                'Package %s should specify a version for %s rather than the empty string.',
                package_name,
                dependency)
        elif not EXACT_SEMVER_RE.match(version):
            self.report_error(
                'Package %s should have a precise dependency for %s instead of %s.',
                package_name,
                dependency,
                version)

    def validate_dependency(self, package, dependent_package, dependent_package_name, field):
        if not dependent_package:
            if dependent_package_name in self._package_map:
                self.report_error('Missing dependency %s from %s', dependent_package_name,
                        package['name'])
            return

        if dependent_package_name == 'nuclide-jasmine' and field != 'devDependencies':
            self.report_error(
                'Package %s depends directly on nuclide-jasmine, but should be in devDependencies.',
                package['name'])

        if not self.is_internal_name(package['name']) and self.is_internal_name(dependent_package_name):
            if ('baseDependencies' in package and package['baseDependencies'].has_key(dependent_package_name)):
                self.report_error(
                    'Package %s cannot list internal package %s in its `%s`.',
                    package['name'],
                    dependent_package_name,
                    field)

        if package['testRunner'] == 'npm' and dependent_package['testRunner'] != 'npm':
            self.report_error('Cannot reference non-npm package %s from npm package %s',
                    dependent_package_name, package['name'])
        elif not dependent_package['isNodePackage']:
            self.report_error(
                'Cannot depend on Atom package %s from package %s. Use Atom Services API instead.',
                dependent_package_name, package['name'])

    def expect_alpha_sort(self, package_name, package, field):
        if not self._preserves_json_property_order:
            sys.stderr.write('Python 2.7 or later is required to verify alpha-sort.\n')
            return

        if field not in package:
            return
        last = None
        for value in package[field]:
            if last:
                if last >= value:
                    self.report_error('Unsorted field "%s" in %s near %s. Run %s to fix it.',
                            field,
                            package_name,
                            value,
                            PATH_TO_FORMAT_PACKAGE_JSON_SCRIPT)
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

    def is_internal_name(self, package_name):
        return False

    def get_valid_package_prefixes(self):
        return ['nuclide-', 'hyperclick']

    def report_error(self, message, *args):
        logging.error('PACKAGE ERROR (' + self._current_file_being_linted + '): ' + message, *args)
        self._had_error = True
