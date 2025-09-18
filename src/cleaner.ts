import * as fs from 'fs';
import * as path from 'path';

export class CommentCleaner {
  private garbagePatterns = [
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

  async cleanFile(filePath: string): Promise<string> {
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

  async cleanFiles(filePaths: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    for (const filePath of filePaths) {
      try {
        const cleanedContent = await this.cleanFile(filePath);
        results.set(filePath, cleanedContent);
      } catch (error) {
        if (error instanceof Error)
        console.warn(`Error cleaning file ${filePath}:`, error.message);
      }
    }

    return results;
  }

  isGarbageComment(comment: string): boolean {
    return this.garbagePatterns.some(pattern => pattern.test(comment));
  }
}