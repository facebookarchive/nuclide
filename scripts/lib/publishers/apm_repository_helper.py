# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os.path
import urllib2

from json_helpers import json_dumps

APM_ORG_NAME = 'facebooknuclideapm'


class ApmRepositoryHelper(object):

    def __init__(self, git, github_access_token=None):
        self._git = git
        self._github_access_token = github_access_token

    @property
    def git(self):
        return self._git

    def checkout_apm_repo(self, package_name, repo, create_if_missing):
        '''Returns the path to the directory where the clone of the repo was written.'''
        logging.info('Cloning apm repo %s into %s.', package_name, repo)
        try:
            self._git.clone('git@github.com:%s/%s.git' % (APM_ORG_NAME, package_name),
                            repo)
        except:
            logging.warning('apm repo for %s does not exist.', package_name)
            if create_if_missing:
                self._create_apm_repo(package_name)
                # The call below must NOT create_if_missing, otherwise we might infinitely recurse.
                self.checkout_apm_repo(package_name, repo, create_if_missing=False)

                # Initialize the repository by creating and pushing the first commit.
                with open(os.path.join(repo, 'README.md'), 'w') as f:
                    f.write('# %s\n' % package_name)
                self._git.commit_all(repo, 'Initial import.')
                self._git.push_to_master(repo)
            else:
                raise


    def _create_apm_repo(self, package_name):
        logging.info('Creating initial apm repo for %s.', package_name)
        url = ('https://api.github.com/orgs/%s/repos?access_token=%s' %
               (APM_ORG_NAME, self._get_github_access_token()))
        data = json_dumps({
            'name': package_name,
            'description': ('This is a read-only copy of the %s package found in ' +
                            'https://github.com/facebook/nuclide/tree/master/pkg/. Please file ' +
                            'issues and pull requests against the original instead of this copy.') %
                            package_name,
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
