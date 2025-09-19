import * as fs from 'fs';
import * as path from 'path';
import { CommentConfig, FunctionInfo, ClassInfo, MethodInfo, PropertyInfo, VariableInfo } from './types';

export interface TemplateConfig {
  functionTemplate?: string;
  classTemplate?: string;
  methodTemplate?: string;
  propertyTemplate?: string;
  variableTemplate?: string;
}

interface TemplateData {
  [key: string]: any;
}

export class TemplateEngine {
  private templates: TemplateConfig;
  private config: CommentConfig;

  constructor(config: CommentConfig, customTemplates?: TemplateConfig) {
    this.config = config;
    this.templates = this.loadTemplates(customTemplates);
  }

  private loadTemplates(customTemplates?: TemplateConfig): TemplateConfig {
    const defaultTemplates: TemplateConfig = {
      functionTemplate: this.getDefaultFunctionTemplate(),
      classTemplate: this.getDefaultClassTemplate(),
      methodTemplate: this.getDefaultMethodTemplate(),
      propertyTemplate: this.getDefaultPropertyTemplate(),
      variableTemplate: this.getDefaultVariableTemplate()
    };

    return { ...defaultTemplates, ...customTemplates };
  }

  private getDefaultFunctionTemplate(): string {
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

  private getDefaultClassTemplate(): string {
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

  private getDefaultMethodTemplate(): string {
    return this.getDefaultFunctionTemplate();
  }

  private getDefaultPropertyTemplate(): string {
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

  private getDefaultVariableTemplate(): string {
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

  private renderTemplate(template: string, data: TemplateData): string {
    let result = template;

    // Handle conditionals
    result = result.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, 
      (match: string, key: string, content: string): string => {
        return data[key] ? content : '';
      }
    );

    // Handle loops
    result = result.replace(/\{\{#each (\w+)\}\}(.*?)\{\{\/each\}\}/gs, 
      (match: string, key: string, content: string): string => {
        if (!data[key] || !Array.isArray(data[key])) return '';
        return data[key].map((item: any, index: number): string => {
          let itemContent = content;
          
          // Replace item properties
          itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, 
            (m: string, prop: string): string => item[prop] !== undefined ? item[prop] : ''
          );
          
          // Replace loop variables
          itemContent = itemContent.replace(/\{\{@index\}\}/g, index.toString());
          itemContent = itemContent.replace(/\{\{@last\}\}/g, 
            (index === data[key].length - 1).toString()
          );
          
          return itemContent;
        }).join('');
      }
    );

    // Handle simple variables
    result = result.replace(/\{\{(\w+)\}\}/g, 
      (match: string, key: string): string => data[key] !== undefined ? data[key] : ''
    );

    // Handle escaped variables (for type annotations)
    result = result.replace(/\{\{\{(\w+)\}\}\}/g, 
      (match: string, key: string): string => data[key] !== undefined ? data[key] : ''
    );

    return result;
  }

  generateFunctionComment(func: FunctionInfo): string {
    const data = {
      ...func,
      includeExamples: this.config.includeExamples,
      includeTypes: this.config.includeTypes
    };
    return this.renderTemplate(this.templates.functionTemplate!, data);
  }

  generateClassComment(cls: ClassInfo): string {
    const data = {
      ...cls,
      includeExamples: this.config.includeExamples
    };
    return this.renderTemplate(this.templates.classTemplate!, data);
  }

  generateMethodComment(method: MethodInfo): string {
    const data = {
      ...method,
      includeExamples: this.config.includeExamples,
      includeTypes: this.config.includeTypes
    };
    return this.renderTemplate(this.templates.methodTemplate!, data);
  }

  generatePropertyComment(prop: PropertyInfo): string {
    const data = {
      ...prop,
      includeTypes: this.config.includeTypes
    };
    return this.renderTemplate(this.templates.propertyTemplate!, data);
  }

  generateVariableComment(variable: VariableInfo): string {
    const data = {
      ...variable,
      includeTypes: this.config.includeTypes
    };
    return this.renderTemplate(this.templates.variableTemplate!, data);
  }

  async loadCustomTemplatesFromFile(templatePath: string): Promise<void> {
    try {
      if (fs.existsSync(templatePath)) {
        const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
        const customTemplates = JSON.parse(templateContent);
        this.templates = { ...this.templates, ...customTemplates };
      }
    } catch (error) {
      if (error instanceof Error)
        console.warn('Error loading custom templates:', error.message);
    }
  }
}