export declare class ASTCommentInjector {
    static injectCommentsInFile(filePath: string, comments: Map<string, string>): Promise<string>;
    static injectComments(sourceCode: string, comments: Map<string, string>): string;
    private static hasLeadingComments;
    static extractExistingComments(sourceCode: string): Map<string, string>;
}
//# sourceMappingURL=ast-injector.d.ts.map