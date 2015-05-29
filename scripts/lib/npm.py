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
from json_helpers import json_load

DEPENDENCIES_KEYS = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
]


class Npm (object):
    '''Abstraction around the npm executable.'''
    def __init__(self, verbose=False):
        self._verbose = verbose

    def install(self, package_root, clean=False, local_packages=None, include_dev_dependencies=True):
        if clean:
            shutil.rmtree(os.path.join(package_root, 'node_modules'), ignore_errors=True)
        else:
            self._clean_unused_dependencies(package_root);

        self._npm_install(package_root, include_dev_dependencies)

    def _npm_install(self, package_root, include_dev_dependencies):
        npm_command = ['npm', 'install']
        if not include_dev_dependencies:
            npm_command.append('--production')
        self._execute(npm_command, cwd=package_root)

    def _clean_unused_dependencies(self, package_root):
        """Remove unused dependencies for a given package.

        List folders under $pacakge_root/node_modules and compare them to
        $package_root/package.json. If the folder is not a hidden folder (like '.bin') and doesn't
        occur in package.json, run `npm uninstall` to remove it.
        """
        dependencies_root = os.path.join(package_root, 'node_modules')
        if not os.path.exists(dependencies_root):
            return

        meta = json_load(os.path.join(package_root, 'package.json'))
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
            fs.cross_platform_check_call(cmd_args, cwd=cwd, stderr=subprocess.STDOUT)
        else:
            with open(os.devnull, 'w') as devnull:
                fs.cross_platform_check_call(cmd_args,
                                             cwd=cwd,
                                             stdout=devnull,
                                             stderr=devnull,
                                             )
