# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import logging
import os
import platform_checker
import shutil
import subprocess

try:
    import queue
except ImportError:
    import Queue as queue

from multiprocessing import Process, cpu_count

from json_helpers import json_load
from fs import symlink

PACKAGES_PATH = os.path.realpath(os.path.join(os.path.dirname(__file__), '../../pkg'))


class PackageManager(object):
    def __init__(self):
        # Keys are names of packages and values are the corresponding configs.
        self._package_map = load_package_configs()
        package_sorter = PackageSorter(self._package_map)
        # _configs_in_topological_order is sorted such that if B has a transitive dependency on A,
        # then A appears before B in the list.
        self._configs_in_topological_order = package_sorter.get_sorted_configs()

    def install_dependencies(self, npm, include_packages_that_depend_on_atom=True):
        import datetime
        start = datetime.datetime.now()
        logging.info('START INSTALL: %s', start)

        configs_to_install = []
        for package_config in self.get_configs(include_packages_that_depend_on_atom):
            configs_to_install.append(package_config)
        installer = TopologicalInstaller(npm, self._package_map, configs_to_install)
        installer.install()

        end = datetime.datetime.now()
        logging.info('FINISH INSTALL: %s', end)
        logging.info('PackageManager.install() took %s seconds.', (end - start).seconds)

    def get_configs(self, include_packages_that_depend_on_atom=True):
        for package_config in self._configs_in_topological_order:
            is_atom_package = package_config['testRunner'] == 'apm'
            exclude = package_config.get('excludeFromRelease', False)
            package_name = package_config['name']

            if is_atom_package and not include_packages_that_depend_on_atom:
                # If Atom packages are to be excluded, silently ignore them.
                logging.debug('Excluding atom package: %s' % package_name)
                pass
            elif exclude:
                logging.info('Excluding from installation: %s' % package_name)
            else:
                logging.debug('Including package: %s' % package_name)
                yield package_config

    def is_local_dependency(self, package_name):
        return package_name in self._package_map

    def get_local_package_root(self, package_name):
        return self._package_map[package_name]['packageRootAbsolutePath']

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
        package = json_load(package_json)

        # Apparently both spellings are acceptable:
        bundleDependencies = package.get('bundleDependencies', {})
        bundledDependencies = package.get('bundledDependencies', {})

        for dep_type in dep_types:
            deps = package.get(dep_type, {})
            for dep, version in deps.items():
                if dep in bundleDependencies or dep in bundledDependencies:
                    # There is only one case where we have seen this, which is
                    # https://github.com/goatslacker/testla/tree/717542bfe6a07deab28ffb2da23c989332ae37d6.
                    pass
                elif not self.is_local_dependency(dep) or include_local_dependencies:
                    all_deps[dep] = version

        return all_deps


class PackageSorter(object):
    def __init__(self, package_map):
        self._package_map = package_map
        self._visited = set()
        self._sorted_configs = []
        for package_name in package_map:
            self._depth_first_search(package_name)

    def get_sorted_configs(self):
        return self._sorted_configs

    def _depth_first_search(self, package_name):
        if package_name in self._visited:
            return
        package_config = self._package_map[package_name]
        for dependency in self._package_map[package_name]['localDependencies']:
            self._depth_first_search(dependency)
        self._sorted_configs.append(package_config)
        self._visited.add(package_name)


