import { WorkflowEngine } from "./workflow-engine"

const baseWorkflow = { id: 'foo', firstStep: 'bar', steps: { bar: { execute: jest.fn() } } }

describe('Workflow Engine', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('WHEN constructor is called', () => {
        it('SHOULD set initialWorkflow', () => {
            const testEngine = new WorkflowEngine(baseWorkflow)
            expect(testEngine?.getInitialWorkflow()).toEqual(baseWorkflow)
        })

        it('SHOULD set successCallback if onSuccessCallback is passed', () => {
            const onSuccessCallback = () => {}
            const testEngine = new WorkflowEngine(baseWorkflow, onSuccessCallback)
            expect(testEngine?.getOnSuccessCallback()).toEqual(onSuccessCallback)
        })

        it('SHOULD set data if initialData is passed', () => {
            const initialData = { foo: 'bar' }
            const testEngine = new WorkflowEngine(baseWorkflow, undefined, initialData)
            expect(testEngine?.getData()).toEqual(expect.objectContaining(initialData))
        })
    })

    describe('WHEN startWorkflow is called', () => {
        it('SHOULD set currentWorkflow as initialWorkflow is no workflow is passed', () => {
            const testEngine = new WorkflowEngine(baseWorkflow)
            testEngine.startWorkflow()
            expect(testEngine.getCurrentWorkflow()).toEqual(baseWorkflow)
        })

        it('SHOULD set currentWorkflow as the passed in workflow if one is passed', () => {
            const workflowOverride = { ...baseWorkflow, id: 'foo2' }
            const testEngine = new WorkflowEngine(baseWorkflow)
            testEngine.startWorkflow(workflowOverride)
            expect(testEngine.getCurrentWorkflow()).toEqual(workflowOverride)
        })

        it('SHOULD throw if the firstStep is not on the list of steps', () => {
            const workflow = { id: 'foo', firstStep: 'bar', steps: {} }
            const testEngine = new WorkflowEngine(workflow)
            try {
                testEngine.startWorkflow()
            } catch (e) {
                expect(e).toEqual('First step bar is not defined in the list of steps.')
            }
        })

        it('SHOULD find and set the first step as currentStep', () => {
            const testEngine = new WorkflowEngine(baseWorkflow)
            testEngine.startWorkflow()
            expect(testEngine.getCurrentStep()).toEqual(baseWorkflow.steps['bar'])
        })

        it('SHOULD execute the first step', () => {
            const testEngine = new WorkflowEngine(baseWorkflow)
            testEngine.startWorkflow()
            expect(baseWorkflow.steps['bar'].execute).toHaveBeenCalledTimes(1)
        })
    })

    describe('WHEN executeStep is called', () => {
        it('SHOULD set currentStep to the passed in step', () => {
            const testEngine = new WorkflowEngine(baseWorkflow)
            testEngine.executeStep(baseWorkflow.steps['bar'])
            expect(testEngine.getCurrentStep()).toEqual(baseWorkflow.steps['bar'])
        })

        it('SHOULD call the step with stored data', () => {
            const testData = { foo: 'bar' }
            const testEngine = new WorkflowEngine(baseWorkflow, undefined, testData)
            testEngine.executeStep(baseWorkflow.steps['bar'])
            expect(baseWorkflow.steps['bar'].execute).toHaveBeenCalledTimes(1)
            expect(baseWorkflow.steps['bar'].execute).toHaveBeenCalledWith(expect.objectContaining(testData))
        })
    })

    describe('WHEN findNextStep is called', () => {
        it('SHOULD throw if the current step does not have a nextStep defined', () => {
            const testEngine = new WorkflowEngine(baseWorkflow)
            testEngine.startWorkflow()
            try {
                testEngine.findNextStep()
            } catch (e) {
                expect(e).toEqual('Current step does not have a next step to move onto.')
            }
        })

        it('SHOULD return the next step', () => {
            const workflow = { 
                ...baseWorkflow,
                steps: {
                    bar: { execute: jest.fn(), nextStep: 'bar2' },
                    bar2: { execute: jest.fn() },
                },
            }
            const testEngine = new WorkflowEngine(workflow)
            testEngine.startWorkflow()
            expect(testEngine.findNextStep()).toEqual(workflow.steps.bar2)
        })
    })

    describe('WHEN onNextStep is called', () => {
        it('SHOULD call the next step', () => {
            const step2Func = jest.fn()
            const workflow = { 
                ...baseWorkflow,
                steps: {
                    bar: { execute: jest.fn(), nextStep: 'bar2' },
                    bar2: { execute: step2Func },
                },
            }
            const testEngine = new WorkflowEngine(workflow)
            testEngine.startWorkflow()
            testEngine.onNextStep()
            expect(step2Func).toHaveBeenCalledTimes(1)
        })

        it('SHOULD call the next step with additional data if data is passed', () => {
            const step2Func = jest.fn()
            const workflow = { 
                ...baseWorkflow,
                steps: {
                    bar: { execute: jest.fn(), nextStep: 'bar2' },
                    bar2: { execute: step2Func },
                },
            }
            const testEngine = new WorkflowEngine(workflow)
            testEngine.startWorkflow()
            const testData = { foo: 'bar' }
            testEngine.onNextStep(testData)
            expect(step2Func).toHaveBeenCalledWith(expect.objectContaining(testData))
        })
    })

    describe('WHEN onCancelStep is called', () => {
        it('SHOULD throw if the current step does not have an cancelStep step defined', () => {
            const testEngine = new WorkflowEngine(baseWorkflow)
            testEngine.startWorkflow()
            try {
                testEngine.onCancelStep()
            } catch (e) {
                expect(e).toEqual('Current step does not have an on cancel step defined.')
            }
        })

        it('SHOULD find and call the cancelStep step', () => {
            const cancelFunc = jest.fn()
            const workflow = { 
                ...baseWorkflow,
                steps: {
                    bar: { execute: jest.fn(), cancelStep: 'cancelStep' },
                    cancelStep: { execute: cancelFunc },
                },
            }
            const testEngine = new WorkflowEngine(workflow)
            testEngine.startWorkflow()
            testEngine.onCancelStep()
            expect(cancelFunc).toHaveBeenCalledTimes(1)
        })

        it('SHOULD find and call the cancelStep step with additional data if data is passed', () => {
            const cancelFunc = jest.fn()
            const workflow = { 
                ...baseWorkflow,
                steps: {
                    bar: { execute: jest.fn(), cancelStep: 'cancelStep' },
                    cancelStep: { execute: cancelFunc },
                },
            }
            const testEngine = new WorkflowEngine(workflow)
            testEngine.startWorkflow()
            const testData = { foo: 'bar' }
            testEngine.onCancelStep(testData)
            expect(cancelFunc).toHaveBeenCalledWith(expect.objectContaining(testData))
        })
    })

    describe('WHEN onErrorStep is called', () => {
        it('SHOULD throw if the current step does not have error steps defined', () => {
            const workflow = { 
                ...baseWorkflow,
                steps: {
                    bar: {
                        execute: jest.fn(),
                    },
                },
            }
            const testEngine = new WorkflowEngine(workflow)
            testEngine.startWorkflow()
            try {
                testEngine.onErrorStep({})
            } catch (error) {
                expect(error).toEqual('Current step does not have an on error step defined.')
            }
        })

        it('SHOULD find the error step and call it based on status code', () => {
            const errorFunc = jest.fn()
            const workflow = { 
                ...baseWorkflow,
                steps: {
                    bar: {
                        execute: jest.fn(),
                        errorSteps: {
                            "400": "errorStep"
                        }
                    },
                    errorStep: { execute: errorFunc },
                },
            }
            const testEngine = new WorkflowEngine(workflow)
            testEngine.startWorkflow()
            testEngine.onErrorStep({ response: { status: 400 } })
            expect(errorFunc).toHaveBeenCalledTimes(1)
        })
    })

    it('SHOULD find and call the fallback error step', () => {
        const errorFunc = jest.fn()
        const workflow = { 
            ...baseWorkflow,
            steps: {
                bar: {
                    execute: jest.fn(),
                    errorSteps: {
                        fallback: "errorStep"
                    }
                },
                errorStep: { execute: errorFunc },
            },
        }
        const testEngine = new WorkflowEngine(workflow)
        testEngine.startWorkflow()
        testEngine.onErrorStep({ response: { status: 400 } })
        expect(errorFunc).toHaveBeenCalledTimes(1)
    })

    it('SHOULD warn if an uncaught error occurred with no fallback', () => {
        const errorFunc = jest.fn()
        const workflow = { 
            ...baseWorkflow,
            steps: {
                bar: {
                    execute: jest.fn(),
                    errorSteps: {
                        "401": "errorStep"
                    }
                },
                errorStep: { execute: errorFunc },
            },
        }
        console.warn = jest.fn()
        const testEngine = new WorkflowEngine(workflow)
        testEngine.startWorkflow()
        testEngine.onErrorStep({ response: { status: 400 } })
        expect(console.warn).toHaveBeenCalledWith('An unhandled error occurred in the current step with no fallback provided.')
    })
})
