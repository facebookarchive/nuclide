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

THIRD_PARTY_PACKAGES = {
    'tool-bar': '0.1.9',
}

def generate_config(semver_version, apm_package_names):
    packages = dict((name, semver_version) for name in apm_package_names
                    if name not in PACKAGES_TO_EXCLUDE)
    packages.update(THIRD_PARTY_PACKAGES)

    # Create the JSON data for the config.
    config_json = {
      'packages': [{'name': package_name, 'version': packages[package_name]} for package_name in sorted(packages.keys())],
    }

    # Return the serialized JSON in a form that it is ready to be written to a file.
    return json.dumps(config_json, indent=2, separators=(',', ': '), sort_keys=True) + '\n'
