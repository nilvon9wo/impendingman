#!/bin/bash

node ../dist/impendingman run "./example.postman_collection.template.json" \
  --env-var TARGET_DOMAIN=catfact.ninja \
  --impending-man-output "./catfacts.postman_collection.json"


