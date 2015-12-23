'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideCustomPaneItemOptions} from '../../../ui/pane-item/lib/types';

import React from 'react-for-atom';
import ServiceMonitor from './ServiceMonitor';
import NuclideCustomPaneItem from '../../../ui/pane-item';
import {getServiceLogger} from '../../../client';

class ServiceMonitorPaneItem extends NuclideCustomPaneItem {

  __renderPaneItem(options: NuclideCustomPaneItemOptions) {
    return (
      <ServiceMonitor
        serviceLogger={getServiceLogger()}
      />
    );
  }
}

module.exports = document.registerElement('nuclide-service-monitor', {
  prototype: ServiceMonitorPaneItem.prototype,
});
