'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  CustomPaneItemOptions,
} from '../../nuclide-ui/lib/types';

import {React} from 'react-for-atom';
import ServiceMonitor from './ServiceMonitor';
import {CustomPaneItem} from '../../nuclide-ui/lib/CustomPaneItem';
import {getServiceLogger} from '../../nuclide-client';

class ServiceMonitorPaneItem extends CustomPaneItem {

  __renderPaneItem(options: CustomPaneItemOptions) {
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
