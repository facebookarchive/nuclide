# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import shutil
import subprocess
import tempfile

from collections import deque
from fs import mkdirs, symlink
from github import is_recognized_github_uri, find_dir_for_github_uri
from json_helpers import json_load
from semver import find_version_in_range


class OfflineInstaller(object):
    '''Installs the dependencies for the configs in the PackageManger from the specified npm directory.'''
    def __init__(self, package_manager, npm_directory):
        self._package_manager = package_manager
        self._npm_directory = npm_directory

    def install(self, copy_local_dependencies=False, include_packages_that_depend_on_atom=True):
        logging.info('OfflineInstaller.install() using %s as the ~/.npm directory.', self._npm_directory)

        # Add the set of packages to install to the queue in topological order.
        queue = deque()
        for config in self._package_manager.get_configs(
                include_packages_that_depend_on_atom=include_packages_that_depend_on_atom):
            package_json = os.path.join(config['packageRootAbsolutePath'], 'package.json')
            pkg = PackageNeedsDepsInstalled(config['name'], package_json, config['includeDevDependencies'])
            queue.append(pkg)

        # Process the items in the queue in order. Dependencies will be traversed in a depth-first
        # manner, so a package's dependencies will be added to the front of the queue.
        while len(queue):
            pkg = queue.popleft()
            process_package(pkg, copy_local_dependencies, queue, self._package_manager, self._npm_directory)


def process_package(pkg, copy_local_dependencies, queue, package_manager, npm_directory):
    logging.info('OfflineInstaller is installing %s', pkg.name)
    package_json = pkg.package_json
    all_deps = package_manager.get_deps(package_json,
                                        pkg.include_dev_dependencies,
                                        include_local_dependencies=True)
    if not all_deps:
        return

    package_root = os.path.dirname(package_json)
    node_modules = os.path.join(package_root, 'node_modules')
    bin_dir = os.path.join(node_modules, '.bin')
    mkdirs(node_modules)
    for name, version in all_deps.items():
        package_dir = os.path.join(node_modules, name)
        if package_manager.is_local_dependency(name):
            if copy_local_dependencies:
                # A packaging tool may want the option to copy rather than symlink dependencies.
                shutil.copytree(package_manager.get_local_package_root(name), package_dir)
            else:
                # Prefer local symlink if it is an option.
                symlink(package_manager.get_local_package_root(name), package_dir)
        # Install the dependency at node_modules/pkg_name.
        # Note that if there is a compatible version in a parent node_modules,
        # then you should not install it again in order to save space
        # (and in some cases, to avoid cycles).
        elif not has_ancestor_with_dep(name, version, node_modules):
            # TODO: If the package.json has a preinstall step, it should be run.
            install_package(name, version, package_dir, npm_directory)

            # Add the package.json for the dependency to the queue.
            pkg_to_install = PackageNeedsDepsInstalled(name, os.path.join(package_dir, 'package.json'))
            queue.appendleft(pkg_to_install)
        else:
            # Unclear whether .bin should still get installed in this case. If so,
            # has_ancestor_with_dep() should be changed to return the path to the ancestor.
            continue

        # If the dependency's package.json has bin entries, then they need to be
        # symlinked to the dependent package's node_modules/.bin directory.
        package_info = json_load(os.path.join(package_dir, 'package.json'))
        bin = package_info.get('bin', None)
        if isinstance(bin, str):
            bin_command = bin
            bin = {}
            bin[package_info['name']] = bin_command
        if isinstance(bin, dict) and bin:
            mkdirs(bin_dir)
            for script_name, local_path in bin.items():
                symlink(os.path.join(package_dir, local_path), os.path.join(bin_dir, script_name))


def has_ancestor_with_dep(name, version, node_modules):
    candidate_dir = os.path.join(node_modules, name)
    if os.path.isdir(candidate_dir):
        package_json = os.path.join(candidate_dir, 'package.json')
        discovered_version = json_load(package_json)['version']
        if find_version_in_range([discovered_version], version):
            return True
    # Look upwards to the next node_modules, if present.
    parent_node_modules = os.path.normpath(os.path.join(node_modules, '../../'))
    if os.path.basename(parent_node_modules) == 'node_modules':
        return has_ancestor_with_dep(name, version, parent_node_modules)
    else:
        return False


def install_package(name, version, dest_directory, npm_directory):
    if is_recognized_github_uri(version):
        # In the GitHub URI case, the files are already unzipped.
        package_dir = find_dir_for_github_uri(version, npm_directory)
        shutil.copytree(package_dir, dest_directory)
    else:
        available_versions = find_available_versions(name, npm_directory)
        semver_range = version if version != 'latest' else '*'
        matching_versions = find_version_in_range(available_versions, semver_range)
        if not matching_versions:
            raise Exception('No package found for %s@%s' % (name, version))

        # In the common case, package_dir contains two entries:
        # - package.tgz
        # - package/package.json
        package_dir = os.path.join(npm_directory, name, matching_versions[-1])

        # The package.tgz has one root entry, package/, which contains all of the package contents.
        #
        # In practice, I have seen one exception, which is defs@1.1.0 (and other versions of defs)
        # where the root folder is named "defs" instead of "package".
        tgz = os.path.join(package_dir, 'package.tgz')
        temp_dir = tempfile.mkdtemp()
        subprocess.check_call(['tar', '-xzf', tgz], cwd=temp_dir)
        tar_folder = os.listdir(temp_dir)[0]
        shutil.move(os.path.join(temp_dir, tar_folder), dest_directory)
        shutil.rmtree(temp_dir)


def find_available_versions(name, npm_directory):
    return os.listdir(os.path.join(npm_directory, name))


class PackageNeedsDepsInstalled(object):
    '''Represents a package.json on disk that needs its dependencies installed.'''
    def __init__(self, name, package_json, include_dev_dependencies=False):
        self.name = name
        # Absolute path to the package.json.
        self.package_json = package_json
        # Whether to install its devDependencies.
        self.include_dev_dependencies = include_dev_dependencies
