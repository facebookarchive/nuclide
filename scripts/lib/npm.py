# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import logging
import os
import os.path
import shutil
import subprocess

from json_helpers import json_load, json_loads
from package_config import create_config_for_manifest

DEPENDENCIES_KEYS = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
]


class Npm (object):
    '''Abstraction around the npm executable.'''
    def __init__(self, verbose=False):
        self._verbose = verbose
        self._info_by_root = {}

    def info(self, package_root, force=False):
        # Memoize the info accessor by default unless forced to refetch.
        if force or not package_root in self._info_by_root:
            try:
                info = json_loads(self._execute(['npm', 'info', '--json'], cwd=package_root))
            except subprocess.CalledProcessError:
                # For example, if the package has not been published yet.
                logging.info('npm info failed for %s. It may not yet be published.', package_root)
                info = {}
            self._info_by_root[package_root] = info
        return self._info_by_root[package_root]

    def publish(self, package_root):
        return self._execute(['npm', 'publish'], cwd=package_root)

    def clean(self, package_root):
        shutil.rmtree(os.path.join(package_root, 'node_modules'), ignore_errors=True)

    def install(self, package_root, clean=False, local_packages=None, include_dev_dependencies=True):
        if clean:
            self.clean(package_root)
        else:
            self._clean_unused_dependencies(package_root);

        self._npm_install(package_root, include_dev_dependencies)

    def _npm_install(self, package_root, include_dev_dependencies):
        npm_command = ['npm', 'install']
        if not include_dev_dependencies:
            npm_command.append('--production')
        self._execute(npm_command, cwd=package_root)

    def shrinkwrap(self, package_root, include_dev_dependencies=True):
        npm_command = ['npm', 'shrinkwrap']
        if include_dev_dependencies:
            npm_command.append('--dev')
        self._execute(npm_command, cwd=package_root)

    def _clean_unused_dependencies(self, package_root):
        """Remove unused dependencies for a given package.

        List folders under $package_root/node_modules and compare them to
        $package_root/package.json. If the folder is not a hidden folder (like '.bin') and doesn't
        occur in package.json, run `npm uninstall` to remove it.
        """
        dependencies_root = os.path.join(package_root, 'node_modules')
        if not os.path.exists(dependencies_root):
            return

        package_json_path = os.path.join(package_root, 'package.json')
        meta = json_load(package_json_path)

        # If working with a Nuclide packages, use its custom config builder because it loads info
        # from more places than just the single "package.json".
        if meta.get('nuclide') != None:
            meta = create_config_for_manifest(package_json_path, meta)

        dependencies = set()
        for key in DEPENDENCIES_KEYS:
            dependencies = dependencies.union(set(meta.get(key, {}).keys()))

        for folder in os.listdir(dependencies_root):
            if folder not in dependencies and not folder.startswith('.'):
                logging.info('Uninstall unused dependency %s for %s' % (folder, package_root))
                # Using `npm uninstall` so that the files in .bin will also be removed.
                self._execute(['npm', 'uninstall', folder], package_root)

    def _execute(self, cmd_args, cwd=None):
        if self._verbose:
            output = fs.cross_platform_check_output(cmd_args, cwd=cwd, stderr=subprocess.STDOUT)
            print(output)
        else:
            with open(os.devnull, 'w') as devnull:
                output = fs.cross_platform_check_output(cmd_args, cwd=cwd, stderr=devnull)
        return output
