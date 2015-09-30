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
import tempfile

LOG_DIR_TEMPLATE = 'nuclide-{0}-logs/server-start/'
LOG_FILE_TEMPLATE = 'nuclide.log'
LOG_DIR_ERROR_MSG = 'An error occurred while creating the Nuclide server-start log directory. \
                     Nuclide server-start logs will not be written.'


def _get_log_file_dir():
  return os.path.join(tempfile.gettempdir(), LOG_DIR_TEMPLATE.format(getpass.getuser()))


def _get_log_file_path():
  return os.path.join(_get_log_file_dir(), LOG_FILE_TEMPLATE)


# Returns a boolean of whether the log directory exists or was successfully created.
def _make_log_dir():
  logFileDir = _get_log_file_dir()
  try:
    os.mkdir(logFileDir)
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


def configure_nuclide_logger(loggerName=None):
  if not _make_log_dir():
    return

  logger = logging.getLogger(loggerName)
  logger.setLevel(logging.DEBUG)
  handler = logging.handlers.RotatingFileHandler(_get_log_file_path(),
                                                 maxBytes=10000,
                                                 backupCount=7)
  handler.setLevel(logging.DEBUG)
  formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
  handler.setFormatter(formatter)
  logger.addHandler(handler)
