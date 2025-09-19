import * as fs from 'fs';
import * as path from 'path';
import { globby } from 'globby';

export class FileUtils {
  static async findFiles(patterns: string[]): Promise<string[]> {
    const files = await globby(patterns, {
      expandDirectories: {
        extensions: ['js', 'ts', 'jsx', 'tsx']
      }
    });

    return Array.from(new Set(files)).filter(file => 
      ['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(file))
    );
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  static async readFile(filePath: string): Promise<string> {
    return await fs.promises.readFile(filePath, 'utf-8');
  }

  static async backupFile(filePath: string): Promise<string> {
    const backupPath = `${filePath}.backup`;
    await fs.promises.copyFile(filePath, backupPath);
    return backupPath;
  }

  static async restoreBackup(backupPath: string): Promise<void> {
    const originalPath = backupPath.replace('.backup', '');
    await fs.promises.copyFile(backupPath, originalPath);
    await fs.promises.unlink(backupPath);
  }

  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}