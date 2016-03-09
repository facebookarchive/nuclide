# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import file_manager
from logging_helper import log_error


class ModuleSourcePathUpdater:
    """Register source paths in debug data of modules as they are loaded.

    NB: module in this context are SBModule instances, representing executable
    images including symbol and debug information.
    """
    def __init__(self, target, file_manager, basepath='.'):
        self._registered_modules = set()
        self._target = target
        self._file_manager = file_manager
        self._basepath = basepath

    def modules_updated(self):
        # module.uuid seems to be not working on Linux so use module.GetUUIDString() instead.
        for module in self._target.modules:
            try:
                if module.GetUUIDString() not in self._registered_modules:
                    self._register_source_paths_for_module(module)
                    self._registered_modules.add(module.GetUUIDString())
            except Exception as e:
                # Some module does not have uuid.
                log_error('Can\'t register module: %s' % str(e))

    def _register_source_paths_for_module(self, module):
        for comp_unit in module.compile_units:
            if comp_unit.file.fullpath is None:
                continue
            self._file_manager.register_filelike(
                file_manager.File.from_filespec(
                    comp_unit.file, self._basepath))
