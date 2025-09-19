import { CommentConfig, FunctionInfo, ClassInfo, MethodInfo, PropertyInfo, InterfaceInfo, VariableInfo } from './types';
export declare class CommentGenerator {
    private config;
    constructor(config: CommentConfig);
    generateFunctionComment(func: FunctionInfo): string;
    generateClassComment(cls: ClassInfo): string;
    generateMethodComment(method: MethodInfo): string;
    generatePropertyComment(prop: PropertyInfo): string;
    generateVariableComment(variable: VariableInfo): string;
    generateInterfaceComment(intf: InterfaceInfo): string;
}
//# sourceMappingURL=generator.d.ts.map