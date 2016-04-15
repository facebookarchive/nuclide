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
import type {HackOutline, HackOutlineItem} from '../../nuclide-hack-base/lib/HackService';
import {
  className,
  keyword,
  method,
  whitespace,
} from '../../nuclide-tokenized-text';
import {getHackLanguageForUri} from './HackLanguage';

import {Point} from 'atom';
import invariant from 'assert';

export class OutlineViewProvider {
  async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const hackOutline = await outlineFromEditor(editor);
    if (hackOutline == null) {
      return null;
    }
    return outlineFromHackOutline(hackOutline);
  }
}

// Exported for testing
export function outlineFromHackOutline(hackOutline: HackOutline): Outline {
  const classes = extractClasses(hackOutline);
  addMethodsToClasses(hackOutline, classes);

  const functions = extractFunctions(hackOutline);

  const outlineTrees = Array.from(classes.values()).concat(functions);
  sortOutline(outlineTrees);

  return {
    outlineTrees,
  };
}

function extractClasses(hackOutline: HackOutline): Map<string, OutlineTree> {
  const classes = new Map();
  for (const item of hackOutline) {
    if (item.type === 'class') {
      classes.set(item.name, outlineTreeFromHackOutlineItem(item));
    }
  }
  return classes;
}

function addMethodsToClasses(hackOutline: HackOutline, classes: Map<string, OutlineTree>): void {
  for (const item of hackOutline) {
    if (item.type === 'method' || item.type === 'static method') {
      // TODO handle bad input
      const [classId, methodName] = item.name.split('::');
      invariant(methodName != null, `Expected method name to include '::', got '${item.name}'`);

      const methodOutline = outlineTreeFromHackOutlineItem(item);

      const classOutline = classes.get(classId);
      invariant(classOutline != null, `Missing class ${classId}`);
      classOutline.children.push(methodOutline);
    }
  }
}

function extractFunctions(hackOutline: HackOutline): Array<OutlineTree> {
  const functions = [];
  for (const item of hackOutline) {
    if (item.type === 'function') {
      functions.push(outlineTreeFromHackOutlineItem(item));
    }
  }
  return functions;
}

function sortOutline(outlineTrees: Array<OutlineTree>): void {
  for (const tree of outlineTrees) {
    sortOutline(tree.children);
  }
  outlineTrees.sort((a, b) => a.startPosition.compare(b.startPosition));
}

function outlineTreeFromHackOutlineItem(item: HackOutlineItem): OutlineTree {
  const text = [];
  switch (item.type) {
    case 'static method':
    case 'method':
      const [, methodName] = item.name.split('::');
      invariant(methodName != null, `Expected method name to include '::', got '${item.name}'`);

      if (item.type === 'static method') {
        text.push(keyword('static'));
        text.push(whitespace(' '));
      }
      text.push(keyword('function'));
      text.push(whitespace(' '));
      text.push(method(methodName));
      break;
    case 'function':
      text.push(keyword('function'));
      text.push(whitespace(' '));
      text.push(method(item.name));
      break;
    case 'class':
      text.push(keyword('class'));
      text.push(whitespace(' '));
      text.push(className(item.name));
      break;
    default:
      throw new Error(`Unrecognized item type ${item.type}`);
  }

  return {
    tokenizedText: text,
    startPosition: pointFromHackOutlineItem(item),
    children: [],
  };
}

function pointFromHackOutlineItem(item: HackOutlineItem): atom$Point {
  return new Point(item.line - 1, item.char_start - 1);
}

async function outlineFromEditor(editor: atom$TextEditor): Promise<?HackOutline> {
  const filePath = editor.getPath();
  if (filePath == null) {
    return  null;
  }
  const hackLanguage = await getHackLanguageForUri(filePath);
  if (hackLanguage == null) {
    return null;
  }

  const contents = editor.getText();

  return await hackLanguage.getOutline(filePath, contents);
}
