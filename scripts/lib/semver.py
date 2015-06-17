# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

# Wrapper around bin/semver.

import logging
import os
import platform_checker
import subprocess

semver = os.path.join(os.path.dirname(__file__), 'semver/bin/semver')

def find_version_in_range(versions, semver_range):
    '''versions is an array of semver versions and semver_range is a semver range expression.

    Assumes the environment has `node` on the $PATH.
    '''
    logging.debug('Trying to match %s against %s.', semver_range, versions)
    args = [platform_checker.get_node_executable(), semver, '-r', semver_range] + versions
    shell = True if platform_checker.is_windows() else False
    proc = subprocess.Popen(args, stdout=subprocess.PIPE, shell=shell)
    matching_versions = []
    for line in proc.stdout:
        matching_versions.append(line.rstrip())
    proc.wait()
    if proc.returncode:
        return None
    else:
        return matching_versions
