'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react-for-atom';

function HhvmIcon(): ReactElement {
  return (
    <div className="hhvm-toolbar-icon-container">
      <svg
        version="1.1"
        x="0px"
        y="0px"
        width="37%"
        viewBox="0 0 13.4 19.6"
      >
        <polygon points="7,6.6 7,12.6 13,6.6" />
        <polygon points="13.4,6 13.4,0 7.4,6" />
        <polygon points="7,13.4 7,19.6 13.4,13.2 13.4,7" />
        <polygon points="0,12.6 6.4,6.2 6.4,0 0,6.4" />
        <polygon points="6.4,13 6.4,7 0.4,13" />
        <polygon points="0,13.6 0,19.6 6,13.6" />
      </svg>
    </div>
  );
}

module.exports = HhvmIcon;
