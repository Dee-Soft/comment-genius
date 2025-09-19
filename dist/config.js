"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = exports.DEFAULT_CONFIG = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.DEFAULT_CONFIG = {
    type: 'documentation',
    includeTypes: true,
    includeDescriptions: true,
    includeExamples: true,
    includeParams: true,
    includeReturns: true,
    inferTypesFromJs: true, // Try to infer types in JS files
    useTypeInference: true, // Use type inference when possible
    templatePath: undefined
};
class ConfigManager {
    constructor(configPath = path.join(process.cwd(), 'comment-genius.config.json')) {
        this.configPath = configPath;
    }
    async loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = await fs.promises.readFile(this.configPath, 'utf-8');
                return { ...exports.DEFAULT_CONFIG, ...JSON.parse(configData) };
            }
            return exports.DEFAULT_CONFIG;
        }
        catch (error) {
            if (error instanceof Error)
                console.warn('Error loading config file, using defaults:', error.message);
            return exports.DEFAULT_CONFIG;
        }
    }
    async saveConfig(config) {
        try {
            const fullConfig = { ...exports.DEFAULT_CONFIG, ...config };
            await fs.promises.writeFile(this.configPath, JSON.stringify(fullConfig, null, 2), 'utf-8');
        }
        catch (error) {
            if (error instanceof Error)
                console.warn('Error saving config file:', error.message);
        }
    }
    async getConfig() {
        return this.loadConfig();
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map