# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import shutil

from collections import deque
from fs import mkdirs
from json_helpers import json_load
from semver import find_version_in_range


class OfflineDeduper(object):
    '''Dedupes node packages by pushing duplicate dependencies into first ancestor's node_modules directory.'''
    def __init__(self, package_manager):
        self._package_manager = package_manager

    def dedupe(self, package_name, package_root):
        '''
        Note dedupe will move transitive dependencies folder around to dedupe, so it
        is likely to break symlinked local dependencies.
        '''
        # TODO(chenshen) set up .bin folder when neccessary.
        queue = deque()
        root_package = Package(package_name, package_root, self._package_manager)
        queue.extend(root_package.get_installed_dependencies())

        logging.info('OfflineDeduper.dedupe() started.')
        while len(queue):
            pkg = queue.popleft()
            for package in pkg.get_installed_dependencies():
                dependency_of_root = root_package.get_installed_dependency(package.name)
                if dependency_of_root:
                    if is_compatible(dependency_of_root.version, package.expected_range):
                        logging.info('Deleting duplicate dependency %s' % package.name)
                        package.delete()
                    else:
                        queue.append(package)
                else:
                    logging.info('Pushing dependency %s to root' % package.name)
                    package = package.move(os.path.join(package_root, 'node_modules', package.name))
                    queue.append(package)
        logging.info('OfflineDeduper.dedupe() stopped.')


def is_compatible(version, expected_range):
    matches = find_version_in_range([version], expected_range)
    return matches and len(matches)


class Package(object):
    def __init__(self, package_name, package_root, package_manager, expected_range=''):
        self._root = package_root
        self._name = package_name
        self._expected_range = expected_range
        self._package_manager = package_manager

    def get_installed_dependencies(self):
        package_json = os.path.join(self._root, 'package.json')
        all_deps = self._package_manager.get_deps(package_json, include_dev_dependencies=False,
                                                  include_local_dependencies=True)
        node_modules_path = os.path.join(self._root, 'node_modules')

        if not os.path.exists(node_modules_path):
            return []

        dependencies = []
        for basename in os.listdir(node_modules_path):
            fullpath = os.path.join(node_modules_path, basename)
            if not os.path.exists(os.path.join(fullpath,  'package.json')):
                continue

            dependencies.append(Package(basename, fullpath, self._package_manager,
                                all_deps.get(basename, '')))
        return dependencies

    def get_installed_dependency(self, dependency_name):
        package_json = os.path.join(self._root, 'package.json')
        all_deps = self._package_manager.get_deps(package_json, include_dev_dependencies=False,
                                                  include_local_dependencies=True)
        dependency_root = os.path.join(self._root, 'node_modules', dependency_name)

        if not os.path.exists(os.path.join(dependency_root, 'package.json')):
            return None

        return Package(dependency_name, dependency_root, self._package_manager,
                       all_deps.get(dependency_name, ''))

    def delete(self):
        shutil.rmtree(self._root)

    def move(self, destination):
        shutil.move(self._root, destination)
        return Package(self._name, destination, self._package_manager, self._expected_range)

    @property
    def name(self):
        return self._name

    @property
    def expected_range(self):
        return self._expected_range

    @property
    def version(self):
        return json_load(os.path.join(self._root, 'package.json'))['version']
