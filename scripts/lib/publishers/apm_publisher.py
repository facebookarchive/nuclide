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
import urllib2

from abstract_publisher import AbstractPublisher
from apm import DEPENDENCIES_KEYS
from json_helpers import json_load, json_dump, json_dumps

APM_ORG_NAME = 'facebooknuclideapm'

PRE_LAUNCH = True

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

    def __init__(self, config, apm, tmpdir, git, github_access_token=None):
        self._config = config
        self._apm = apm
        self._tmpdir = os.path.join(tmpdir, 'apm')
        self._git = git
        self._github_access_token = github_access_token
        self._repo = self._checkout_apm_repo()

    def _checkout_apm_repo(self, create_if_missing=True):
        repo = os.path.join(self._tmpdir, self.get_package_name())
        logging.info('Cloning apm repo %s into %s.', self.get_package_name(), repo)
        try:
            self._git.clone('git@github.com:%s/%s.git' % (APM_ORG_NAME, self.get_package_name()),
                            repo)
        except:
            logging.warning('apm repo for %s does not exist.', self.get_package_name())
            if create_if_missing:
                self._create_apm_repo()
                # The call below must NOT create_if_missing, otherwise we might infinitely recurse.
                repo = self._checkout_apm_repo(create_if_missing=False)
            else:
                raise
        return repo

    def _create_apm_repo(self):
        logging.info('Creating initial apm repo for %s.', self.get_package_name())
        url = ('https://api.github.com/orgs/%s/repos?access_token=%s' %
               (APM_ORG_NAME, self._get_github_access_token()))
        data = json_dumps({
            'name': self.get_package_name(),
            'description': ('This is a read-only copy of the %s package found in ' +
                            'https://github.com/facebook/nuclide/tree/master/pkg/. Please file ' +
                            'issues and pull requests against the original instead of this copy.') %
                            self.get_package_name(),
            'homepage': 'http://nuclide.io',
            'has_issues': 'false',
            'has_wiki': 'false',
            'has_downloads': 'false',
        }, indent=None)
        urllib2.urlopen(url=url, data=data).close()

    def _get_github_access_token(self):
        # This will fail for non-Facebook users unless a token has been passed in from above.
        if self._github_access_token:
            return self._github_access_token
        else:
            from fb import credentials
            return credentials.NUCLIDE_BOT_TOKEN

    def get_package_name(self):
        return self._config.package_name

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
        logging.info('Publishing %s to apm at version %s', self.get_package_name(), new_version)

        # Clean repo out, leaving .git metadata in place.
        logging.info('Cleaning repo for package %s', self.get_package_name())
        self.clean_repo()

        # Copy files from package into repo.
        package = self._config.package_directory
        logging.info('Copying package %s', self.get_package_name())
        self.copy_into_repo(package)

        # Load package.json and rewrite version number within it.
        # TODO (jpearce): reconcile with very similar npm code
        nil_semver = '0.0.0'
        new_semver = '0.0.%d' % new_version
        package_file = os.path.join(self._repo, 'package.json')
        package = json_load(package_file)
        if package['version'] != nil_semver:
            raise AssertionError('Local package %s was not at version 0' %
                                 self.get_package_name())
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

        # Update the version of the Atom engine required.
        package['engines'] = {'atom': '>=%s' % atom_semver}

        # Rewrite the repository URL.
        repository = 'https://github.com/facebooknuclideapm/%s' % self.get_package_name()
        package['repository'] = repository

        # Write the adjusted package file back to the temporary directory and publish it.
        json_dump(package, package_file)

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
            installer_config_json = generate_config('v' + new_semver, self._config.apm_package_names)
            with open(os.path.join(self._repo, 'lib', 'config.json'), 'w') as f:
                f.write(installer_config_json)

    def publish(self, new_version, atom_semver):
        if PRE_LAUNCH:
            # Temporarily delete everything before publishing, to keep everything under wraps.
            logging.info('Removing launch files from repo for %s', self.get_package_name())
            self.clean_repo(except_files=['package.json', 'README.md'])

        # TODO: (jpearce) Get GitHub to unblock nuclide-*; this fails  currently.
        try:
            self._apm.publish(self._repo, '0.0.%d' % new_version)
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
