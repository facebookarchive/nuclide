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
import path from 'path';
import {toJsString} from '../../../commons';

export default class Inspector extends React.Component {

  getTitle(): string {
    return 'React Native Inspector';
  }

  render(): ?ReactElement {
    return <div style={{width: '100%', height: '100%'}} />;
  }

  componentDidMount() {
    // TODO: We create the webview element by hand here because React 0.13 doesn't support custom
    //       attributes (and we need the `nodeintegration` attribute). When we upgrade to 0.14,
    //       change this.
    const el = React.findDOMNode(this);
    const webview = ((document.createElement('webview'): any): WebviewElement);
    webview.style.width = '100%';
    webview.style.height = '100%';
    webview.nodeintegration = true;
    webview.className = 'native-key-bindings';
    webview.addEventListener('did-finish-load', () => {
      const packageDirectory = path.resolve(__dirname, '../../');
      const requirePaths = require.cache[__filename].paths;
      webview.executeJavaScript(
        `initializeElementInspector(${toJsString(packageDirectory)}, ${toJsString(requirePaths)});`
      );
    });
    webview.src = 'atom://nuclide/pkg/nuclide/react-native-inspector/lib/ui/inspector.html';
    el.appendChild(webview);
  }

}

Inspector.gadgetId = 'nuclide-react-native-inspector';