class TopologicalInstaller(object):
    '''Installs npm/apm packages in topological order, exploiting parallelism.'''
    def __init__(self, npm, package_map, configs_in_topological_order):
        config_name_to_num_deps = {}
        config_name_to_parents = {}
        for config in configs_in_topological_order:
            config_name = config['name']
            config_name_to_num_deps[config_name] = len(config['localDependencies'])
            config_name_to_parents[config_name] = []
            for package_name in config['localDependencies']:
                if not package_name in config_name_to_parents:
                    raise ValueError('Package ' + config_name + ' missing dependency ' + package_name)
                dep_config = config_name_to_parents[package_name]
                dep_config.append(config_name)

        self._npm = npm
        self._package_map = package_map
        self._configs_in_topological_order = list(configs_in_topological_order)
        self._config_name_to_num_deps = config_name_to_num_deps
        self._config_name_to_parents = config_name_to_parents

    def install(self):
        if platform_checker.is_windows():
            # Python's multiprocessing library has issues on Windows, so it seems easiest to avoid it:
            # https://docs.python.org/2/library/multiprocessing.html#windows
            self._do_serial_install()
        else:
            self._do_multiprocess_install()

    def _do_serial_install(self):
        for config in self._configs_in_topological_order:
            install_dependencies(config, self._npm)

    def _do_multiprocess_install(self):
        # Make a local copy of this map because it is mutated by this method and
        # we want to be sure that install() can be invoked more than once.
        config_name_to_num_deps = self._config_name_to_num_deps.copy()

        # Add all configs with no dependencies to the queue.
        configs_to_process = queue.Queue()
        for config_name, num_deps in config_name_to_num_deps.items():
            if num_deps == 0:
                configs_to_process.put(self._package_map[config_name])

        # Every config that is currently being processed has an entry in this map.
        # This functions as a worker pool.
        process_to_config = {}

        NUM_PROCESSES = cpu_count()
        is_alive = lambda p: p.is_alive()

        # At each iteration of the loop, see if there is room in the worker pool. If there is,
        # create a job for the element at the front of the work queue (configs_to_process).
        # If not, do a busy wait. When a job finishes, decrement the number of deps in the parent.
        # When the parent has zero deps, then it is added to the work queue.
        while True:
            # Note that filter() returns an iterator rather than a list in Python 3.
            num_active = len(list(filter(is_alive, process_to_config)))
            if num_active == NUM_PROCESSES:
                # All workers are busy: wait and try again.
                continue
            elif num_active < len(process_to_config):
                # There is at least one inactive process in the worker pool: find it.
                inactive_process = None
                for process in process_to_config:
                    if not is_alive(process):
                        inactive_process = process
                        break

                # Verify the error code of the completed process.
                exitcode = inactive_process.exitcode
                if exitcode:
                    config = process_to_config[inactive_process]
                    raise Exception('Installing package %s failed with exit code %s' %
                        (config['name'], exitcode))

                # Remove the process from the worker pool.
                completed_config = process_to_config[inactive_process]
                del process_to_config[inactive_process]

                # Tell the parents of the completed config that one of its dependencies
                # has been processed.
                for parent_config_name in self._config_name_to_parents[completed_config['name']]:
                    num_deps = config_name_to_num_deps[parent_config_name]
                    num_deps -= 1
                    config_name_to_num_deps[parent_config_name] = num_deps
                    if num_deps == 0:
                        configs_to_process.put(self._package_map[parent_config_name])
            elif not configs_to_process.empty():
                # There is room in the pool and work to be done: add a job!
                config = configs_to_process.get()
                process = Process(target=install_dependencies, args=(config, self._npm))
                process.start()
                process_to_config[process] = config
            elif num_active > 0:
                # There are no more configs to enqueue, but there are still active processes that
                # need to terminate.
                pass
            else:
                # The pool is empty and all processes are in the finished state. Terminate!
                break


def load_package_configs():
    package_map = {}

    # Load packages under the pkg/ directory.
    for path in find_packages():
        manifest = json_load(path)
        nuclide_config = manifest.get('nuclide')
        # Skip if not a nuclide package.
        if nuclide_config == None:
            continue
        package_type = nuclide_config.get('packageType')
        test_runner = nuclide_config.get('testRunner')
        disableTests = nuclide_config.get('excludeTestsFromContinuousIntegration', False)
        includeDevDependencies = nuclide_config.get('includeDevDependencies', True)
        installLibClang = nuclide_config.get('installLibClang', False)

        config = {}
        config['name'] = manifest['name']
        config['isNodePackage'] = package_type == 'Node'
        config['localDependencies'] = {}
        config['packageRootAbsolutePath'] = os.path.dirname(path)
        config['testRunner'] = test_runner
        config['excludeTestsFromContinuousIntegration'] = disableTests
        config['includeDevDependencies'] = includeDevDependencies
        config['excludeFromRelease'] = False
        config['installLibClang'] = installLibClang
        package_map[config['name']] = config

    # Special-case some legacy package-loading code.
    include_legacy_packages = None
    try:
        from fb.legacy_config_loader import legacy_config_loader
        include_legacy_packages = legacy_config_loader
    except Exception as e:
        pass
    if include_legacy_packages:
        include_legacy_packages(package_map)

    # Now that all of the packages have entries in the package_map, use the keys of the package_map
    # to populate the localDependencies array of each config.
    for package_name, package_config in package_map.items():
        package_meta_path = os.path.join(package_config['packageRootAbsolutePath'], 'package.json')
        if not os.path.exists(package_meta_path):
            continue

        package_meta = json_load(package_meta_path)
        all_deps = []
        all_deps.extend(package_meta.get('dependencies', {}).keys())
        all_deps.extend(package_meta.get('devDependencies', {}).keys())
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


