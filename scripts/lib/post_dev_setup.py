# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging

def post_dev_setup():
    logging.info('Running post setup scripts...')
    try:
        from fb.post_dev_setup import fb_post_dev_setup
        fb_post_dev_setup()
    except ImportError as e:
        pass
    logging.info('Post setup scripts executed.')
