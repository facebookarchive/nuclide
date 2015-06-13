# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
from npm import Npm
from npm_publisher import NpmPublisher

class PackagePublisher(object):

    @staticmethod
    def _get_publisher(config):
        if config['isNodePackage']:
            return NpmPublisher(config, Npm())
        return None

    def __init__(self, package_manager, dry_run=False):
        self._publishers = filter(None, [
            PackagePublisher._get_publisher(config) for config in package_manager.get_configs()
            if not config.get('excludeFromRelease', False)
        ])
        self._dry_run = dry_run

    def publish(self):
        '''This publishes packages in topological order with a consistent, incremented version.'''

        # Since individual publishing transactions might have failed on previous occassions, the
        # only way to guarantee that all packages are brought up to the same version is to
        # query npm and increment the highest number from amongst them.
        target_version = self._get_highest_published_version() + 1

        if self._dry_run:
            logging.info('Dry run: aborting. Would have published to version %d', target_version)
            return

        # We use topological order (and fail aggressively) so that published packages always
        # have an equal version (ideally) or lower version (after failure) than their dependencies.
        self._publish_new_versions(target_version)

        # Check to see whether all packages are now at the version we were aiming for.
        verified = self._verify_published_versions(target_version)
        if not verified:
            logging.error('Publication not successful; some packages did not reach target version')
        else:
            logging.info('Publication successful')

    def _get_highest_published_version(self):
        logging.info('Detecting highest currently published version')
        highest_version = 0

        # In theory the first package should nearly always have the highest version number, but
        # we check them all in case a new one has been added at the start of the dependency graph
        # or the topology has changed.
        for publisher in self._publishers:
            version = publisher.get_published_version()
            if version > highest_version:
                highest_version = version
        return highest_version

    def _publish_new_versions(self, version):
        logging.info('Publishing packages at new version %d', version)
        for publisher in self._publishers:
            publisher.publish(version)

    def _verify_published_versions(self, target_version):
        verified = True
        for publisher in self._publishers:
            if not publisher.is_published_version(target_version):
                verified = False
                message = 'Package %s is not at target version %s'
            else:
                message = 'Package %s is at target version %s'
            logging.info(message, publisher.get_package_name(), target_version)
        return verified
