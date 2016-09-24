'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import nuclideUri from '../../../commons-node/nuclideUri';
import {Webview} from '../../../nuclide-ui/Webview';

export default class Inspector extends React.Component {
  constructor() {
    super();
    (this: any)._handleDidFinishLoad = this._handleDidFinishLoad.bind(this);
  }

  getTitle(): string {
    return 'React Native Inspector';
  }

  render(): ?React.Element<any> {
    return (
      <Webview
        style={{width: '100%', height: '100%'}}
        nodeintegration={true}
        className="native-key-bindings"
        onDidFinishLoad={this._handleDidFinishLoad}
        src="atom://nuclide/pkg/nuclide-react-native-inspector/lib/ui/inspector.html"
      />
    );
  }

  _handleDidFinishLoad(event: Event) {
    const element = ((event.target: any): WebviewElement);
    const requirePaths = require.cache[__filename].paths;
    const inspectorDevTools =
      nuclideUri.join(__dirname, '../../VendorLib/dev-tools/standalone.js');
    element.executeJavaScript(
      `initializeElementInspector(
        ${JSON.stringify(inspectorDevTools)},
        ${JSON.stringify(requirePaths)}
      );`,
    );
  }
}
