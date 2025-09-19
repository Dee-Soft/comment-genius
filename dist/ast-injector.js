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
exports.ASTCommentInjector = void 0;
const ts = __importStar(require("typescript"));
const fs = __importStar(require("fs"));
class ASTCommentInjector {
    static async injectCommentsInFile(filePath, comments) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const modifiedContent = this.injectComments(content, comments);
        return modifiedContent;
    }
    static injectComments(sourceCode, comments) {
        const sourceFile = ts.createSourceFile('temp.ts', sourceCode, ts.ScriptTarget.Latest, true);
        const transformations = [];
        // Find nodes that need comments
        const visit = (node) => {
            if (ts.isFunctionDeclaration(node) && node.name) {
                const functionName = node.name.getText();
                const comment = comments.get(functionName);
                if (comment && !this.hasLeadingComments(node, sourceCode)) {
                    transformations.push({
                        pos: node.getStart(),
                        comment: comment + '\n'
                    });
                }
            }
            else if (ts.isClassDeclaration(node) && node.name) {
                const className = node.name.getText();
                const comment = comments.get(className);
                if (comment && !this.hasLeadingComments(node, sourceCode)) {
                    transformations.push({
                        pos: node.getStart(),
                        comment: comment + '\n'
                    });
                }
            }
            else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
                const varName = node.name.getText();
                const comment = comments.get(varName);
                if (comment && !this.hasLeadingComments(node, sourceCode)) {
                    transformations.push({
                        pos: node.getStart(),
                        comment: comment + '\n'
                    });
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        // Apply transformations in reverse order to maintain positions
        transformations.sort((a, b) => b.pos - a.pos);
        let modifiedCode = sourceCode;
        for (const transformation of transformations) {
            modifiedCode =
                modifiedCode.slice(0, transformation.pos) +
                    transformation.comment +
                    modifiedCode.slice(transformation.pos);
        }
        return modifiedCode;
    }
    static hasLeadingComments(node, sourceCode) {
        const comments = ts.getLeadingCommentRanges(sourceCode, node.pos);
        return comments !== undefined && comments.length > 0;
    }
    static extractExistingComments(sourceCode) {
        const sourceFile = ts.createSourceFile('temp.ts', sourceCode, ts.ScriptTarget.Latest, true);
        const existingComments = new Map();
        const visit = (node) => {
            const comments = ts.getLeadingCommentRanges(sourceCode, node.pos);
            if (comments && comments.length > 0) {
                const commentText = sourceCode.substring(comments[0].pos, comments[0].end);
                if (ts.isFunctionDeclaration(node) && node.name) {
                    existingComments.set(node.name.getText(), commentText);
                }
                else if (ts.isClassDeclaration(node) && node.name) {
                    existingComments.set(node.name.getText(), commentText);
                }
                else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
                    existingComments.set(node.name.getText(), commentText);
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return existingComments;
    }
}
exports.ASTCommentInjector = ASTCommentInjector;
//# sourceMappingURL=ast-injector.js.map