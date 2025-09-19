export declare class CommentCleaner {
    private garbagePatterns;
    cleanFile(filePath: string): Promise<string>;
    cleanFiles(filePaths: string[]): Promise<Map<string, string>>;
    isGarbageComment(comment: string): boolean;
}
//# sourceMappingURL=cleaner.d.ts.map