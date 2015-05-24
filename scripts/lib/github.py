# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import hashlib
import logging
import os
import shutil
import subprocess
from fs import mkdirs

GITHUB_URI_PREFIX = 'git+https://github.com/'

# This is our own subdirectory that we use under the equivalent of a ~/.npm directory.
# A valid npm package name cannot start with a dot or an underscore, so there is no
# risk of a collision with an actual package name.
NUCLIDE_SECRET_NPM_SUBDIRECTORY = '.nuclide_special_packages'


def is_recognized_github_uri(uri):
    return uri.startswith(GITHUB_URI_PREFIX)


def add_github_uri_to_output_dir(uri, output_dir, package_name):
    if not is_recognized_github_uri(uri):
        raise Exception('Unsupported uri format: %s' % uri)

    # Checkout the commit in output_dir.
    hash_index = uri.rindex('#')
    git_uri = 'git://github.com/' + uri[len(GITHUB_URI_PREFIX):hash_index]
    commit_id = uri[hash_index + 1:]

    # Clear out the expected checkout directory just in case something is there.
    checkout_dir = os.path.join(output_dir, commit_id)
    shutil.rmtree(checkout_dir, ignore_errors=True)

    logging.warn('Cloning %s for %s.', git_uri, package_name)
    args = ['git', 'clone', '--quiet', git_uri, '--depth', '1', commit_id]
    subprocess.check_call(args, cwd=output_dir)

    # Write the contents to a special directories for packages cloned from Git repos.
    # Note that when running `npm install` for a Git URI, the contents will be exactly the same,
    # except npm appears to normalize the root `package.json` file.
    hasher = hashlib.new('sha1')
    hasher.update(uri)
    encoded_uri = hasher.hexdigest()
    pkg_output_dir = os.path.join(output_dir, NUCLIDE_SECRET_NPM_SUBDIRECTORY, encoded_uri)
    mkdirs(os.path.dirname(pkg_output_dir))
    shutil.move(checkout_dir, pkg_output_dir)

    # Remove the .git directory from the checkout.
    shutil.rmtree(os.path.join(pkg_output_dir, '.git'))


def find_dir_for_github_uri(uri, output_dir):
    hasher = hashlib.new('sha1')
    hasher.update(uri)
    encoded_uri = hasher.hexdigest()
    return os.path.join(output_dir, NUCLIDE_SECRET_NPM_SUBDIRECTORY, encoded_uri)
