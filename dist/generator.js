"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentGenerator = void 0;
class CommentGenerator {
    constructor(config) {
        this.config = config;
    }
    generateFunctionComment(func) {
        const lines = [];
        lines.push('/**');
        if (func.description && this.config.includeDescriptions) {
            lines.push(` * ${func.description}`);
            lines.push(' *');
        }
        if (this.config.includeParams && func.params.length > 0) {
            func.params.forEach(param => {
                const typeInfo = this.config.includeTypes ? ` {${param.type}}` : '';
                const optional = param.isOptional ? ' [optional]' : '';
                const defaultValue = param.defaultValue ? ` Default: ${param.defaultValue}` : '';
                lines.push(` * @param ${param.name}${typeInfo}${optional}${defaultValue}${param.description ? ` - ${param.description}` : ''}`);
            });
            lines.push(' *');
        }
        if (this.config.includeReturns) {
            const returnType = this.config.includeTypes ? ` {${func.returnType}}` : '';
            lines.push(` * @returns${returnType}${func.description ? ` - Return value description` : ''}`);
        }
        if (this.config.includeExamples) {
            lines.push(' *');
            lines.push(' * @example');
            lines.push(' * // Example usage');
            lines.push(` * const result = ${func.name}(${func.params.map(p => p.name).join(', ')});`);
        }
        lines.push(' */');
        return lines.join('\n');
    }
    generateClassComment(cls) {
        const lines = [];
        lines.push('/**');
        if (cls.description && this.config.includeDescriptions) {
            lines.push(` * ${cls.description}`);
            lines.push(' *');
        }
        lines.push(' * @class');
        if (this.config.includeExamples) {
            lines.push(' *');
            lines.push(' * @example');
            lines.push(' * // Create an instance');
            lines.push(` * const instance = new ${cls.name}();`);
        }
        lines.push(' */');
        return lines.join('\n');
    }
    generateMethodComment(method) {
        return this.generateFunctionComment(method);
    }
    generatePropertyComment(prop) {
        const lines = [];
        lines.push('/**');
        if (prop.description && this.config.includeDescriptions) {
            lines.push(` * ${prop.description}`);
        }
        else {
            lines.push(' * Property description');
        }
        if (this.config.includeTypes) {
            lines.push(' *');
            lines.push(` * @type {${prop.type}}`);
        }
        lines.push(' */');
        return lines.join('\n');
    }
    generateVariableComment(variable) {
        const lines = [];
        lines.push('/**');
        if (variable.description && this.config.includeDescriptions) {
            lines.push(` * ${variable.description}`);
        }
        else {
            lines.push(' * Variable description');
        }
        if (this.config.includeTypes) {
            lines.push(' *');
            lines.push(` * @type {${variable.type}}`);
        }
        lines.push(' */');
        return lines.join('\n');
    }
    generateInterfaceComment(intf) {
        const lines = [];
        lines.push('/**');
        lines.push(' * Interface description');
        lines.push(' *');
        lines.push(' * @interface');
        lines.push(' */');
        return lines.join('\n');
    }
}
exports.CommentGenerator = CommentGenerator;
//# sourceMappingURL=generator.js.map