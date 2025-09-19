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
exports.TemplateEngine = void 0;
const fs = __importStar(require("fs"));
class TemplateEngine {
    constructor(config, customTemplates) {
        this.config = config;
        this.templates = this.loadTemplates(customTemplates);
    }
    loadTemplates(customTemplates) {
        const defaultTemplates = {
            functionTemplate: this.getDefaultFunctionTemplate(),
            classTemplate: this.getDefaultClassTemplate(),
            methodTemplate: this.getDefaultMethodTemplate(),
            propertyTemplate: this.getDefaultPropertyTemplate(),
            variableTemplate: this.getDefaultVariableTemplate()
        };
        return { ...defaultTemplates, ...customTemplates };
    }
    getDefaultFunctionTemplate() {
        return `/**
{{#if description}}
 * {{description}}
 *
{{/if}}
{{#each params}}
 * @param {{name}}{{#if type}} {{{{type}}}}{{/if}}{{#if isOptional}} [optional]{{/if}}{{#if defaultValue}} Default: {{defaultValue}}{{/if}}{{#if description}} - {{description}}{{/if}}
{{/each}}
{{#if returnType}}
 * @returns {{{{returnType}}}}{{#if description}} - Return value description{{/if}}
{{/if}}
{{#if includeExamples}}
 *
 * @example
 * // Example usage
 * const result = {{name}}({{#each params}}{{name}}{{#unless @last}}, {{/unless}}{{/each}});
{{/if}}
 */`;
    }
    getDefaultClassTemplate() {
        return `/**
{{#if description}}
 * {{description}}
 *
{{/if}}
 * @class
{{#if includeExamples}}
 *
 * @example
 * // Create an instance
 * const instance = new {{name}}();
{{/if}}
 */`;
    }
    getDefaultMethodTemplate() {
        return this.getDefaultFunctionTemplate();
    }
    getDefaultPropertyTemplate() {
        return `/**
{{#if description}}
 * {{description}}
{{else}}
 * Property description
{{/if}}
{{#if type}}
 *
 * @type {{{{type}}}}
{{/if}}
 */`;
    }
    getDefaultVariableTemplate() {
        return `/**
{{#if description}}
 * {{description}}
{{else}}
 * Variable description
{{/if}}
{{#if type}}
 *
 * @type {{{{type}}}}
{{/if}}
 */`;
    }
    // Simple template engine using replace
    renderTemplate(template, data) {
        let result = template;
        // Handle conditionals
        result = result.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, key, content) => {
            return data[key] ? content : '';
        });
        // Handle loops
        result = result.replace(/\{\{#each (\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, key, content) => {
            if (!data[key] || !Array.isArray(data[key]))
                return '';
            return data[key].map((item, index) => {
                let itemContent = content;
                itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (m, prop) => item[prop] || '');
                itemContent = itemContent.replace(/\{\{@index\}\}/g, index.toString());
                itemContent = itemContent.replace(/\{\{@last\}\}/g, (index === data[key].length - 1).toString());
                return itemContent;
            }).join('');
        });
        // Handle simple variables
        result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : '';
        });
        // Handle escaped variables (for type annotations)
        result = result.replace(/\{\{\{(\w+)\}\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : '';
        });
        return result;
    }
    generateFunctionComment(func) {
        const data = {
            ...func,
            includeExamples: this.config.includeExamples,
            includeTypes: this.config.includeTypes
        };
        return this.renderTemplate(this.templates.functionTemplate, data);
    }
    generateClassComment(cls) {
        const data = {
            ...cls,
            includeExamples: this.config.includeExamples
        };
        return this.renderTemplate(this.templates.classTemplate, data);
    }
    generateMethodComment(method) {
        const data = {
            ...method,
            includeExamples: this.config.includeExamples,
            includeTypes: this.config.includeTypes
        };
        return this.renderTemplate(this.templates.methodTemplate, data);
    }
    generatePropertyComment(prop) {
        const data = {
            ...prop,
            includeTypes: this.config.includeTypes
        };
        return this.renderTemplate(this.templates.propertyTemplate, data);
    }
    generateVariableComment(variable) {
        const data = {
            ...variable,
            includeTypes: this.config.includeTypes
        };
        return this.renderTemplate(this.templates.variableTemplate, data);
    }
    async loadCustomTemplatesFromFile(templatePath) {
        try {
            if (fs.existsSync(templatePath)) {
                const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
                const customTemplates = JSON.parse(templateContent);
                this.templates = { ...this.templates, ...customTemplates };
            }
        }
        catch (error) {
            if (error instanceof Error)
                console.warn('Error loading custom templates:', error.message);
        }
    }
}
exports.TemplateEngine = TemplateEngine;
//# sourceMappingURL=template-engine.js.map