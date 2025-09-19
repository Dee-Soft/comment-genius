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
exports.CodeAnalyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ts = __importStar(require("typescript"));
class CodeAnalyzer {
    isPrivateIdentifier(node) {
        // For TypeScript 4.0+ with private identifiers (#field)
        return node.kind === ts.SyntaxKind.PrivateIdentifier;
    }
    hasPrivateModifier(modifiers) {
        if (!modifiers)
            return false;
        return modifiers.some(mod => {
            // Standard private keyword
            if (mod.kind === ts.SyntaxKind.PrivateKeyword)
                return true;
            // Private identifiers (#field)
            if (this.isPrivateIdentifier(mod))
                return true;
            return false;
        });
    }
    hasStaticModifier(modifiers) {
        if (!modifiers)
            return false;
        return modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
    }
    analyzeFiles(filePaths) {
        return filePaths.map(filePath => this.analyzeFile(filePath));
    }
    analyzeFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const compilerOptions = this.createCompilerOptions(filePath);
        const sourceFile = ts.createSourceFile(filePath, sourceCode, compilerOptions.target || ts.ScriptTarget.Latest, true);
        // Create program with appropriate options
        this.program = ts.createProgram([filePath], compilerOptions);
        this.checker = this.program.getTypeChecker();
        return {
            functions: this.extractFunctions(sourceFile),
            classes: this.extractClasses(sourceFile),
            interfaces: this.extractInterfaces(sourceFile),
            variables: this.extractVariables(sourceFile)
        };
    }
    extractFunctions(sourceFile) {
        const functions = [];
        const visit = (node) => {
            if (ts.isFunctionDeclaration(node) && node.name) {
                functions.push(this.parseFunction(node));
            }
            else if (ts.isArrowFunction(node) && ts.isVariableDeclaration(node.parent)) {
                functions.push(this.parseArrowFunction(node));
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return functions;
    }
    createCompilerOptions(filePath) {
        const ext = path.extname(filePath);
        const isTypeScript = ['.ts', '.tsx'].includes(ext);
        const isJsx = ['.jsx', '.tsx'].includes(ext);
        return {
            target: isTypeScript ? ts.ScriptTarget.ES2020 : ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.CommonJS,
            jsx: isJsx ? ts.JsxEmit.React : ts.JsxEmit.None,
            allowJs: !isTypeScript, // Allow JS for TS files too for mixed codebases
            checkJs: false, // Don't type check JS files
            allowNonTsExtensions: true,
            // For JavaScript files, be more permissive
            noImplicitAny: isTypeScript,
            strictNullChecks: isTypeScript,
            strictFunctionTypes: isTypeScript,
            // Support CommonJS modules in JS
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            allowSyntheticDefaultImports: true,
            esModuleInterop: true
        };
    }
    parseFunction(node) {
        return {
            name: node.name?.getText() || 'anonymous',
            params: this.extractParams(node.parameters),
            returnType: this.getReturnType(node),
            description: this.extractComments(node),
            isAsync: !!node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword),
            isGenerator: !!node.asteriskToken
        };
    }
    parseArrowFunction(node) {
        const parent = node.parent;
        return {
            name: parent.name.getText(),
            params: this.extractParams(node.parameters),
            returnType: this.getReturnType(node),
            description: this.extractComments(parent),
            isAsync: false,
            isGenerator: false
        };
    }
    extractClasses(sourceFile) {
        const classes = [];
        const visit = (node) => {
            if (ts.isClassDeclaration(node) && node.name) {
                classes.push(this.parseClass(node));
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return classes;
    }
    parseClass(node) {
        return {
            name: node.name?.getText() || 'AnonymousClass',
            methods: this.extractMethods(node),
            properties: this.extractProperties(node),
            description: this.extractComments(node)
        };
    }
    isPrivateMember(modifiers) {
        if (!modifiers)
            return false;
        return modifiers.some(mod => {
            // For regular private keyword
            if (mod.kind === ts.SyntaxKind.PrivateKeyword)
                return true;
            // For #private fields (PrivateIdentifier)
            if (mod.kind === ts.SyntaxKind.PrivateIdentifier)
                return true;
            // For newer TypeScript versions
            if (ts.isPrivateIdentifier?.(mod))
                return true;
            return false;
        });
    }
    isStaticMember(modifiers) {
        if (!modifiers)
            return false;
        return modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
    }
    extractMethods(classNode) {
        const methods = [];
        classNode.forEachChild(child => {
            if (ts.isMethodDeclaration(child) && child.name) {
                methods.push({
                    name: child.name.getText(),
                    params: this.extractParams(child.parameters),
                    returnType: this.getReturnType(child),
                    description: this.extractComments(child),
                    isAsync: !!child.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword),
                    isGenerator: !!child.asteriskToken,
                    isPrivate: this.hasPrivateModifier(child.modifiers),
                    isStatic: this.hasStaticModifier(child.modifiers)
                });
            }
        });
        return methods;
    }
    extractProperties(classNode) {
        const properties = [];
        classNode.forEachChild(child => {
            if (ts.isPropertyDeclaration(child) && child.name) {
                properties.push({
                    name: child.name.getText(),
                    type: this.getTypeText(child.type),
                    description: this.extractComments(child),
                    isPrivate: this.hasPrivateModifier(child.modifiers),
                    isStatic: this.hasStaticModifier(child.modifiers)
                });
            }
        });
        return properties;
    }
    extractInterfaces(sourceFile) {
        const interfaces = [];
        const visit = (node) => {
            if (ts.isInterfaceDeclaration(node)) {
                interfaces.push(this.parseInterface(node));
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return interfaces;
    }
    parseInterface(node) {
        return {
            name: node.name.getText(),
            properties: this.extractInterfaceProperties(node),
            methods: this.extractInterfaceMethods(node)
        };
    }
    extractInterfaceProperties(node) {
        const properties = [];
        node.members.forEach(member => {
            if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
                properties.push({
                    name: member.name.getText(),
                    type: this.getTypeText(member.type),
                    description: this.extractComments(member),
                    isStatic: false,
                    isPrivate: false
                });
            }
        });
        return properties;
    }
    extractInterfaceMethods(node) {
        const methods = [];
        node.members.forEach(member => {
            if (ts.isMethodSignature(member) && ts.isIdentifier(member.name)) {
                methods.push({
                    name: member.name.getText(),
                    params: this.extractParams(member.parameters),
                    returnType: this.getReturnType(member),
                    description: this.extractComments(member),
                    isAsync: false,
                    isGenerator: false,
                    isStatic: false,
                    isPrivate: false
                });
            }
        });
        return methods;
    }
    extractVariables(sourceFile) {
        const variables = [];
        const visit = (node) => {
            if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
                variables.push({
                    name: node.name.getText(),
                    type: this.getTypeText(node.type),
                    description: this.extractComments(node),
                    isConstant: ts.isVariableDeclarationList(node.parent) &&
                        node.parent.flags === ts.NodeFlags.Const
                });
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return variables;
    }
    extractParams(parameters) {
        return parameters.map(param => {
            let type = this.getTypeText(param.type);
            // For JavaScript files, try to infer types from usage
            if (type === 'any' && this.checker) {
                try {
                    const symbol = this.checker.getSymbolAtLocation(param.name);
                    if (symbol) {
                        const paramType = this.checker.getTypeOfSymbolAtLocation(symbol, param.name);
                        type = this.checker.typeToString(paramType);
                    }
                }
                catch (error) {
                    // Silently fail - we'll use 'any' as fallback
                }
            }
            return {
                name: param.name.getText(),
                type: type,
                description: this.extractComments(param),
                isOptional: !!param.questionToken,
                defaultValue: param.initializer?.getText()
            };
        });
    }
    getReturnType(node) {
        return this.getTypeText(node.type) || 'void';
    }
    getTypeText(typeNode) {
        if (!typeNode)
            return 'any';
        const typeText = typeNode.getText();
        // Handle JavaScript files where types might not be explicit
        if (typeText === 'any' || !typeText.trim()) {
            return 'any';
        }
        return typeText;
    }
    extractComments(node) {
        const sourceFile = node.getSourceFile();
        const comments = ts.getLeadingCommentRanges(sourceFile.text, node.pos);
        if (comments && comments.length > 0) {
            return sourceFile.text.substring(comments[0].pos, comments[0].end);
        }
        return undefined;
    }
}
exports.CodeAnalyzer = CodeAnalyzer;
//# sourceMappingURL=analyzer.js.map