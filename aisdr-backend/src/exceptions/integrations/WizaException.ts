export default class WizaException extends Error{
    public readonly code: number;  
    public readonly errors: Record<string, any>[];  
  
    constructor(message: string, code:number, errors = [] ) {
      super(message);
      this.code = code;
      this.errors = errors
    }    
}