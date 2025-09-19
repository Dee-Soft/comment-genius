import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { FileAnalysis, FunctionInfo, ParamInfo, ClassInfo, MethodInfo, PropertyInfo, InterfaceInfo, VariableInfo } from './types';

export class CodeAnalyzer {
  private program?: ts.Program;
  private checker?: ts.TypeChecker;

  private isPrivateIdentifier(node: ts.Node): boolean {
  // For TypeScript 4.0+ with private identifiers (#field)
  return (node as any).kind === ts.SyntaxKind.PrivateIdentifier;
}

private hasPrivateModifier(modifiers: ts.NodeArray<ts.ModifierLike> | undefined): boolean {
  if (!modifiers) return false;
  
  return modifiers.some(mod => {
    // Standard private keyword
    if (mod.kind === ts.SyntaxKind.PrivateKeyword) return true;
    
    // Private identifiers (#field)
    if (this.isPrivateIdentifier(mod)) return true;
    
    return false;
  });
}

private hasStaticModifier(modifiers: ts.NodeArray<ts.ModifierLike> | undefined): boolean {
  if (!modifiers) return false;
  return modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
}

  analyzeFiles(filePaths: string[]): FileAnalysis[] {
    return filePaths.map(filePath => this.analyzeFile(filePath));
  }

  analyzeFile(filePath: string): FileAnalysis {
    if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const compilerOptions = this.createCompilerOptions(filePath);
    
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      compilerOptions.target || ts.ScriptTarget.Latest,
      true
    );

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

  private extractFunctions(sourceFile: ts.SourceFile): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node) && node.name) {
        functions.push(this.parseFunction(node));
      } else if (ts.isArrowFunction(node) && ts.isVariableDeclaration(node.parent)) {
        functions.push(this.parseArrowFunction(node));
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return functions;
  }

  private createCompilerOptions(filePath: string): ts.CompilerOptions {
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

  private parseFunction(node: ts.FunctionDeclaration): FunctionInfo {
    return {
      name: node.name?.getText() || 'anonymous',
      params: this.extractParams(node.parameters),
      returnType: this.getReturnType(node),
      description: this.extractComments(node),
      isAsync: !!node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword),
      isGenerator: !!node.asteriskToken
    };
  }

  private parseArrowFunction(node: ts.ArrowFunction): FunctionInfo {
    const parent = node.parent as ts.VariableDeclaration;
    return {
      name: parent.name.getText(),
      params: this.extractParams(node.parameters),
      returnType: this.getReturnType(node),
      description: this.extractComments(parent),
      isAsync: false,
      isGenerator: false
    };
  }

  private extractClasses(sourceFile: ts.SourceFile): ClassInfo[] {
    const classes: ClassInfo[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        classes.push(this.parseClass(node));
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return classes;
  }

  private parseClass(node: ts.ClassDeclaration): ClassInfo {
    return {
      name: node.name?.getText() || 'AnonymousClass',
      methods: this.extractMethods(node),
      properties: this.extractProperties(node),
      description: this.extractComments(node)
    };
  }

    private isPrivateMember(modifiers: ts.NodeArray<ts.ModifierLike> | undefined): boolean {
    if (!modifiers) return false;
    
    return modifiers.some(mod => {
      // For regular private keyword
      if (mod.kind === ts.SyntaxKind.PrivateKeyword) return true;
      
      // For #private fields (PrivateIdentifier)
      if ((mod as any).kind === ts.SyntaxKind.PrivateIdentifier) return true;
      
      // For newer TypeScript versions
      if (ts.isPrivateIdentifier?.(mod)) return true;
      
      return false;
    });
  }

  private isStaticMember(modifiers: ts.NodeArray<ts.ModifierLike> | undefined): boolean {
    if (!modifiers) return false;
    return modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
  }

  private extractMethods(classNode: ts.ClassDeclaration): MethodInfo[] {
    const methods: MethodInfo[] = [];

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

  private extractProperties(classNode: ts.ClassDeclaration): PropertyInfo[] {
    const properties: PropertyInfo[] = [];

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

  private extractInterfaces(sourceFile: ts.SourceFile): InterfaceInfo[] {
    const interfaces: InterfaceInfo[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node)) {
        interfaces.push(this.parseInterface(node));
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return interfaces;
  }

  private parseInterface(node: ts.InterfaceDeclaration): InterfaceInfo {
    return {
      name: node.name.getText(),
      properties: this.extractInterfaceProperties(node),
      methods: this.extractInterfaceMethods(node)
    };
  }

  private extractInterfaceProperties(node: ts.InterfaceDeclaration): PropertyInfo[] {
    const properties: PropertyInfo[] = [];

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

  private extractInterfaceMethods(node: ts.InterfaceDeclaration): MethodInfo[] {
    const methods: MethodInfo[] = [];

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

  private extractVariables(sourceFile: ts.SourceFile): VariableInfo[] {
    const variables: VariableInfo[] = [];

    const visit = (node: ts.Node) => {
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

  private extractParams(parameters: ts.NodeArray<ts.ParameterDeclaration>): ParamInfo[] {
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
      } catch (error) {
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

  private getReturnType(node: ts.SignatureDeclaration): string {
    return this.getTypeText(node.type) || 'void';
  }

  private getTypeText(typeNode: ts.TypeNode | undefined): string {
    if (!typeNode) return 'any';
    
    const typeText = typeNode.getText();
    
    // Handle JavaScript files where types might not be explicit
    if (typeText === 'any' || !typeText.trim()) {
      return 'any';
    }
    
    return typeText;
  }

  private extractComments(node: ts.Node): string | undefined {
    const sourceFile = node.getSourceFile();
    const comments = ts.getLeadingCommentRanges(sourceFile.text, node.pos);
    
    if (comments && comments.length > 0) {
      return sourceFile.text.substring(comments[0].pos, comments[0].end);
    }
    return undefined;
  }
  
}