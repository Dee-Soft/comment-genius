"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentCleaner = void 0;
const fs = __importStar(require("fs"));
class CommentCleaner {
    constructor() {
        this.garbagePatterns = [
            // Single line comments that are likely garbage
            /\/\/\s*(TODO|FIXME|HACK|NOTE|XXX).*$/gm,
            /\/\/\s*[a-zA-Z0-9]+\s*$/gm,
            /\/\/\s*$/gm,
            // Multi-line comments that are empty or minimal
            /\/\*\*\s*\*\/\s*$/gm,
            /\/\*\*\s*\*\s+\*\s*\*\/\s*$/gm,
            // JSDoc comments with minimal content
            /\/\*\*\s*\*\s*@[a-zA-Z]+\s*\*\s*\*\/\s*$/gm,
            // Comments that are just separators
            /\/\/\s*-{10,}\s*$/gm,
            /\/\/\s*={10,}\s*$/gm,
            // Comments that are likely auto-generated and empty
            /\/\*\*\s*\*\s*\*\s*\*\/\s*$/gm
        ];
    }
    async cleanFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        let content = await fs.promises.readFile(filePath, 'utf-8');
        // Remove garbage comments
        this.garbagePatterns.forEach(pattern => {
            content = content.replace(pattern, '');
        });
        // Clean up excessive empty lines
        content = content.replace(/\n{3,}/g, '\n\n');
        return content;
    }
    async cleanFiles(filePaths) {
        const results = new Map();
        for (const filePath of filePaths) {
            try {
                const cleanedContent = await this.cleanFile(filePath);
                results.set(filePath, cleanedContent);
            }
            catch (error) {
                if (error instanceof Error)
                    console.warn(`Error cleaning file ${filePath}:`, error.message);
            }
        }
        return results;
    }
    isGarbageComment(comment) {
        return this.garbagePatterns.some(pattern => pattern.test(comment));
    }
}
exports.CommentCleaner = CommentCleaner;
//# sourceMappingURL=cleaner.js.map