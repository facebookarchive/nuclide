# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import re
import shutil
import subprocess

from abstract_publisher import AbstractPublisher
from json_helpers import json_load, json_dump
from npm import DEPENDENCIES_KEYS

class NpmPublisher(AbstractPublisher):
    ''' Reads and publishes npm packages assuming an incrementing revision number rather than using
        full-fledged semver. Nuclide packages are developed as a consistent set, with 0.0.0 as the
        version that is always stored in source control, but with a 0.0.x scheme that is used for
        the versions published to npm.
    '''

    _version_regex = re.compile('^0\.0\.(\d+)$')

    def __init__(self, config, npm, tmpdir):
        self._config = config
        self._npm = npm
        self._tmpdir = os.path.join(tmpdir, 'npm')

    def get_package_name(self):
        return self._config.package_name

    def get_published_version(self):
        ''' Reads the `npm info` of the package, gets the current version (of the form 0.0.x)
            and then returns the incrementing version, integer x.
        '''
        logging.info('Attempting to determine version of %s in npm', self.get_package_name())

        # We often call this multiple times to check publication progress, so force non-memoization.
        semver = self._npm.info(self._config.package_directory, force=True).get('version', '')

        match = self._version_regex.match(semver)
        if match:
            version = int(match.group(1))
            logging.info('Version of %s is %d', self.get_package_name(), version)
        else:
            version = 0
            logging.warning('Version of %s is not available; defaulting to 0' %
                            self.get_package_name())
        return version

    def is_published_version(self, target_version):
        return self.get_published_version() == target_version

    def publish(self, new_version, atom_semver):
        logging.info('Publishing %s to npm at version %s', self.get_package_name(), new_version)

        # Create temporary directory and copy package into it (without dependencies).
        package = self._config.package_directory
        tmp_package = os.path.join(self._tmpdir, self.get_package_name())
        logging.info('Copying %s to tmpdir', self.get_package_name())
        shutil.copytree(package, tmp_package, ignore=shutil.ignore_patterns('node_modules'))

        # Load package.json and rewrite version number within it.
        nil_semver = '0.0.0'
        new_semver = '0.0.%d' % new_version
        package_file = os.path.join(tmp_package, 'package.json')
        package = json_load(package_file)
        if package['version'] != nil_semver:
            raise AssertionError('Local package %s was not at version 0' % self.get_package_name())
        package['version'] = new_semver

        # Update the versions of our local dependencies accordingly.
        for dependency_key in DEPENDENCIES_KEYS:
            if not dependency_key in package:
                continue
            for (dependency, version) in package[dependency_key].items():
                if not self._config.is_nuclide_npm_package(dependency):
                    continue
                if version != nil_semver:
                    raise AssertionError('Local dependency %s in package %s was not at version 0' %
                                         dependency, self.get_package_name())
                package[dependency_key][dependency] = new_semver

        # Write the adjusted package file back to the temporary directory and publish it.
        json_dump(package, package_file)

        try:
            self._npm.publish(tmp_package)
        except subprocess.CalledProcessError:
            logging.error('FAILED to publish package %s at version %d; it may already be published',
                          self.get_package_name(), new_version)
