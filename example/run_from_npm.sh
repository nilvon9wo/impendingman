#!/bin/bash

impendingman run "./example.postman_collection.template.json" \
  --env-var TARGET_DOMAIN=catfact.ninja \
  --impending-man-output "./catfacts.postman_collection.json"

# Check if all runs were successful
if [ $? -eq 0 ]; then
  echo "Success: Tests passed! :-)"
else
  echo "Failure: Tested failed. :-("
fi
