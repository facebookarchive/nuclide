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
    if platform_checker.is_windows():
        shell = True
        # Because we have to use `shell=True` on Windows due to https://bugs.python.org/issue17023,
        # we have to do our own escaping. In particular, if semver_range is '>=0.12.0' and is not
        # escaped correctly, then Windows will try to write to a file with that name. The built-in
        # escaping done by subprocess.Popen() does not appear to do the right thing here (it uses
        # single quotes instead of double quotes, which is not sufficient), so we must do the
        # escaping ourselves and convert the args into a string to override the default escaping.
        semver_range = '"%s"' % semver_range
    else:
        shell = False

    args = [platform_checker.get_node_executable(), semver, '--range', semver_range] + versions

    if platform_checker.is_windows():
        args = ' '.join(args)

    proc = subprocess.Popen(args, stdout=subprocess.PIPE, shell=shell)
    matching_versions = []
    for line in proc.stdout:
        matching_versions.append(line.rstrip())
    proc.wait()
    if proc.returncode:
        return None
    else:
        return matching_versions
