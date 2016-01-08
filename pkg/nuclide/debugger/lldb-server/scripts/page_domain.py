# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from handler import HandlerDomain, handler

DUMMY_FRAME_ID = 'Frame.0'


class PageDomain(HandlerDomain):
    """Actions and events related to the inspected page.

    For LLDB, the "Page" loosely maps to the target being debugged.
    """
    @property
    def name(self):
        return 'Page'

    @handler()
    def enable(self, params):
        return {}

    @handler()
    def canScreencast(self, params):
        return {'result': False}

    @handler()
    def getResourceTree(self, params):
        # For now, return a dummy resource tree so various initializations in
        # client happens.
        return {
            'frameTree': {
                'childFrames': [],
                'resources': [],
                'frame': {
                    'id': DUMMY_FRAME_ID,
                    'loaderId': 'Loader.0',
                    'mimeType': '',
                    'name': 'LLDB',
                    'securityOrigin': '',
                    'url': 'lldb:///',
                },
            }
        }
