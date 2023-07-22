# JS-Workflows
This is a simple implementation of state machine workflows for JS.

This packages makes it easy to transition between states or pages/components in a front-end application by defining a journey in a simple object.

## Usage

### Defining a workflow

Workflows are objects with `id`, `firstStep` and a list of `steps` defined.

`Steps` are definitions of all steps that can occur in this workflow. A step can start another workflow to allow moving between them.

```js
{
    id: 'demo-workflow',
    firstStep: 'foo',
    steps: {
        foo: {
            execute: () => {},
            nextStep: 'bar',
            cancelStep: 'cancelStep',
            errorSteps: {
                '400': 'error400',
                '401': 'error401',
                fallback: 'errorFallback'
            }
        },
        bar: {
            execute: () => {}
        },
        cancelStep: {
            execute: () => {}
        },
        error400: {
            execute: () => {}
        },
        error401: {
            execute: () => {}
        },
        errorFallback: {
            execute: () => {}
        }
    }
}
```

#### Types
#### Workflow
| Name | Type | Required? | description |
| - | - | - | - |
| id | string | yes | A unique ID for the workflow
| firstStep | string | yes | Name of the first step to run, must exist in the list of steps
| steps | Record<string, Step> | yes | List of all steps in this workflow

#### Step
| Name | Type | Required? | description |
| - | - | - | - |
| execute | function | yes | Function to execute when this step is called |
| nextStep | string | no | Name of the step to move onto when `onNextStep` is called |
| cancelStep | string | no | Name of the step to move onto when `onCancelStep` is called |
| errorSteps | Record<string, string> | no | A key value pair of HTTP status codes mapped to which step to move onto when an error with that code occurs. `fallback` can also be used to catch all other errors.

#### Defining steps in a workflow

To allow a step to move onto to the next step `onNextStep` has to be called. All internal functions are exposed on the `engine` object passed in the `data` prop.

To handle `nextStep`:

```js
const demoFunction = (data) => {
    // Your code
    data.engine.onNextStep()
}
```

To handle `cancelStep`:

```js
const demoFunction = (data) => {
    // Your code
    data.engine.onCancelStep()
}
```

To handle `errorSteps`:

```js
const demoFunction = (data) => {
    try {
        // Your code
    } catch (error) {
        data.engine.onErrorStep(error)
    }
}
```

### Using a workflow

Use the `WorkflowEngine` constructor to create an instance of an engine, passing in the workflow you want to execute, the callback to be executed when workflow finished successfully and any initial data. `callback` and `data` are optional.

Calling the constructor does not start the workflow, this is to allow for a delayed execution. Call `startWorkflow` to initiate it.

```js
const engine = new WorkflowEngine(workflow, callback, data)
engine.startWorkflow()
```

### Demos

[todo]

## Contribute

[todo]

## Special thanks

Special thanks to [@joffyb](https://github.com/joffyb) without whom this would not have been possible :heart:

## License

ISC License

Copyright 2023 Pawel Dworzycki

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
