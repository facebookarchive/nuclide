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


class Apm(object):
    '''Abstraction around the apm executable and npm-like actions.'''
    def __init__(self, git, verbose=False):
        self._git = git
        self._verbose = verbose
        self._info_by_name = {}

    def info(self, name, force=False):
        # Memoize the info accessor by default unless forced to refetch.
        if force or not name in self._info_by_name:
            try:
                info = json_loads(self._execute(['apm', 'show', '--json', name]))
            except subprocess.CalledProcessError:
                # For example, if the package has not been published yet.
                logging.info('apm info failed for %s. It may not yet be published.', name)
                info = {}
            self._info_by_name[name] = info
        return self._info_by_name[name]

    def publish(self, package_repo, tag):
        '''tag must already exist in the GitHub repo'''
        self._execute(['apm', 'publish', '--tag', tag], cwd=package_repo)

    def _execute(self, cmd_args, cwd=None):
        if self._verbose:
            output = fs.cross_platform_check_output(cmd_args, cwd=cwd, stderr=subprocess.STDOUT)
            print(output)
        else:
            with open(os.devnull, 'w') as devnull:
                output = fs.cross_platform_check_output(cmd_args, cwd=cwd, stderr=devnull)
        return output
