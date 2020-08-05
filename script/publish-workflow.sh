#!/usr/bin/env bash

# For publishing a patch version, add the following parameter:
# "publish-type": "patch"

CircleCIToken=$1
curl -v -u ${CircleCIToken}: -X POST --header "Content-Type: application/json" -d '{
  "branch": "main",
  "parameters": {
    "publish": true
  }
}' https://circleci.com/api/v2/project/gh/forcedotcom/lwc-dev-server/pipeline
