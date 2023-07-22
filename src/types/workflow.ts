import { Step } from "./step";

export interface Workflow {
    id: string;
    firstStep: string;
    steps: Record<string, Step>
}