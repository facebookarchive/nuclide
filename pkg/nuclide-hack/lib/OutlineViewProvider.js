'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline, OutlineTree} from '../../nuclide-outline-view';
import type {
  HackIdeOutline,
  HackIdeOutlineItem,
} from '../../nuclide-hack-base/lib/HackService';
import {
  className,
  keyword,
  method,
  whitespace,
  plain,
} from '../../nuclide-tokenized-text';
import {getHackLanguageForUri} from './HackLanguage';

import {Point} from 'atom';

export class OutlineViewProvider {
  async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const hackOutline = await outlineFromEditor(editor);
    if (hackOutline == null) {
      return null;
    }
    return outlineFromHackIdeOutline(hackOutline);
  }
}

export function outlineFromHackIdeOutline(hackOutline: HackIdeOutline): Outline {
  return {
    outlineTrees: hackOutline.map(outlineFromHackIdeItem),
  };
}

function outlineFromHackIdeItem(hackItem: HackIdeOutlineItem): OutlineTree {
  const tokenizedText = [];

  function addKeyword(value: string) {
    tokenizedText.push(keyword(value));
    tokenizedText.push(whitespace(' '));
  }

  function addModifiers(modifiers: ?Array<string>) {
    if (modifiers != null) {
      modifiers.forEach(addKeyword);
    }
  }

  addModifiers(hackItem.modifiers);
  switch (hackItem.kind) {
    case 'typeconst':
      addKeyword('const');
      addKeyword('type');
      break;
    case 'method':
      addKeyword('function');
      break;
    default:
      addKeyword(hackItem.kind);
      break;
  }

  // name
  switch (hackItem.kind) {
    case 'class':
    case 'enum':
    case 'typeconst':
      tokenizedText.push(className(hackItem.name));
      break;
    default:
      tokenizedText.push(method(hackItem.name));
      break;
  }

  // params
  const params = hackItem.params;
  if (params != null) {
    tokenizedText.push(plain('('));
    let first = true;
    for (const param of params) {
      if (!first) {
        tokenizedText.push(plain(','));
        tokenizedText.push(whitespace(' '));
      }
      first = false;
      addModifiers(param.modifiers);
      tokenizedText.push(plain(param.name));
    }
    tokenizedText.push(plain(')'));
  }

  return {
    tokenizedText,
    representativeName: hackItem.name,
    startPosition: pointFromHack(hackItem.position.line, hackItem.position.char_start),
    endPosition: pointFromHack(hackItem.span.line_end, hackItem.span.char_end),
    children: hackItem.children == null ? [] : hackItem.children.map(outlineFromHackIdeItem),
  };
}

function pointFromHack(hackLine: number, hackColumn: number): atom$Point {
  return new Point(hackLine - 1, hackColumn - 1);
}

async function outlineFromEditor(editor: atom$TextEditor): Promise<?HackIdeOutline> {
  const filePath = editor.getPath();
  if (filePath == null) {
    return null;
  }
  const hackLanguage = await getHackLanguageForUri(filePath);
  if (hackLanguage == null) {
    return null;
  }

  const contents = editor.getText();

  return await hackLanguage.getIdeOutline(filePath, contents);
}
