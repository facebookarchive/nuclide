# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging

def setup():
    logging.info('Running pre-development setup scripts...')
    try:
        from fb.pre_installation_setup import fb_setup
        fb_setup()
    except ImportError as e:
        logging.info('Nothing needed to be run.')
        pass
    logging.info('Pre-development setup scripts executed.')
