import { CommentConfig, FunctionInfo, ClassInfo, MethodInfo, PropertyInfo, VariableInfo } from './types';
export interface TemplateConfig {
    functionTemplate?: string;
    classTemplate?: string;
    methodTemplate?: string;
    propertyTemplate?: string;
    variableTemplate?: string;
}
export declare class TemplateEngine {
    private templates;
    private config;
    constructor(config: CommentConfig, customTemplates?: TemplateConfig);
    private loadTemplates;
    private getDefaultFunctionTemplate;
    private getDefaultClassTemplate;
    private getDefaultMethodTemplate;
    private getDefaultPropertyTemplate;
    private getDefaultVariableTemplate;
    private renderTemplate;
    generateFunctionComment(func: FunctionInfo): string;
    generateClassComment(cls: ClassInfo): string;
    generateMethodComment(method: MethodInfo): string;
    generatePropertyComment(prop: PropertyInfo): string;
    generateVariableComment(variable: VariableInfo): string;
    loadCustomTemplatesFromFile(templatePath: string): Promise<void>;
}
//# sourceMappingURL=template-engine.d.ts.map