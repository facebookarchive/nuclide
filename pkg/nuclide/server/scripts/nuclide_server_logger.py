#!/usr/bin/env python

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import errno
import getpass
import logging
import logging.handlers
import os
import sys
import tempfile

LOG_FILE_DIR = os.path.join(tempfile.gettempdir(),
                            'nuclide-{0}-logs/server-start/'.format(getpass.getuser()))
LOG_FILE_TEMPLATE = 'nuclide.log'
LOG_DIR_ERROR_MSG = 'An error occurred while creating the Nuclide server-start log directory. \
                     Nuclide server-start logs will not be written.'


def _get_log_file_path():
    return os.path.join(LOG_FILE_DIR, LOG_FILE_TEMPLATE)


# Returns a boolean of whether the log directory exists or was successfully created.
def _make_log_dir():
    try:
        os.makedirs(LOG_FILE_DIR)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # The log directory exists
            return True
        print(LOG_DIR_ERROR_MSG)
        return False
    except Exception:
        # Any other error
        print(LOG_DIR_ERROR_MSG)
        return False
    return True


def configure_nuclide_logger(verbose=False):
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    if verbose:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)

    if not _make_log_dir():
        return

    handler = logging.handlers.RotatingFileHandler(_get_log_file_path(),
                                                   maxBytes=10000,
                                                   backupCount=7)
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
