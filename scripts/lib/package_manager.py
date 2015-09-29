# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os

from json_helpers import json_load
from package_config import create_config_for_package
from topological_installer import TopologicalInstaller

PACKAGES_PATH = os.path.realpath(os.path.join(os.path.dirname(__file__), '../../pkg'))


class PackageManager(object):
    def __init__(self):
        # Keys are names of packages and values are the corresponding configs.
        self._package_map = load_package_configs()

    def install_dependencies(self, npm, include_packages_that_depend_on_atom=True,
                             exclude_windows_incompatible_packages=False):
        import datetime
        start = datetime.datetime.now()
        logging.info('START INSTALL: %s', start)

        configs_to_install = []
        for package_config in self.get_configs(
                include_packages_that_depend_on_atom=include_packages_that_depend_on_atom,
                exclude_windows_incompatible_packages=exclude_windows_incompatible_packages):
            configs_to_install.append(package_config)
        installer = TopologicalInstaller(npm, self._package_map, configs_to_install)
        installer.install()

        end = datetime.datetime.now()
        logging.info('FINISH INSTALL: %s', end)
        logging.info('PackageManager.install() took %s seconds.', (end - start).seconds)

    def install_dependencies_by_package_names(self, npm, package_names, copy_local_dependencies=False):
        import datetime
        start = datetime.datetime.now()
        logging.info('START INSTALL: %s', start)

        configs_to_install = []
        for package_config in self.get_configs(package_names=package_names):
            configs_to_install.append(package_config)
        installer = TopologicalInstaller(npm, self._package_map, configs_to_install, copy_local_dependencies)
        installer.install()

        end = datetime.datetime.now()
        logging.info('FINISH INSTALL: %s', end)
        logging.info('PackageManager.install() took %s seconds.', (end - start).seconds)

    def get_configs(self, include_packages_that_depend_on_atom=True,
                    exclude_windows_incompatible_packages=False, package_names=None):
        package_sorter = PackageSorter(self._package_map, package_names_to_start=package_names)
        # configs_in_topological_order is sorted such that if B has a transitive dependency on A,
        # then A appears before B in the list.
        configs_in_topological_order = package_sorter.get_sorted_configs()

        for package_config in configs_in_topological_order:
            is_atom_package = package_config['testRunner'] == 'apm'
            package_name = package_config['name']

            if exclude_windows_incompatible_packages and package_config['windowsIncompatible']:
                # Ignore Windows incompatible package while running in Windows.
                logging.debug('Excluding Windows incompatible package: %s' % package_name)
                continue

            if is_atom_package and not include_packages_that_depend_on_atom:
                # If Atom packages are to be excluded, silently ignore them.
                logging.debug('Excluding atom package: %s' % package_name)
            else:
                logging.debug('Including package: %s' % package_name)
                yield package_config

    def is_local_dependency(self, package_name):
        return package_name in self._package_map

    def get_local_package_root(self, package_name):
        return self._package_map[package_name]['packageRootAbsolutePath']

    def get_package_map(self):
        return self._package_map

    def get_deps(self, package_json, include_dev_dependencies=False, include_local_dependencies=False):
        '''Return a dependency map: key is package name and value is semver range.'''
        # Although it appears that different versions of a package can be requested by
        # dependencies and devDependencies, it seems as though the one in devDependencies
        # should take priority, and should also be within the range specified by dependencies:
        # http://stackoverflow.com/q/29067071/396304.
        dep_types = ['dependencies']
        if include_dev_dependencies:
            dep_types += ['devDependencies']

        all_deps = {}
        config = create_config_for_package(package_json)
        if not config:
            # config is None: this must be a transitive dependency of a Nuclide package.
            package = json_load(package_json)
            config = {
              'dependencies': package.get('dependencies', {}),
              'devDependencies': package.get('devDependencies', {}),
              'bundleDependencies': package.get('bundleDependencies', {}),
              'bundledDependencies': package.get('bundledDependencies', {}),
            }

        # Apparently both spellings are acceptable:
        bundleDependencies = config['bundleDependencies']
        bundledDependencies = config['bundledDependencies']

        for dep_type in dep_types:
            deps = config[dep_type]
            for dep, version in deps.items():
                if dep in bundleDependencies or dep in bundledDependencies:
                    # There is only one case where we have seen this, which is
                    # https://github.com/goatslacker/testla/tree/717542bfe6a07deab28ffb2da23c989332ae37d6.
                    pass
                elif not self.is_local_dependency(dep) or include_local_dependencies:
                    all_deps[dep] = version

        return all_deps


class PackageSorter(object):
    '''Topological sort packages in package_map by their dependencies.

    Args:
        package_names_to_start: If this optional parameter is given, we only sort the packages
        list in package_name_to_start and their (transitive) depedencies.
    '''
    def __init__(self, package_map, package_names_to_start=None):
        self._package_map = package_map
        self._in_progress = set()
        self._visited = set()
        self._sorted_configs = []
        if package_names_to_start:
            for package_name in package_names_to_start:
                if package_name not in package_map:
                    raise ValueError('Package ' + package_name + ' doesn\'t exist.')
                self._depth_first_search(package_name)
        else:
            for package_name in package_map:
                self._depth_first_search(package_name)

    def get_sorted_configs(self):
        return self._sorted_configs

    def _depth_first_search(self, package_name):
        if package_name in self._visited:
            return None
        if package_name in self._in_progress:
            return (package_name, 'Recursive package dependencies: '+ package_name)
        self._in_progress.add(package_name)
        package_config = self._package_map[package_name]
        for dependency in self._package_map[package_name]['localDependencies']:
            error = self._depth_first_search(dependency)
            if error is not None:
                first_recursive_package, message = error;
                if first_recursive_package == package_name:
                    raise Exception(message);
                return (first_recursive_package, message + ', ' + package_name)
        self._in_progress.remove(package_name)
        self._sorted_configs.append(package_config)
        self._visited.add(package_name)


def load_package_configs():
    '''Returns a map where keys are names of packages and values are package configs.'''
    package_map = {}

    # Load packages under the pkg/ directory.
    for path in find_packages():
        config = create_config_for_package(path)
        # config will be None for packages such as sample packages.
        if config:
            # Update the map now that the config is complete.
            package_map[config['name']] = config

    # Now that all of the packages have entries in the package_map, use the keys of the package_map
    # to populate the localDependencies array of each config.
    for package_name, package_config in package_map.items():
        all_deps = []
        all_deps.extend(package_config['dependencies'].keys())
        all_deps.extend(package_config['devDependencies'].keys())
        for dependency in all_deps:
            if dependency in package_map:
                package_config['localDependencies'][dependency] = package_map[dependency]

    return package_map


def find_packages():
    '''Performs a depth-first search of the project root for package.json files.'''
    for (path, dirs, files) in os.walk(PACKAGES_PATH):
        if 'package.json' in files:
            package_json = os.path.join(path, 'package.json')
            # No need to explore subdirectories once package.json is found.
            del dirs[:]
            yield package_json
