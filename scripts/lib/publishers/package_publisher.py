# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import logging
import os
import subprocess

from abstract_publisher import AbstractPublisherConfig
from apm import Apm
from apm_publisher import ApmPublisher
from git import Git
from json_helpers import json_load
from npm import Npm
from npm_publisher import NpmPublisher
from transpiler import Transpiler

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

        # Ensure that nuclide-installer is listed last in atom_packages. We do not want to publish a
        # new version of the installer until we are sure that all of the packages it plans to
        # install have been published.
        for index, package_json_path in enumerate(atom_packages):
            package_name = json_load(package_json_path)['name']
            if package_name == 'nuclide-installer':
                del atom_packages[index]
                atom_packages.append(package_json_path)
                break

        # These are sets of package names.
        nuclide_npm_packages = set()
        nuclide_apm_packages = set()

        publishers = []
        git = Git()
        apm = Apm(git)
        npm = Npm()
        boilerplate_files = {
            'LICENSE': os.path.join(path_to_nuclide_repo, 'LICENSE'),
        }

        # Make sure that everything needed to run the transpile script is installed.
        subprocess.check_call(['npm', 'install'],
                              cwd=os.path.join(path_to_nuclide_repo, 'pkg/nuclide/node-transpiler'))
        transpile_script = os.path.join(path_to_nuclide_repo,
                                        'pkg/nuclide/node-transpiler/bin/transpile')
        transpiler = Transpiler.create_transpiler(path_to_nuclide_repo, transpile_script)

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
                    publisher = NpmPublisher(config, npm, master_tmpdir, transpiler, boilerplate_files)
                else:
                    publisher = ApmPublisher(config, apm, master_tmpdir, transpiler, boilerplate_files, git, github_access_token)
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
            if publisher.is_already_published(version) and not is_dry_run:
                logging.info('Skipping %s@0.0.%s: already published.' %
                    (publisher.get_package_name(), version))
                continue

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
