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
exports.FileUtils = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const globby_1 = require("globby");
class FileUtils {
    static async findFiles(patterns) {
        const files = await (0, globby_1.globby)(patterns, {
            expandDirectories: {
                extensions: ['js', 'ts', 'jsx', 'tsx']
            }
        });
        return Array.from(new Set(files)).filter(file => ['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(file)));
    }
    static async writeFile(filePath, content) {
        await fs.promises.writeFile(filePath, content, 'utf-8');
    }
    static async readFile(filePath) {
        return await fs.promises.readFile(filePath, 'utf-8');
    }
    static async backupFile(filePath) {
        const backupPath = `${filePath}.backup`;
        await fs.promises.copyFile(filePath, backupPath);
        return backupPath;
    }
    static async restoreBackup(backupPath) {
        const originalPath = backupPath.replace('.backup', '');
        await fs.promises.copyFile(backupPath, originalPath);
        await fs.promises.unlink(backupPath);
    }
    static async exists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=file-utils.js.map