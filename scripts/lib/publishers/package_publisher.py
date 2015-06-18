# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import logging
import os


from abstract_publisher import AbstractPublisherConfig
from apm import Apm
from apm_publisher import ApmPublisher
from git import Git
from json_helpers import json_load
from npm import Npm
from npm_publisher import NpmPublisher

class PackagePublisher(object):

    @staticmethod
    def create_package_publisher(path_to_nuclide_repo, master_tmpdir, github_access_token):
        def get_list_of_packages(package_type):
            stdout = fs.cross_platform_check_output(
                    ['./scripts/dev/packages', '--package-type', package_type],
                    cwd=path_to_nuclide_repo)
            # Split by newlines and then remove the last element, which will be the empty string.
            return stdout.split('\n')[:-1]
        # These are lists of absolute paths to package.json files.
        node_packages = get_list_of_packages('Node')
        atom_packages = get_list_of_packages('Atom')

        # These are sets of package names.
        nuclide_npm_packages = set()
        nuclide_apm_packages = set()

        publishers = []
        git = Git()
        apm = Apm(git)
        npm = Npm()

        def process_packages(packages, is_npm):
            for package_json in packages:
                package_name = json_load(package_json)['name']
                if is_npm:
                    nuclide_npm_packages.add(package_name)
                else:
                    nuclide_apm_packages.add(package_name)

                config = AbstractPublisherConfig(
                    package_name,
                    os.path.dirname(package_json),
                    nuclide_npm_packages,
                    nuclide_apm_packages)
                if is_npm:
                    publisher = NpmPublisher(config, npm, master_tmpdir)
                else:
                    publisher = ApmPublisher(config, apm, master_tmpdir, git, github_access_token)
                publishers.append(publisher)

        # Note that the resulting publishers array will be organized such that all
        # Node packages appear in topologically sorted order followed by all Atom packages.
        process_packages(node_packages, is_npm=True)
        process_packages(atom_packages, is_npm=False)
        return PackagePublisher(publishers)

    def __init__(self, publishers):
        self._publishers = publishers

    def publish(self, target_version, is_dry_run):
        '''This publishes packages at the given version.'''

        # We use topological order (and fail aggressively) so that published packages always
        # have an equal version (ideally) or lower version (after failure) than their dependencies.
        self._publish_new_versions(target_version, is_dry_run)
        if is_dry_run:
            return

        # Check to see whether all packages are now at the version we were aiming for.
        verified = self._verify_published_versions(target_version)
        if not verified:
            logging.error('Publication not successful; some packages did not reach target version')
        else:
            logging.info('Publication successful')

    def _publish_new_versions(self, version, is_dry_run):
        from nuclide_config import NUCLIDE_CONFIG
        atom_semver = json_load(NUCLIDE_CONFIG)['atomVersion']
        logging.info('Publishing packages at new version %d (Atom %s)', version, atom_semver)
        for publisher in self._publishers:
            publisher.prepublish(version, atom_semver)
            if not is_dry_run:
                publisher.publish(version, atom_semver)

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
