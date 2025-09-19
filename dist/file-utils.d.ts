export declare class FileUtils {
    static findFiles(patterns: string[]): Promise<string[]>;
    static writeFile(filePath: string, content: string): Promise<void>;
    static readFile(filePath: string): Promise<string>;
    static backupFile(filePath: string): Promise<string>;
    static restoreBackup(backupPath: string): Promise<void>;
    static exists(filePath: string): Promise<boolean>;
}
//# sourceMappingURL=file-utils.d.ts.map