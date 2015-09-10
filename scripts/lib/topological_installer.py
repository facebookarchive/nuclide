# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import hashlib
import logging
import os
import platform_checker
import shutil

try:
    import queue
except ImportError:
    import Queue as queue

from multiprocessing import Process, cpu_count

from json_helpers import json_load
from fs import symlink


class TopologicalInstaller(object):
    '''Installs npm/apm packages in topological order, exploiting parallelism.'''
    def __init__(self, npm, package_map, configs_in_topological_order, copy_local_dependencies=False):
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
        self._copy_local_dependencies = copy_local_dependencies

    def install(self):
        if platform_checker.is_windows():
            # Python's multiprocessing library has issues on Windows, so it seems easiest to avoid it:
            # https://docs.python.org/2/library/multiprocessing.html#windows
            self._do_serial_install()
        else:
            self._do_multiprocess_install()

    def _do_serial_install(self):
        for config in self._configs_in_topological_order:
            install_dependencies(config, self._npm, self._copy_local_dependencies)

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
                process = Process(target=install_dependencies, args=(config, self._npm, self._copy_local_dependencies))
                process.start()
                process_to_config[process] = config
            elif num_active > 0:
                # There are no more configs to enqueue, but there are still active processes that
                # need to terminate.
                pass
            else:
                # The pool is empty and all processes are in the finished state. Terminate!
                break


def install_dependencies(package_config, npm, copy_local_dependencies=False):
    name = package_config['name']
    is_node_package = package_config['isNodePackage']
    package_type = 'Node' if is_node_package else 'Atom'
    logging.info('Installing dependencies for %s package %s...', package_type, name)

    # Link private node dependencies.
    src_path = package_config['packageRootAbsolutePath']
    node_modules_path = os.path.join(src_path, 'node_modules')
    fs.mkdirs(node_modules_path)
    for local_dependency, local_dependency_config in package_config['localDependencies'].items():
        src_dir = local_dependency_config['packageRootAbsolutePath']
        dest_dir = os.path.join(node_modules_path, local_dependency)
        if copy_local_dependencies:
            shutil.copytree(src_dir, dest_dir, True);
        else:
            symlink(src_dir, dest_dir, relative=True)
        link_dependencys_executable(node_modules_path, local_dependency)

    # Install other public node dependencies.
    #
    # We store the sha sum of package.json under the node_modules directory. If
    # the sum matches, we skip the call to `npm install`.
    sum_path = os.path.join(node_modules_path, 'package.json.sum')
    package_json_path = os.path.join(src_path, 'package.json')
    package_json_sum = hashlib.sha1(read_file(package_json_path)).hexdigest()
    valid_sum = read_file(sum_path) == package_json_sum
    if valid_sum:
        logging.info('Dependencies for %s already installed', name)
    else:
        npm.install(src_path, local_packages=package_config['localDependencies'], include_dev_dependencies=True)
        write_file(sum_path, package_json_sum)
        logging.info('Done installing dependencies for %s', name)

    is_node_package = package_config.get('isNodePackage')
    if not is_node_package:
        logging.info('Running `apm link %s`...', src_path)
        cmd_args = ['apm', 'link', src_path]
        fs.cross_platform_check_output(cmd_args)
        logging.info('Done linking %s', name)


def read_file(filename):
    try:
        with open(filename) as file:
            return file.read()
    except IOError:
        return None

def write_file(filename, contents):
    try:
        with open(filename, 'w') as file:
            file.write(contents)
    except IOError:
        logging.info('Failed to write to file %s', filename)

# If a node module has 'bin' field configured in 'package.json', we should create
# a symlink from the executable file configured in 'bin' field to current package's
# ./node_modules/.bin/ folder. (https://docs.npmjs.com/files/package.json#bin)
# In our case, we need it to run customized jasmine unittest.
def link_dependencys_executable(node_modules_path, dependency_name):
    dependency_root = os.path.join(node_modules_path, dependency_name)
    dependency_config = json_load(os.path.join(dependency_root, 'package.json'))

    # The bin field would ether be a dict or a string. if it's a dict,
    # such as `{ "name": "test", "bin" : { "myapp" : "./cli.js" } }`, we should create a
    # symlink from ./node_modules/test/cli.js to ./node_modules/.bin/myapp.
    # If it's a string, like `{ "name": "test", "bin" : "./cli.js"  }`, then the symlink's name
    # should be name of the package, in this case, it should be ./node_modules/.bin/test .
    bin_config = dependency_config.get('bin')
    if not bin_config:
        return
    elif isinstance(bin_config, dict):
        symlinks_to_create = bin_config
    else:
        symlinks_to_create = {dependency_name: bin_config}

    dot_bin_path = os.path.join(node_modules_path, '.bin')
    if platform_checker.is_windows():
        fs.mkdirs(dot_bin_path)

    for dst_name, relative_src_path in symlinks_to_create.items():
        absolute_dst_path = os.path.join(dot_bin_path, dst_name)
        absolute_src_path = os.path.join(dependency_root, relative_src_path)

        if platform_checker.is_windows():
            shutil.copyfile(absolute_src_path, absolute_dst_path)
        else:
            symlink(absolute_src_path, absolute_dst_path, relative=True)
