"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockOutputChannel {
    constructor(name) {
        this.name = name;
        this.output = '';
    }
    append(value) {
        this.output += value;
    }
    appendLine(value) { this.append(value); this.append('\n'); }
    clear() { }
    show(x, y) {
        this.isShown = true;
    }
    hide() {
        this.isShown = false;
    }
    dispose() { }
}
exports.MockOutputChannel = MockOutputChannel;
//# sourceMappingURL=mockClasses.js.map