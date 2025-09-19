import { FileAnalysis } from './types';
export declare class CodeAnalyzer {
    private program?;
    private checker?;
    private isPrivateIdentifier;
    private hasPrivateModifier;
    private hasStaticModifier;
    analyzeFiles(filePaths: string[]): FileAnalysis[];
    analyzeFile(filePath: string): FileAnalysis;
    private extractFunctions;
    private createCompilerOptions;
    private parseFunction;
    private parseArrowFunction;
    private extractClasses;
    private parseClass;
    private isPrivateMember;
    private isStaticMember;
    private extractMethods;
    private extractProperties;
    private extractInterfaces;
    private parseInterface;
    private extractInterfaceProperties;
    private extractInterfaceMethods;
    private extractVariables;
    private extractParams;
    private getReturnType;
    private getTypeText;
    private extractComments;
}
//# sourceMappingURL=analyzer.d.ts.map