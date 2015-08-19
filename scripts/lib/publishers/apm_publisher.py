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
from apm_repository_helper import ApmRepositoryHelper
from json_helpers import json_load, json_dump
from package_version_rewriter import update_package_json_versions, rewrite_shrinkwrap_file

DEFAULT_GITIGNORE = '''\
.DS_Store
npm-debug.log*
node_modules
'''

README_PREFIX = '''\
**NOTE:** The official repository for this package is https://github.com/facebook/nuclide.
Please file all issues and pull requests there.

'''

class ApmPublisher(AbstractPublisher):
    ''' Reads and publishes apm packages assuming an incrementing revision number rather than using
        full-fledged semver. Nuclide packages are developed as a consistent set, with 0.0.0 as the
        version that is always stored in source control, but with a 0.0.x scheme that is used for
        the versions published to apm.
    '''

    _version_regex = re.compile('^0\.0\.(\d+)$')

    def __init__(self, config, apm, tmpdir, transpiler, boilerplate_files, git, github_access_token=None):
        self._config = config
        self._apm = apm
        self._tmpdir = os.path.join(tmpdir, 'apm')
        self._transpiler = transpiler
        self._boilerplate_files = boilerplate_files
        self._git = git
        self._apm_repository_helper = ApmRepositoryHelper(git, github_access_token)
        self._repo = None # This will be initialized in prepublish().

    def _checkout_apm_repo(self):
        '''Returns the path to the directory where the clone of the repo was written.'''
        package_name = self.get_package_name()
        repo = os.path.join(self._tmpdir, package_name)
        self._apm_repository_helper.checkout_apm_repo(package_name, repo, create_if_missing=True)
        return repo

    def get_package_name(self):
        return self._config.package_name

    def is_already_published(self, target_version):
        semver = '0.0.%s' % target_version
        return self._apm.is_published(self.get_package_name(), semver)

    def get_published_version(self):
        ''' Reads the `apm show` of the package, gets the current version (of the form 0.0.x)
            and then returns the incrementing version, integer x.
        '''
        logging.info('Attempting to determine version of %s in apm', self.get_package_name())

        semver = self._apm.info(self.get_package_name()).get('version', '')

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

    def prepublish(self, new_version, atom_semver):
        self._repo = self._checkout_apm_repo()

        logging.info('Publishing %s to apm at version %s', self.get_package_name(), new_version)

        # Clean repo out, leaving .git metadata in place.
        logging.info('Cleaning repo for package %s', self.get_package_name())
        self.clean_repo()

        # Copy files from package into repo.
        package = self._config.package_directory
        logging.info('Copying package %s', self.get_package_name())
        self.copy_into_repo(package)

        # Make sure that standard boilerplate files are included in the repo.
        for name, src in self._boilerplate_files.items():
            shutil.copyfile(
                src,
                os.path.join(self._repo, name))

        # Load package.json and rewrite version number within it.
        package_file = os.path.join(self._repo, 'package.json')
        package = json_load(package_file)
        package = update_package_json_versions(self.get_package_name(), package,
            self._config.nuclide_npm_package_names, new_version)

        # Specify the license if it is not already specified.
        if 'license' not in package:
            package['license'] = 'SEE LICENSE IN LICENSE'

        # Update the version of the Atom engine required.
        package['engines'] = {'atom': '>=%s' % atom_semver}

        # Rewrite the repository URL.
        repository = 'https://github.com/facebooknuclideapm/%s' % self.get_package_name()
        package['repository'] = repository

        # Write the adjusted package file back to the temporary directory and publish it.
        json_dump(package, package_file)

        rewrite_shrinkwrap_file(self._repo, self.get_package_name(),
            self._config.nuclide_npm_package_names, new_version)

        # Add a boilerplate .gitignore file if the package does not already have one.
        path_to_gitignore = os.path.join(self._repo, '.gitignore')
        if not os.path.exists(path_to_gitignore):
            with open(path_to_gitignore, 'w') as f:
                f.write(DEFAULT_GITIGNORE)

        # Prefix the README.md with information about the proper repository.
        path_to_readme = os.path.join(self._repo, 'README.md')
        if os.path.exists(path_to_readme):
            with open(path_to_readme, 'r') as f:
                readme_contents = README_PREFIX + f.read()
        else:
            readme_contents = README_PREFIX
        with open(path_to_readme, 'w') as f:
            f.write(readme_contents)

        # Write out the packages to install for the nuclide-installer package.
        if self.get_package_name() == 'nuclide-installer':
            from publishers.nuclide_installer_config import generate_config
            installer_config_json = generate_config(package['version'], self._config.apm_package_names)
            with open(os.path.join(self._repo, 'lib', 'config.json'), 'w') as f:
                f.write(installer_config_json)

        # Pre-transpile Babel files, as appropriate.
        self._transpiler.transpile_in_place(self.get_package_name(), self._repo)


    def publish(self, new_version, atom_semver):
        # Now that all of the local changes have been written, commit them.
        tag_name = 'v0.0.%d' % new_version

        self._git.commit_all(self._repo,
                             'Committing changes in preparation for publishing %s' % tag_name)

        tag_needs_commit = False
        try:
            self._git.add_tag(self._repo, tag_name, 'Atom package %s.' % tag_name)
            tag_needs_commit = True
        except subprocess.CalledProcessError, e:
            if e.returncode == 128:
                # Tag already exists in repo: checkout to tag. Most likely `apm publish` is what
                # failed, so we need to try again.
                self._git.checkout(self._repo, tag_name)
            else:
                raise e

        if tag_needs_commit:
            # We commit the tag first because we should fail if the tag has already been pushed.
            self._git.push_tag(self._repo, tag_name)
            # Pushing to master is not strictly necessary, but it makes it easier to audit the changes
            # that have been made between versions over time.
            self._git.push_to_master(self._repo)

        try:
            self._apm.publish(self._repo, tag_name)
        except subprocess.CalledProcessError:
            logging.error('FAILED to publish package %s at version %d; it may already be published',
                          self.get_package_name(), new_version)

    def clean_repo(self, except_files=[]):
        for child in os.listdir(self._repo):
            if child == '.git' or child in except_files:
                continue
            path = os.path.join(self._repo, child)
            if os.path.isfile(path):
                os.remove(path)
            else:
                shutil.rmtree(path)

    def copy_into_repo(self, source):
        for child in os.listdir(source):
            if child == '.git':
                raise AssertionError('Found unexpected .git files in source %s' % source)
            if child == 'node_modules':
                continue
            path_from = os.path.join(source, child)
            path_to = os.path.join(self._repo, child)
            if os.path.isfile(path_from):
                shutil.copy(path_from, path_to)
            else:
                shutil.copytree(path_from, path_to, ignore=shutil.ignore_patterns('node_modules'))
