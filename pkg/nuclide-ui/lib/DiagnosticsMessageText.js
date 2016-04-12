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

type DiagnosticsMessageTextProps = {
  message: {
    html?: string;
    text?: string;
  };
};

export const DiagnosticsMessageText = (props: DiagnosticsMessageTextProps) => {
  const {
    message,
  } = props;
  if (message.html != null) {
    return <span dangerouslySetInnerHTML={{__html: message.html}} />;
  } else if (message.text != null) {
    return <span>{message.text}</span>;
  } else {
    return <span>Diagnostic lacks message.</span>;
  }
};
