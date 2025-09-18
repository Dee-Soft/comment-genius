import { CommentConfig } from './types';
import * as fs from 'fs';
import * as path from 'path';

export const DEFAULT_CONFIG: CommentConfig = {
  type: 'documentation',
  includeTypes: true,
  includeDescriptions: true,
  includeExamples: true,
  includeParams: true,
  includeReturns: true
};

export class ConfigManager {
  private configPath: string;

  constructor(configPath: string = path.join(process.cwd(), 'comment-genius.config.json')) {
    this.configPath = configPath;
  }

  async loadConfig(): Promise<CommentConfig> {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = await fs.promises.readFile(this.configPath, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
      }
      return DEFAULT_CONFIG;
    } catch (error) {
        if (error instanceof Error)
            console.warn('Error loading config file, using defaults:', error.message);
      return DEFAULT_CONFIG;
    }
  }

  async saveConfig(config: Partial<CommentConfig>): Promise<void> {
    try {
      const fullConfig = { ...DEFAULT_CONFIG, ...config };
      await fs.promises.writeFile(
        this.configPath,
        JSON.stringify(fullConfig, null, 2),
        'utf-8'
      );
    } catch (error) {
        if (error instanceof Error)
            console.warn('Error saving config file:', error.message);
    }
  }

  async getConfig(): Promise<CommentConfig> {
    return this.loadConfig();
  }
}