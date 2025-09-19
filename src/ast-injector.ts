import * as ts from 'typescript';
import * as fs from 'fs';

export class ASTCommentInjector {
  static async injectCommentsInFile(filePath: string, comments: Map<string, string>): Promise<string> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const modifiedContent = this.injectComments(content, comments);
    return modifiedContent;
  }
  
  static injectComments(sourceCode: string, comments: Map<string, string>): string {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const transformations: { pos: number; comment: string }[] = [];

    // Find nodes that need comments
    const visit = (node: ts.Node) => {
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

  private static hasLeadingComments(node: ts.Node, sourceCode: string): boolean {
    const comments = ts.getLeadingCommentRanges(sourceCode, node.pos);
    return comments !== undefined && comments.length > 0;
  }

  static extractExistingComments(sourceCode: string): Map<string, string> {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const existingComments = new Map<string, string>();

    const visit = (node: ts.Node) => {
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