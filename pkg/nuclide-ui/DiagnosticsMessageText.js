/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';
import React from 'react';
import {shell} from 'electron';

type DiagnosticsMessageTextProps = {
  message: {
    html?: string,
    text?: string,
  },
};

type UrlOrText = {
  isUrl: true,
  url: string,
} | {
  isUrl: false,
  text: string,
};

// Exported for testing.
export function separateUrls(message: string): Array<UrlOrText> {
  // Don't match periods at the end of URLs, because those are usually just to
  // end the sentence and not actually part of the URL.
  const urlRegex = /https?:\/\/[a-zA-Z0-9/._-]*[a-zA-Z0-9/_-]/g;

  const urls = message.match(urlRegex);
  const nonUrls = message.split(urlRegex);

  const parts: Array<UrlOrText> = [{
    isUrl: false,
    text: nonUrls[0],
  }];
  for (let i = 1; i < nonUrls.length; i++) {
    invariant(urls != null);
    parts.push({
      isUrl: true,
      url: urls[i - 1],
    });
    parts.push({
      isUrl: false,
      text: nonUrls[i],
    });
  }
  return parts;
}

function renderRowWithLinks(message: string, rowIndex: number): React.Element<any> {
  const parts = separateUrls(message).map((part, index) => {
    if (!part.isUrl) {
      return part.text;
    } else {
      const openUrl = () => { shell.openExternal(part.url); };
      return <a href="#" key={index} onClick={openUrl}>{part.url}</a>;
    }
  });

  return <div key={rowIndex}>{parts}</div>;
}

export const DiagnosticsMessageText = (props: DiagnosticsMessageTextProps) => {
  const {
    message,
  } = props;
  if (message.html != null) {
    return <span dangerouslySetInnerHTML={{__html: message.html}} />;
  } else if (message.text != null) {
    return <span>{message.text.split('\n').map(renderRowWithLinks)}</span>;
  } else {
    return <span>Diagnostic lacks message.</span>;
  }
};
