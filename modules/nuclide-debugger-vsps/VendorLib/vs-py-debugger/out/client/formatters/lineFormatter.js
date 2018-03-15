"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const braceCounter_1 = require("../language/braceCounter");
const textBuilder_1 = require("../language/textBuilder");
const tokenizer_1 = require("../language/tokenizer");
const types_1 = require("../language/types");
class LineFormatter {
    // tslint:disable-next-line:cyclomatic-complexity
    formatLine(text) {
        this.tokens = new tokenizer_1.Tokenizer().tokenize(text);
        this.text = text;
        this.builder = new textBuilder_1.TextBuilder();
        this.braceCounter = new braceCounter_1.BraceCounter();
        if (this.tokens.count === 0) {
            return this.text;
        }
        const ws = this.text.substr(0, this.tokens.getItemAt(0).start);
        if (ws.length > 0) {
            this.builder.append(ws); // Preserve leading indentation
        }
        for (let i = 0; i < this.tokens.count; i += 1) {
            const t = this.tokens.getItemAt(i);
            const prev = i > 0 ? this.tokens.getItemAt(i - 1) : undefined;
            const next = i < this.tokens.count - 1 ? this.tokens.getItemAt(i + 1) : undefined;
            switch (t.type) {
                case types_1.TokenType.Operator:
                    this.handleOperator(i);
                    break;
                case types_1.TokenType.Comma:
                    this.builder.append(',');
                    if (next && !this.isCloseBraceType(next.type)) {
                        this.builder.softAppendSpace();
                    }
                    break;
                case types_1.TokenType.Identifier:
                    if (prev && !this.isOpenBraceType(prev.type) && prev.type !== types_1.TokenType.Colon && prev.type !== types_1.TokenType.Operator) {
                        this.builder.softAppendSpace();
                    }
                    this.builder.append(this.text.substring(t.start, t.end));
                    break;
                case types_1.TokenType.Colon:
                    // x: 1 if not in slice, x[1:y] if inside the slice
                    this.builder.append(':');
                    if (!this.braceCounter.isOpened(types_1.TokenType.OpenBracket) && (next && next.type !== types_1.TokenType.Colon)) {
                        // Not inside opened [[ ... ] sequence
                        this.builder.softAppendSpace();
                    }
                    break;
                case types_1.TokenType.Comment:
                    // add space before in-line comment
                    if (prev) {
                        this.builder.softAppendSpace();
                    }
                    this.builder.append(this.text.substring(t.start, t.end));
                    break;
                default:
                    this.handleOther(t);
                    break;
            }
        }
        return this.builder.getText();
    }
    handleOperator(index) {
        const t = this.tokens.getItemAt(index);
        if (t.length === 1) {
            const opCode = this.text.charCodeAt(t.start);
            switch (opCode) {
                case 61 /* Equal */:
                    if (index >= 2 && this.handleEqual(t, index)) {
                        return;
                    }
                    break;
                case 46 /* Period */:
                    this.builder.append('.');
                    return;
                case 64 /* At */:
                    this.builder.append('@');
                    return;
                default:
                    break;
            }
        }
        this.builder.softAppendSpace();
        this.builder.append(this.text.substring(t.start, t.end));
        this.builder.softAppendSpace();
    }
    handleEqual(t, index) {
        if (this.braceCounter.isOpened(types_1.TokenType.OpenBrace)) {
            // Check if this is = in function arguments. If so, do not
            // add spaces around it.
            const prev = this.tokens.getItemAt(index - 1);
            const prevPrev = this.tokens.getItemAt(index - 2);
            if (prev.type === types_1.TokenType.Identifier &&
                (prevPrev.type === types_1.TokenType.Comma || prevPrev.type === types_1.TokenType.OpenBrace)) {
                this.builder.append('=');
                return true;
            }
        }
        return false;
    }
    handleOther(t) {
        if (this.isBraceType(t.type)) {
            this.braceCounter.countBrace(t);
        }
        this.builder.append(this.text.substring(t.start, t.end));
    }
    isOpenBraceType(type) {
        return type === types_1.TokenType.OpenBrace || type === types_1.TokenType.OpenBracket || type === types_1.TokenType.OpenCurly;
    }
    isCloseBraceType(type) {
        return type === types_1.TokenType.CloseBrace || type === types_1.TokenType.CloseBracket || type === types_1.TokenType.CloseCurly;
    }
    isBraceType(type) {
        return this.isOpenBraceType(type) || this.isCloseBraceType(type);
    }
}
exports.LineFormatter = LineFormatter;
//# sourceMappingURL=lineFormatter.js.map