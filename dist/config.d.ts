import { CommentConfig } from './types';
export declare const DEFAULT_CONFIG: CommentConfig;
export declare class ConfigManager {
    private configPath;
    constructor(configPath?: string);
    loadConfig(): Promise<CommentConfig>;
    saveConfig(config: Partial<CommentConfig>): Promise<void>;
    getConfig(): Promise<CommentConfig>;
}
//# sourceMappingURL=config.d.ts.map