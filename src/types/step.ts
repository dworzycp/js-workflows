export interface Step {
    execute: Function;
    nextStep?: string;
    cancelStep?: string;
    errorSteps?: Record<string, string>;
}