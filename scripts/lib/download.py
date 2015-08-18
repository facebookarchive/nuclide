# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import urllib2

def download(url, destination_path):
    """Download file from internet."""
    with open(destination_path, 'wb') as f:
        response = urllib2.urlopen(url)
        while True:
            chunk = response.read(1024)
            if not chunk:
                break
            f.write(chunk)
