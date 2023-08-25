# Impendingman

Impendingman is a wrapper for Newman’s Postman collection runner.

## The Problem

1. [Postman](https://www.postman.com/) is a great tool for testing APIs, but it's not ideal for editing JavaScript.
2. [Newman](https://github.com/postmanlabs/newman) is excellent for running Postman tests from the command line, but it doesn't accept JavaScript files directly.

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

In this example, Impendingman will search for file references like `{{{file:///./Example_collection/step1_test_confirm_something.js}}}`. If the file path is valid, it replaces the reference with the JavaScript content, allowing Newman to execute the collection.

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

### Populate

To populate the template for later use without running:

```shell
node impendingman.js populate "./path/to/collection.template.json" -g "./path/to/global_collection.json" \
  --impending-man-output "./collection.populated.json"
```

During execution, the template is also printed to the console. To prevent this console output, use the `--impending-man-no-console` switch. However, this switch is not allowed without specifying `--impending-man-output`.

## Notes
* Triple curly braces ({{{ }}}) are used to distinguish Impendingman's interpolation from Postman and Newman's double curly braces.
* While `file:///` is required for the pattern matcher, other URIs are not currently supported.
* This solution is specifically designed for replacing references to JavaScript files with executable JavaScript. While you can include file references anywhere, using them to replace other contents hasn't been tested and isn't guaranteed to work as expected.