def install_dependencies(package_config, npm):
    name = package_config['name']
    is_node_package = package_config['isNodePackage']
    package_type = 'Node' if is_node_package else 'Atom'
    logging.info('Installing dependencies for %s package %s...', package_type, name)

    # Link private node dependencies.
    src_path = package_config['packageRootAbsolutePath']
    fs.mkdirs(os.path.join(src_path, 'node_modules'))
    for local_dependency, local_dependency_config in package_config['localDependencies'].items():
        src_dir = local_dependency_config['packageRootAbsolutePath']
        dest_dir = os.path.join(src_path, 'node_modules', local_dependency)
        if platform_checker.is_windows():
            shutil.rmtree(dest_dir, ignore_errors=True)
            shutil.copytree(src_dir, dest_dir)
        else:
            symlink(src_dir, dest_dir)
        link_dependencys_executable(src_path, local_dependency)

    # Install other public node dependencies.
    npm.install(src_path, local_packages=package_config['localDependencies'], include_dev_dependencies=package_config['includeDevDependencies'])
    logging.info('Done installing dependencies for %s', name)

    # Install libclang dependencies, if appropriate.
    if package_config.get('installLibClang', False):
        try:
            from fb.libclang import install_libclang
            logging.info('Installing libclang extra dependencies...')
            install_libclang(src_path)
            logging.info('Done installing libclang extra dependencies.')
        except ImportError:
            logging.info('Skip Libclang installation for open source version.')

    is_node_package = package_config.get('isNodePackage')
    if not is_node_package:
        logging.info('Running `apm link %s`...', src_path)
        cmd_args = ['apm', 'link', src_path]
        fs.cross_platform_check_output(cmd_args)
        logging.info('Done linking %s', name)


# If a node module has 'bin' field configured in 'package.json', we should create
# a symlink from the executable file configured in 'bin' field to current package's
# ./node_modules/.bin/ folder. (https://docs.npmjs.com/files/package.json#bin)
# In our case, we need it to run customized jasmine unittest.
def link_dependencys_executable(package_root, dependency_name):
    node_modules_path = os.path.join(package_root, 'node_modules')
    dependency_root = os.path.join(package_root, 'node_modules', dependency_name)
    dependency_config = json_load(os.path.join(dependency_root, 'package.json'))

    # The bin field would ether be a dict or a string. if it's a dict,
    # such as `{ "name": "test", "bin" : { "myapp" : "./cli.js" } }`, we should create a
    # symlink from ./node_modules/test/cli.js to ./node_modules/.bin/myapp.
    # If it's a string, like `{ "name": "test", "bin" : "./cli.js"  }`, then the symlink's name
    # should be name of the package, in this case, it should be ./node_modules/.bin/test .
    bin_config = dependency_config.get('bin')
    if not bin_config:
        return
    elif type(bin_config) == dict:
        symlinks_to_create = bin_config
    else:
        symlinks_to_create = {dependency_name: bin_config}

    for dst_name, relative_src_path in symlinks_to_create.items():
        absolute_dst_path = os.path.join(node_modules_path, '.bin', dst_name)
        absolute_src_path = os.path.join(dependency_root, relative_src_path)

        if platform_checker.is_windows():
            shutil.copyfile(absolute_src_path, absolute_dst_path)
        else:
            symlink(absolute_src_path, absolute_dst_path)
