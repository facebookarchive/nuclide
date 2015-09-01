'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ServerComponent from  './ServerComponent';
import ClientComponent from  './ClientComponent';

import {loadServicesConfig} from './config';

export default {ServerComponent, ClientComponent, loadServicesConfig};
