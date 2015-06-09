# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from abc import ABCMeta, abstractmethod

class AbstractPublisher(object):
    '''This abstract class exists simply to articulate the expected interface of npm and apm
       publisher classes and provides some abstraction over the two package management systems.
    '''

    __metaclass__ = ABCMeta

    @abstractmethod
    def get_package_name(self):
        pass

    @abstractmethod
    def get_published_version(self):
        pass

    @abstractmethod
    def is_published_version(self, target_version):
        pass

    @abstractmethod
    def publish(self, new_version):
        pass
