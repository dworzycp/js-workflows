import { WorkflowEngine } from "./workflow-engine"

describe('Workflow engine integration test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        console.log = jest.fn()
    })

    it('SHOULD move from step1 to step2 via nextStep', () => {
        const workflow = {
            id: 'test-workflow',
            firstStep: 'step1',
            steps: {
                step1: {
                    execute: (data: any) => {
                        console.log('Called step1')
                        data.engine.onNextStep()
                    },
                    nextStep: 'step2'
                },
                step2: {
                    execute: () => {
                        console.log('Called step2')
                    },
                },
            },
        }

        const testEngine = new WorkflowEngine(workflow)
        testEngine.startWorkflow()
        expect(console.log).toHaveBeenCalledWith('Called step1')
        expect(console.log).toHaveBeenCalledWith('Called step2')
    })

    it('SHOULD move from step1 to step2 via cancelStep', () => {
        const workflow = {
            id: 'test-workflow',
            firstStep: 'step1',
            steps: {
                step1: {
                    execute: (data: any) => {
                        console.log('Called step1')
                        data.engine.onCancelStep()
                    },
                    cancelStep: 'step2'
                },
                step2: {
                    execute: () => {
                        console.log('Called step2')
                    },
                },
            },
        }

        const testEngine = new WorkflowEngine(workflow)
        testEngine.startWorkflow()
        expect(console.log).toHaveBeenCalledWith('Called step1')
        expect(console.log).toHaveBeenCalledWith('Called step2')
    })
    
    it('SHOULD move from step1 to step2 via errorStep with a status code', () => {
        const workflow = {
            id: 'test-workflow',
            firstStep: 'step1',
            steps: {
                step1: {
                    execute: (data: any) => {
                        console.log('Called step1')
                        
                        try {
                            throw { response: { status: 400 } }
                        } catch (e) {
                            data.engine.onErrorStep(e)
                        }
                    },
                    errorSteps: {
                        '400': 'step2'
                    }
                },
                step2: {
                    execute: () => {
                        console.log('Called step2')
                    },
                },
            },
        }

        const testEngine = new WorkflowEngine(workflow)
        testEngine.startWorkflow()
        expect(console.log).toHaveBeenCalledWith('Called step1')
        expect(console.log).toHaveBeenCalledWith('Called step2')
    })

    it('SHOULD move from step1 to step2 via fallback errorStep', () => {
        const workflow = {
            id: 'test-workflow',
            firstStep: 'step1',
            steps: {
                step1: {
                    execute: (data: any) => {
                        console.log('Called step1')
                        
                        try {
                            throw { response: { status: 400 } }
                        } catch (e) {
                            data.engine.onErrorStep(e)
                        }
                    },
                    errorSteps: {
                        fallback: 'step2'
                    }
                },
                step2: {
                    execute: () => {
                        console.log('Called step2')
                    },
                },
            },
        }

        const testEngine = new WorkflowEngine(workflow)
        testEngine.startWorkflow()
        expect(console.log).toHaveBeenCalledWith('Called step1')
        expect(console.log).toHaveBeenCalledWith('Called step2')
    })
})