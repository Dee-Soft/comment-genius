export interface CommentConfig {
  type: 'documentation' | 'jsdoc' | 'typedoc';
  includeTypes: boolean;
  includeDescriptions: boolean;
  includeExamples: boolean;
  includeParams: boolean;
  includeReturns: boolean;
}

export interface FunctionInfo {
  name: string;
  params: ParamInfo[];
  returnType: string;
  description?: string;
  isAsync: boolean;
  isGenerator: boolean;
}

export interface ParamInfo {
  name: string;
  type: string;
  description?: string;
  isOptional: boolean;
  defaultValue?: string;
}

export interface ClassInfo {
  name: string;
  methods: MethodInfo[];
  properties: PropertyInfo[];
  description?: string;
}

export interface MethodInfo extends FunctionInfo {
  isStatic: boolean;
  isPrivate: boolean;
}

export interface PropertyInfo {
  name: string;
  type: string;
  description?: string;
  isStatic: boolean;
  isPrivate: boolean;
}

export interface FileAnalysis {
  functions: FunctionInfo[];
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  variables: VariableInfo[];
}

export interface InterfaceInfo {
  name: string;
  properties: PropertyInfo[];
  methods: MethodInfo[];
}

export interface VariableInfo {
  name: string;
  type: string;
  description?: string;
  isConstant: boolean;
}