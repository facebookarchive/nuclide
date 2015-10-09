# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import json

from json_helpers import json_load

# These Atom packages will be excluded from installation.
PACKAGES_TO_EXCLUDE = set([
    # Note that it is important to exclude the nuclide-installer from the list.
    # We don't want it to try to install itself!
    'nuclide-installer',

    # Exclude nuclide-debugger-node from public release bundle until its native
    # code is fixed to build reliably when installed.
    # See https://github.com/facebook/nuclide/issues/193 for details.
    'nuclide-debugger-node',
])

def generate_config(semver_version, apm_package_names):
    packages = []

    for name in apm_package_names:
        if not name in PACKAGES_TO_EXCLUDE:
            packages.append(name)
    packages.sort()

    # Create the JSON data for the config.
    config_json = {
      'packages': map(lambda package_name: {'name': package_name, 'version': semver_version}, packages),
    }

    # Return the serialized JSON in a form that it is ready to be written to a file.
    return json.dumps(config_json, indent=2, separators=(',', ': '), sort_keys=True) + '\n'
