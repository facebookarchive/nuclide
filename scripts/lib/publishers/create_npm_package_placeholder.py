# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import os.path
import subprocess
import tempfile

from json_helpers import json_dump, json_load


def create_placeholder(path_to_package_json):
    metadata = json_load(path_to_package_json)

    # Verify that this represents a Node package.
    nuclide = metadata.get('nuclide', None)
    if not isinstance(nuclide, dict):
        return False
    if nuclide.get('packageType', None) != 'Node':
        return False

    # Verfy that the package has a description.
    if not metadata.get('description', None):
        print('package.json must include a description: %s' % path_to_package_json)
        return False

    # Verify that the npm user is "fb".
    npm_user = fs.cross_platform_check_output(['npm', 'whoami']).rstrip()
    if npm_user != 'fb':
        print(('You must be the "fb" user to publish a Nuclide package to npm, but you were "%s". ' +
                'Find someone who has the appropriate credentials to do the publish for you.') %
                npm_user)
        return False

    # Write out the package.json to a temp directory.
    tmp_dir = tempfile.mkdtemp('npm-publish')
    tmp_package_json = os.path.join(tmp_dir, 'package.json')
    json_dump(metadata, tmp_package_json)

    # Run `npm publish`.
    subprocess.check_call(['npm', 'publish'], cwd=tmp_dir)

    return True
