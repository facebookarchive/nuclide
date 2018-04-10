// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const characters_1 = require("./characters");
const characterStream_1 = require("./characterStream");
const textRangeCollection_1 = require("./textRangeCollection");
const types_1 = require("./types");
var QuoteType;
(function (QuoteType) {
    QuoteType[QuoteType["None"] = 0] = "None";
    QuoteType[QuoteType["Single"] = 1] = "Single";
    QuoteType[QuoteType["Double"] = 2] = "Double";
    QuoteType[QuoteType["TripleSingle"] = 3] = "TripleSingle";
    QuoteType[QuoteType["TripleDouble"] = 4] = "TripleDouble";
})(QuoteType || (QuoteType = {}));
class Token extends types_1.TextRange {
    constructor(type, start, length) {
        super(start, length);
        this.type = type;
    }
}
class Tokenizer {
    constructor() {
        this.tokens = [];
        this.floatRegex = /[-+]?(?:(?:\d*\.\d+)|(?:\d+\.?))(?:[Ee][+-]?\d+)?/;
        //this.floatRegex.compile();
    }
    tokenize(text, start, length, mode) {
        if (start === undefined) {
            start = 0;
        }
        else if (start < 0 || start >= text.length) {
            throw new Error('Invalid range start');
        }
        if (length === undefined) {
            length = text.length;
        }
        else if (length < 0 || start + length > text.length) {
            throw new Error('Invalid range length');
        }
        this.mode = mode !== undefined ? mode : types_1.TokenizerMode.Full;
        this.cs = new characterStream_1.CharacterStream(text);
        this.cs.position = start;
        const end = start + length;
        while (!this.cs.isEndOfStream()) {
            this.AddNextToken();
            if (this.cs.position >= end) {
                break;
            }
        }
        return new textRangeCollection_1.TextRangeCollection(this.tokens);
    }
    AddNextToken() {
        this.cs.skipWhitespace();
        if (this.cs.isEndOfStream()) {
            return;
        }
        if (!this.handleCharacter()) {
            this.cs.moveNext();
        }
    }
    handleCharacter() {
        const quoteType = this.getQuoteType();
        if (quoteType !== QuoteType.None) {
            this.handleString(quoteType);
            return true;
        }
        if (this.cs.currentChar === 35 /* Hash */) {
            this.handleComment();
            return true;
        }
        if (this.mode === types_1.TokenizerMode.CommentsAndStrings) {
            return false;
        }
        switch (this.cs.currentChar) {
            case 40 /* OpenParenthesis */:
                this.tokens.push(new Token(types_1.TokenType.OpenBrace, this.cs.position, 1));
                break;
            case 41 /* CloseParenthesis */:
                this.tokens.push(new Token(types_1.TokenType.CloseBrace, this.cs.position, 1));
                break;
            case 91 /* OpenBracket */:
                this.tokens.push(new Token(types_1.TokenType.OpenBracket, this.cs.position, 1));
                break;
            case 93 /* CloseBracket */:
                this.tokens.push(new Token(types_1.TokenType.CloseBracket, this.cs.position, 1));
                break;
            case 123 /* OpenBrace */:
                this.tokens.push(new Token(types_1.TokenType.OpenCurly, this.cs.position, 1));
                break;
            case 125 /* CloseBrace */:
                this.tokens.push(new Token(types_1.TokenType.CloseCurly, this.cs.position, 1));
                break;
            case 44 /* Comma */:
                this.tokens.push(new Token(types_1.TokenType.Comma, this.cs.position, 1));
                break;
            case 59 /* Semicolon */:
                this.tokens.push(new Token(types_1.TokenType.Semicolon, this.cs.position, 1));
                break;
            case 58 /* Colon */:
                this.tokens.push(new Token(types_1.TokenType.Colon, this.cs.position, 1));
                break;
            case 64 /* At */:
            case 46 /* Period */:
                this.tokens.push(new Token(types_1.TokenType.Operator, this.cs.position, 1));
                break;
            default:
                if (this.isPossibleNumber()) {
                    if (this.tryNumber()) {
                        return true;
                    }
                }
                if (!this.tryIdentifier()) {
                    if (!this.tryOperator()) {
                        this.handleUnknown();
                    }
                }
                return true;
        }
        return false;
    }
    tryIdentifier() {
        const start = this.cs.position;
        if (characters_1.isIdentifierStartChar(this.cs.currentChar)) {
            this.cs.moveNext();
            while (characters_1.isIdentifierChar(this.cs.currentChar)) {
                this.cs.moveNext();
            }
        }
        if (this.cs.position > start) {
            // const text = this.cs.getText().substr(start, this.cs.position - start);
            // const type = this.keywords.find((value, index) => value === text) ? TokenType.Keyword : TokenType.Identifier;
            this.tokens.push(new Token(types_1.TokenType.Identifier, start, this.cs.position - start));
            return true;
        }
        return false;
    }
    isPossibleNumber() {
        if (this.cs.currentChar === 45 /* Hyphen */ || this.cs.currentChar === 43 /* Plus */) {
            // Next character must be decimal or a dot otherwise
            // it is not a number. No whitespace is allowed.
            if (characters_1.isDecimal(this.cs.nextChar) || this.cs.nextChar === 46 /* Period */) {
                // Check what previous token is, if any
                if (this.tokens.length === 0) {
                    // At the start of the file this can only be a number
                    return true;
                }
                const prev = this.tokens[this.tokens.length - 1];
                if (prev.type === types_1.TokenType.OpenBrace
                    || prev.type === types_1.TokenType.OpenBracket
                    || prev.type === types_1.TokenType.Comma
                    || prev.type === types_1.TokenType.Semicolon
                    || prev.type === types_1.TokenType.Operator) {
                    return true;
                }
            }
            return false;
        }
        if (characters_1.isDecimal(this.cs.currentChar)) {
            return true;
        }
        if (this.cs.currentChar === 46 /* Period */ && characters_1.isDecimal(this.cs.nextChar)) {
            return true;
        }
        return false;
    }
    // tslint:disable-next-line:cyclomatic-complexity
    tryNumber() {
        const start = this.cs.position;
        if (this.cs.currentChar === 48 /* _0 */) {
            let radix = 0;
            // Try hex
            if (this.cs.nextChar === 120 /* x */ || this.cs.nextChar === 88 /* X */) {
                this.cs.advance(2);
                while (characters_1.isHex(this.cs.currentChar)) {
                    this.cs.moveNext();
                }
                radix = 16;
            }
            // Try binary
            if (this.cs.nextChar === 98 /* b */ || this.cs.nextChar === 66 /* B */) {
                this.cs.advance(2);
                while (characters_1.isBinary(this.cs.currentChar)) {
                    this.cs.moveNext();
                }
                radix = 2;
            }
            // Try octal
            if (this.cs.nextChar === 111 /* o */ || this.cs.nextChar === 79 /* O */) {
                this.cs.advance(2);
                while (characters_1.isOctal(this.cs.currentChar)) {
                    this.cs.moveNext();
                }
                radix = 8;
            }
            const text = this.cs.getText().substr(start, this.cs.position - start);
            if (radix > 0 && parseInt(text.substr(2), radix)) {
                this.tokens.push(new Token(types_1.TokenType.Number, start, text.length));
                return true;
            }
        }
        if (characters_1.isDecimal(this.cs.currentChar) ||
            this.cs.currentChar === 43 /* Plus */ || this.cs.currentChar === 45 /* Hyphen */ || this.cs.currentChar === 46 /* Period */) {
            const candidate = this.cs.getText().substr(this.cs.position);
            const re = this.floatRegex.exec(candidate);
            if (re && re.length > 0 && re[0] && candidate.startsWith(re[0])) {
                this.tokens.push(new Token(types_1.TokenType.Number, start, re[0].length));
                this.cs.position = start + re[0].length;
                return true;
            }
        }
        this.cs.position = start;
        return false;
    }
    // tslint:disable-next-line:cyclomatic-complexity
    tryOperator() {
        let length = 0;
        const nextChar = this.cs.nextChar;
        switch (this.cs.currentChar) {
            case 43 /* Plus */:
            case 45 /* Hyphen */:
            case 38 /* Ampersand */:
            case 124 /* Bar */:
            case 94 /* Caret */:
            case 61 /* Equal */:
            case 33 /* ExclamationMark */:
                length = nextChar === 61 /* Equal */ ? 2 : 1;
                break;
            case 42 /* Asterisk */:
                if (nextChar === 42 /* Asterisk */) {
                    length = this.cs.lookAhead(2) === 61 /* Equal */ ? 3 : 2;
                }
                else {
                    length = nextChar === 61 /* Equal */ ? 2 : 1;
                }
                break;
            case 47 /* Slash */:
                if (nextChar === 47 /* Slash */) {
                    length = this.cs.lookAhead(2) === 61 /* Equal */ ? 3 : 2;
                }
                else {
                    length = nextChar === 61 /* Equal */ ? 2 : 1;
                }
                break;
            case 60 /* Less */:
                if (nextChar === 62 /* Greater */) {
                    length = 2;
                }
                else if (nextChar === 60 /* Less */) {
                    length = this.cs.lookAhead(2) === 61 /* Equal */ ? 3 : 2;
                }
                else {
                    length = 1;
                }
                break;
            case 62 /* Greater */:
                if (nextChar === 62 /* Greater */) {
                    length = this.cs.lookAhead(2) === 61 /* Equal */ ? 3 : 2;
                }
                else {
                    length = 1;
                }
                break;
            case 64 /* At */:
                length = nextChar === 61 /* Equal */ ? 2 : 0;
                break;
            default:
                return false;
        }
        this.tokens.push(new Token(types_1.TokenType.Operator, this.cs.position, length));
        this.cs.advance(length);
        return length > 0;
    }
    handleUnknown() {
        const start = this.cs.position;
        this.cs.skipToWhitespace();
        const length = this.cs.position - start;
        if (length > 0) {
            this.tokens.push(new Token(types_1.TokenType.Unknown, start, length));
            return true;
        }
        return false;
    }
    handleComment() {
        const start = this.cs.position;
        this.cs.skipToEol();
        this.tokens.push(new Token(types_1.TokenType.Comment, start, this.cs.position - start));
    }
    getQuoteType() {
        if (this.cs.currentChar === 39 /* SingleQuote */) {
            return this.cs.nextChar === 39 /* SingleQuote */ && this.cs.lookAhead(2) === 39 /* SingleQuote */
                ? QuoteType.TripleSingle
                : QuoteType.Single;
        }
        if (this.cs.currentChar === 34 /* DoubleQuote */) {
            return this.cs.nextChar === 34 /* DoubleQuote */ && this.cs.lookAhead(2) === 34 /* DoubleQuote */
                ? QuoteType.TripleDouble
                : QuoteType.Double;
        }
        return QuoteType.None;
    }
    handleString(quoteType) {
        const start = this.cs.position;
        if (quoteType === QuoteType.Single || quoteType === QuoteType.Double) {
            this.cs.moveNext();
            this.skipToSingleEndQuote(quoteType === QuoteType.Single
                ? 39 /* SingleQuote */
                : 34 /* DoubleQuote */);
        }
        else {
            this.cs.advance(3);
            this.skipToTripleEndQuote(quoteType === QuoteType.TripleSingle
                ? 39 /* SingleQuote */
                : 34 /* DoubleQuote */);
        }
        this.tokens.push(new Token(types_1.TokenType.String, start, this.cs.position - start));
    }
    skipToSingleEndQuote(quote) {
        while (!this.cs.isEndOfStream()) {
            if (this.cs.currentChar === 92 /* Backslash */ && this.cs.nextChar === quote) {
                this.cs.advance(2);
                continue;
            }
            if (this.cs.currentChar === quote) {
                break;
            }
            this.cs.moveNext();
        }
        this.cs.moveNext();
    }
    skipToTripleEndQuote(quote) {
        while (!this.cs.isEndOfStream() && (this.cs.currentChar !== quote || this.cs.nextChar !== quote || this.cs.lookAhead(2) !== quote)) {
            this.cs.moveNext();
        }
        this.cs.advance(3);
    }
}
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=tokenizer.js.map