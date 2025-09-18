import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

export class FileUtils {
  static async findFiles(patterns: string[]): Promise<string[]> {
    const files: string[] = [];

    for (const pattern of patterns) {
      const matches = await new Promise<string[]>((resolve, reject) => {
        glob(pattern, (err, matches) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });

      files.push(...matches);
    }

    return Array.from(new Set(files)).filter(file => 
      ['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(file))
    );
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.promises.writeFile(filePath, content, 'utf-8');
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
}