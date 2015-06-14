# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import logging
import os
from json_helpers import json_load
from npm import Npm
from abstract_publisher import AbstractPublisherConfig
from npm_publisher import NpmPublisher

class PackagePublisher(object):

    @staticmethod
    def create_package_publisher_from_packages_script(path_to_nuclide_repo, dry_run=False):
        def get_list_of_packages(package_type):
            stdout = fs.cross_platform_check_output(
                    ['./scripts/dev/packages', '--package-type', package_type],
                    cwd=path_to_nuclide_repo)
            # Split by newlines and then remove the last element, which will be the empty string.
            return stdout.split('\n')[:-1]
        node_packages = get_list_of_packages('Node')
        atom_packages = get_list_of_packages('Atom')

        nuclide_npm_packages = set()
        publishers = []
        npm = Npm()
        def process_packages(packages, is_npm):
            for package_json in packages:
                package_name = json_load(package_json)['name']
                if is_npm:
                    nuclide_npm_packages.add(package_name)

                config = AbstractPublisherConfig(
                    package_name,
                    os.path.dirname(package_json),
                    nuclide_npm_packages)
                if is_npm:
                    publisher = NpmPublisher(config, npm)
                    publishers.append(publisher)
                else:
                    # TODO: Create ApmPublisher and move publishers.append() after if/else.
                    pass

        # Note that the resulting publishers array will be organized such that all
        # Node packages appear in topologically sorted order followed by all Atom packages.
        process_packages(node_packages, is_npm=True)
        process_packages(atom_packages, is_npm=False)
        return PackagePublisher(publishers, dry_run)

    def __init__(self, publishers, dry_run):
        self._publishers = publishers
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
