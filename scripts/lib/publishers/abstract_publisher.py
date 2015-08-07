# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from abc import ABCMeta, abstractmethod


class AbstractPublisherConfig(object):
    '''Arguments for an AbstractPublisher constructor.'''
    def __init__(self, package_name, package_directory, nuclide_npm_package_names, nuclide_apm_package_names):
        self._package_name = package_name
        self._package_directory = package_directory
        self._nuclide_npm_package_names = nuclide_npm_package_names
        self._nuclide_apm_package_names = nuclide_apm_package_names

    @property
    def package_name(self):
        return self._package_name

    @property
    def package_directory(self):
        return self._package_directory

    @property
    def nuclide_npm_package_names(self):
        return self._nuclide_npm_package_names

    @property
    def apm_package_names(self):
        return iter(self._nuclide_apm_package_names)

    def __str__(self):
        return 'name: %s; directory: %s' % (self.package_name, self.package_directory)


class AbstractPublisher(object):
    '''This abstract class exists simply to articulate the expected interface of npm and apm
       publisher classes and provides some abstraction over the two package management systems.
    '''

    __metaclass__ = ABCMeta

    @abstractmethod
    def get_package_name(self):
        pass

    @abstractmethod
    def is_already_published(self):
        pass

    @abstractmethod
    def get_published_version(self):
        pass

    @abstractmethod
    def is_published_version(self, target_version):
        pass

    @abstractmethod
    def prepublish(self, new_version, atom_semver):
        '''Must be invoked before publish(). This will be invoked for a --dry-run.'''
        pass

    @abstractmethod
    def publish(self, new_version, atom_semver):
        '''prepublish() must be invoked before this method. This will not be invoked for a --dry-run.'''
        pass
