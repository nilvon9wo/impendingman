# Impendingman

Impendingman is a wrapper for Newman’s Postman collection runner.

## The Problem

1. Postman is a great tool for testing APIs, but it's not ideal for editing JavaScript.
2. Newman is excellent for running Postman tests from the command line, but it doesn't accept JavaScript files directly.

To better facilitate the development of JavaScript tests for API end-to-end testing, Impendingman accepts template JSON files. It searches for file references and, when the files exist, safely embeds their contents within the JSON file. This enables Newman to execute JavaScript tests seamlessly.

For instance, consider a template JSON collection:

```json
{
  "info": {
    "_postman_id": "...",
    "name": "ImpendingManExample",
    // ...
  },
  "item": [
    {
      "name": "https://api.airtable.com/v0/{{ BASE_ID }}",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": "{{{file:///./Example_collection/step1_test_confirm_something.js}}}",
            "type": "text/javascript"
          }
        }
      ],
      // ...
    }
  ]
}
```

In this example, Impendingman will search for file references like {{{file:///./Example_collection/step1_test_confirm_something.js}}}. If the file path is valid, it replaces the reference with the JavaScript content, allowing Newman to execute the collection.

## Modes of Operation
Impendingman has two modes of operation:

* Run: Execute tests immediately.
* Populate: Populate the template without execution.

### Run
> **Warning:**  Run mode presently requires "newman" to be installed to the host as it is _not_ included within this solution (yet).
To run immediately, execute Impendingman as follows:

```shell
node impendingman.js run "./path/to/collection.template.json" -g "./path/to/global_collection.json" \
  --env-var SOME_ENVIRONMENTAL_VARIABLE=$ SOME_ENVIRONMENTAL_VARIABLE \
  --impending-man-output "./collection.populated.json"
```

The `--impending-man-output` option is optional. If omitted, a random name is used, and the file is automatically deleted upon completion.

By default, the system will throw an error if files referenced in the collection JSON are missing. 
To allow Newman execution to continue despite these missing files (which may still result in a subsequent failure), 
use the flag --impending-man-on-missing-file=warning-only.

### Populate

To populate the template for later use without running:

```shell
node impendingman.js populate "./path/to/collection.template.json" -g "./path/to/global_collection.json" \
  --impending-man-output "./collection.populated.json"
```

During execution, the template is also printed to the console. To prevent this console output, use the `--impending-man-no-console` switch. However, this switch is not allowed without specifying `--impending-man-output`.

### Impendingman Example

This example demonstrates how to use Impendingman, a tool that enhances Postman collections with dynamic capabilities. In this example, we'll work with the Cat Fact Ninja API (https://catfact.ninja/fact) to showcase how Impendingman can be integrated into your testing workflow.

#### Prerequisites

1. Install [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
3. Install [newman](https://learning.postman.com/docs/collections/using-newman-cli/installing-running-newman/).

#### Getting Started

1. Clone or download the Impendingman repository from GitHub (https://github.com/nilvon9wo/impendingman).
2. Navigate to the `example` folder within the repository.

#### Running the Example

1. Open a terminal and navigate to the `example` directory.
2. Run the `run.sh` script:

   ```bash
   ./run.sh
   ```

This script uses Impendingman to run a test against the Cat Fact Ninja API and generate a Postman collection with the test results.

Observe the script's execution. You should see the tests pass, and a new file named `catfacts.postman_collection.json` will be created in the example directory.

#### Details of the Example:
- `run.sh`: A simple shell script that executes Impendingman with the appropriate arguments.
- `example.postman_collection.template.json`: A Postman collection template that defines a request to the Cat Fact Ninja API. The collection includes a reference to a test script.
- `scripts/catfact_ninja_tests.js`: A JavaScript file containing Postman test scripts that validate the API response. This file is referenced in the `example.postman_collection.template.json`.

#### Important Note:
- The `TARGET_DOMAIN` environment variable is set in the `run.sh` script. It is used to replace the placeholder in the request URL with the actual domain.

#### Conclusion:
This example demonstrates how to integrate Impendingman into your testing process, enabling dynamic and flexible testing scenarios. Customize the example to suit your own APIs and testing requirements.

For more information about Impendingman, refer to the official repository: https://github.com/yourusername/impendingman

Feel free to reach out for any questions or assistance!



## Further Notes
* Triple curly braces ({{{ }}}) are used to distinguish Impendingman's interpolation from Postman and Newman's double curly braces.
* While `file:///` is required for the pattern matcher, other URIs are not currently supported.
* This solution is specifically designed for replacing references to JavaScript files with executable JavaScript. While you can include file references anywhere, using them to replace other contents hasn't been tested and isn't guaranteed to work as expected.



