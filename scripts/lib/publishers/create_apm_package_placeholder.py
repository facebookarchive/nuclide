# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os.path
import subprocess
import tempfile

from json_helpers import json_dump, json_load


def create_placeholder(path_to_package_json, apm_repository_helper):
    metadata = json_load(path_to_package_json)

    # Verify that this represents an Atom package.
    nuclide = metadata.get('nuclide', None)
    if not isinstance(nuclide, dict):
        return False
    if nuclide.get('packageType', None) != 'Atom' or nuclide.get('testRunner', None) != 'apm':
        return False

    # Create or checkout the repo for the package under facebooknuclideapm.
    package_name = metadata['name']
    repo = tempfile.mkdtemp(package_name)
    apm_repository_helper.checkout_apm_repo(package_name, repo, create_if_missing=True)
    git = apm_repository_helper.git

    # Verify the package.json file has been checked in. Commit it if it has not.
    package_json_in_repo = os.path.join(repo, 'package.json')
    if not os.path.isfile(package_json_in_repo):
        metadata['repository'] = 'https://github.com/facebooknuclideapm/%s' % package_name
        json_dump(metadata, package_json_in_repo)
        git.commit_all(repo, 'Commit package.json file.')
        git.push_to_master(repo)

    # Verify the README.md has been checked in. Commit it if it has not.
    path_to_readme = os.path.join(repo, 'README.md')
    if not os.path.isfile(path_to_readme):
        with open(path_to_readme, 'w') as f:
            f.write('Placeholder.')
        git.commit_all(repo, 'Commit README.md file.')
        git.push_to_master(repo)

    # Create and push tag v0.0.0.
    tag_name = 'v0.0.0'
    tag_exists = False
    try:
        git.add_tag(repo, tag_name, 'Atom package %s.' % tag_name)
    except subprocess.CalledProcessError:
        tag_exists = True
    if not tag_exists:
        git.push_tag(repo, tag_name)
        git.push_to_master(repo)

    # Run `apm publish` to claim the namespace.
    try:
        subprocess.check_call(['apm', 'publish', '--tag', tag_name], cwd=repo)
    except subprocess.CalledProcessError:
        # `apm publish` may complain about some things, but at a minimum, the namespace should be
        # claimed.
        pass

    # Verify whether the publish succeeded.
    try:
        subprocess.check_call(['apm', 'view', package_name], cwd=repo)
        return True
    except subprocess.CalledProcessError:
        return False
