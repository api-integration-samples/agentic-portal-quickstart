# agentic-portal-quickstart
A quickstart agentic portal for MCP, A2A, REST and all other API types using Apigee &amp; API hub.

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.png)](https://ssh.cloud.google.com/cloudshell/open?cloudshell_git_repo=https://github.com/api-integration-samples/agentic-portal-quickstart&ephemeral=false&show=ide%2Cterminal&cloudshell_tutorial=tutorial.md)

## Prerequisites
- A Google Cloud project
- Apigee API hub 

## Deploy
```sh
# first copy the environment variables and source.
cp 1.env.sh .env
source .env

# create initial resources
./2.pre-create.sh

# deploy service
./3.deploy-service.sh

# post create
./4.post-create.sh
```
