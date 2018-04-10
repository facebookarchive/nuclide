"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tokenizer_1 = require("../language/tokenizer");
const types_1 = require("../language/types");
function getDocumentTokens(document, tokenizeTo, mode) {
    const text = document.getText(new vscode.Range(new vscode.Position(0, 0), tokenizeTo));
    return new tokenizer_1.Tokenizer().tokenize(text, 0, text.length, mode);
}
exports.getDocumentTokens = getDocumentTokens;
function isPositionInsideStringOrComment(document, position) {
    const tokenizeTo = position.translate(1, 0);
    const tokens = getDocumentTokens(document, tokenizeTo, types_1.TokenizerMode.CommentsAndStrings);
    const index = tokens.getItemContaining(document.offsetAt(position));
    if (index >= 0) {
        const token = tokens.getItemAt(index);
        return token.type === types_1.TokenType.String || token.type === types_1.TokenType.Comment;
    }
    return false;
}
exports.isPositionInsideStringOrComment = isPositionInsideStringOrComment;
//# sourceMappingURL=providerUtilities.js.map