# Agentic Portal Quickstart
This is an experimental agentic API portal using [Apigee API hub](https://docs.cloud.google.com/apigee/docs/apihub/what-is-api-hub) as registry and [Apigee](https://cloud.google.com/apigee) as AI Gateway. You can imagine this project as a frontend for users & customers to use and interact with agentic APIs (MCP, A2A, REST).

<img width="650" alt="Agentic Portal screenshot" src="https://github.com/user-attachments/assets/91e79f01-f0e2-4329-9066-a17fd4f4ce18" />

Deploy it yourself as a single container to [Google Cloud Run](https://cloud.google.com/run) using this tutorial in **Google Cloud Shell**, and post issues or feedback here.

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.png)](https://ssh.cloud.google.com/cloudshell/open?cloudshell_git_repo=https://github.com/api-integration-samples/agentic-portal-quickstart&ephemeral=false&show=ide%2Cterminal&cloudshell_tutorial=tutorial.md)

🚀 Try out a test deployment here: [https://portal.agenticplatform.dev](https://portal.agenticplatform.dev)

## Supported features
- Register using a Google account in the portal.
- Browse Tools (REST, MCP) & Agents (A2A).
- Create app subscriptions & credentials for APIs.
- Explore and test APIs using OpenAPI documentation (available now), MCP and A2A inspectors (coming soon).
- Get code snippets to integrate REST, MCP & A2A with [Agent Development Kit](https://google.github.io/adk-docs/) agents.
- Update API registry data in API hub, updates are pushed out immediately to portals using [Eventarc](https://docs.cloud.google.com/eventarc/docs).

## Prerequisites
- A Google Cloud project.
- Apigee API hub and Apigee (eval, payg or subscription) provisioned.
- Cloud Run enabled on the project.

## Things to know
- API hub APIs & Versions are shown in the portal if the these attributes are set (can easily be changed to other attributes, if wanted):
  - API **Target users** attribute is set to **Public**
  - Version **Lifecycle** attribute is set to **Production**

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
