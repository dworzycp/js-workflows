import { type Workflow } from "./types/workflow"
import { type Step } from "./types/step"

export class WorkflowEngine {
    initialWorkflow: Workflow
    successCallback: Function
    data: any = {
        engine: this
    }

    currentWorkflow: Workflow
    currentStep: Step

    constructor(workflow: Workflow, onSuccessCallback?: Function, initialData?: any) {
        this.initialWorkflow = workflow
        if (onSuccessCallback) this.successCallback = onSuccessCallback
        if (initialData) this.data = { ...this.data, ...initialData }
    }

    startWorkflow(workflow?: Workflow) {
        const workflowToRun = workflow ? workflow : this.initialWorkflow
        this.currentWorkflow = workflowToRun

        // Find and memorise the first step
        const firstStep = workflowToRun.steps[workflowToRun.firstStep]
        if (!firstStep) throw `First step ${workflowToRun.firstStep} is not defined in the list of steps.`
        this.currentStep = firstStep

        this.executeStep(firstStep)
    }

    executeStep(step: Step) {
        this.currentStep = step
        step.execute(this.data)
    }

    findNextStep() {
        if (!this.currentStep.nextStep) throw 'Current step does not have a next step to move onto.'
        return this.currentWorkflow.steps[this.currentStep.nextStep]
    }

    onNextStep(data?: any) {
        const stepToExecute = this.findNextStep()
        if (data) this.data = { ...this.data, ...data }
        this.executeStep(stepToExecute as Step)
    }

    onCancelStep(data?: any) {
        if (!this.currentStep.cancelStep) throw 'Current step does not have an on cancel step defined.'
        const stepToExecute = this.currentWorkflow.steps[this.currentStep.cancelStep]
        if (data) this.data = { ...this.data, ...data }
        this.executeStep(stepToExecute as Step)
    }

    onErrorStep(error: any) {
        if (!this.currentStep.errorSteps) throw 'Current step does not have an on error step defined.'

        // Loop through all the errorSteps 
        let foundErrorCallback = false
        Object.keys(this.currentStep.errorSteps).forEach((e) => {           
            // Check error code matches response status code
            if (String(e) === String(error?.response?.status)) {
                foundErrorCallback = true
                // @ts-ignore:next-line - Not sure how to deal with a strict null check below?
                const errorStep = this.currentWorkflow.steps[this.currentStep.errorSteps[e]]
                this.executeStep(errorStep as Step)
            }
        })

        if (!foundErrorCallback) {
            if (this.currentStep.errorSteps.fallback) {
                const fallbackStep = this.currentWorkflow.steps[this.currentStep.errorSteps.fallback]
                this.executeStep(fallbackStep as Step)
            } else {
                console.warn('An unhandled error occurred in the current step with no fallback provided.')
            }
        }

    }

    getInitialWorkflow() {
        return this.initialWorkflow
    }

    getCurrentWorkflow() {
        return this.currentWorkflow
    }

    getData() {
        return this.data
    }

    getOnSuccessCallback() {
        return this.successCallback
    }

    getCurrentStep() {
        return this.currentStep
    }
}
