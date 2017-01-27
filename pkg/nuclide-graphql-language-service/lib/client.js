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
import fs from 'fs';
import {buildSchema, buildClientSchema} from 'graphql';
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import path from 'path';

import {getDiagnostics} from './interfaces/getDiagnostics';
import {getOutline} from './interfaces/getOutline';

const GRAPHQL_SUCCESS_CODE = 0;
const GRAPHQL_FAILURE_CODE = 1;

export default function main(command: string, argv: Object) {
  const filePath = argv.file && argv.file.trim();
  const text = argv.text;
  const schemaPath = argv.schemaPath && argv.schemaPath.trim();
  let exitCode;
  switch (command) {
    case 'lint':
      exitCode = performLint(filePath, text, schemaPath);
      break;
    case 'outline':
      exitCode = performOutline(filePath, text);
      break;
  }

  process.exit(exitCode);
}

function parseSchema(schemaPath) {
  const buffer = fs.readFileSync(schemaPath);
  return buffer.toString();
}

function generateSchema(schemaPath) {
  const schemaDSL = parseSchema(schemaPath);
  const schemaFileExt = path.extname(schemaPath);
  switch (schemaFileExt) {
    case '.graphql':
      return buildSchema(schemaDSL);
    case '.json':
      return buildClientSchema(JSON.parse(schemaDSL));
    default:
      throw new Error('Unsupported schema file extention');
  }
}

function ensureText(
  filePath: ?string,
  queryText: ?string,
): string {
  let text = queryText;
  // Always honor text argument over filePath.
  // If text isn't available, try reading from the filePath.
  if (!text) {
    invariant(
      filePath,
      'A path to the GraphQL file or its contents is required.',
    );
    text = fs.readFileSync(filePath, 'utf8');
  }
  return text;
}

function performLint(
  filePath: string,
  queryText?: string,
  schemaPath?: string,
) {
  try {
    const text = ensureText(filePath, queryText);

    const schema = schemaPath ? generateSchema(schemaPath) : null;
    const resultArray = getDiagnostics(filePath, text, schema);
    const resultObject = resultArray.reduce((prev, cur, index) => {
      prev[index] = cur;
      return prev;
    }, {});
    process.stdout.write(JSON.stringify(resultObject, null, 2));
    return GRAPHQL_SUCCESS_CODE;
  } catch (error) {
    process.stderr.write(error);
    return GRAPHQL_FAILURE_CODE;
  }
}

function performOutline(
  filePath: ?string,
  queryText: ?string,
): number {
  try {
    const text = ensureText(filePath, queryText);
    const outline = getOutline(text);
    process.stdout.write(JSON.stringify(outline));
  } catch (error) {
    process.stderr.write(error);
    return GRAPHQL_FAILURE_CODE;
  }
  return GRAPHQL_SUCCESS_CODE;
}
