import express from "express";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { McpUserService } from "./mcp";
import {
  PortalService,
  type Error,
  type ApiHubApi,
  type ApiHubApiVersion,
  type ApiHubApiVersionSpecContents,
} from "apigee-portal-module";

const firebaseApp = initializeApp();

const app = express();
const mcpUserService = new McpUserService();
app.use(express.static("public")); // for static hosting
app.use(express.json()); // for json data

const getAuthToken = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    req.authToken = req.headers.authorization.split(" ")[1];
  } else {
    req.authToken = null;
  }
  next();
};

export const checkIfAuthenticated = (req, res, next) => {
  getAuthToken(req, res, async () => {
    try {
      const { authToken } = req;
      const userInfo = await getAuth().verifyIdToken(authToken);
      req.authId = userInfo.uid;
      return next();
    } catch (e) {
      return res
        .status(401)
        .send({ error: "You are not authorized to make this request" });
    }
  });
};

const cache: { apis: ApiHubApi[]; versions: ApiHubApiVersion[] } = {
  apis: [],
  versions: [],
};

let cachePromise = loadCache();

app.post("/cache-refresh", (req, res) => {
  console.log("Cache refresh call received.");
  console.log(req.body);
  cachePromise = loadCache();
});

app.get("/config", (req, res) => {
  res.json({
    serviceUrl: process.env.SERVICE_URL,
    apigeeAgentUrl: process.env.APIGEE_AGENT_URL,
    authApiKey: process.env.AUTH_API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
  });
});

app.get("/apis", async (req, res) => {
  if (cachePromise) await cachePromise;
  res.send({
    apis: cache.apis,
    versions: cache.versions,
  });
});

app.get("/api-spec", async (req, res) => {
  let result: any = {};
  let versionName = req.query.version?.toString()
    ? req.query.version.toString()
    : "";
  let portalService = new PortalService(
    process.env.PROJECT_ID,
    process.env.REGION,
  );
  let namePieces = versionName.split("/");
  let apiName = "";
  if (namePieces.length > 5) apiName = namePieces[5] ?? "";
  if (apiName) {
    let apiResult = await portalService.getApi(apiName);
    if (apiResult && apiResult.data) result.api = apiResult.data;
  }
  let versionResult = await portalService.getApiVersion(versionName);
  if (versionResult && versionResult.data) {
    result.version = versionResult.data;
    if (result.version.deployments && result.version.deployments.length > 0) {
      // get deployment
      let deploymentResult = await portalService.getApiDeployment(
        result.version.deployments[0],
      );
      if (deploymentResult && deploymentResult.data) {
        result.deployment = deploymentResult.data;
      }
    }
  }
  let versionSpecResult: { data: any; error: Error } =
    await portalService.getApiVersionSpecs(versionName);
  if (
    versionSpecResult.data &&
    versionSpecResult.data.specs &&
    versionSpecResult.data.specs.length &&
    versionSpecResult.data.specs.length > 0
  ) {
    let specResult: { data: ApiHubApiVersionSpecContents; error: Error } =
      await portalService.getApiVersionSpecContents(
        versionSpecResult.data.specs[0]["name"],
      );

    if (specResult.data) {
      result.spec = specResult.data;
    }
  }

  if (result.version) res.send(result);
  else res.status(404).send("Spec not found");
});

app.post("/users", async (req, res) => {
  let errorCode = 0;

  let portalService = new PortalService(
    process.env.PROJECT_ID,
    process.env.REGION,
  );
  let user = req.body;
  let result = await portalService.createDeveloper(user);

  if (result.error) errorCode = result.error.code;

  if (errorCode) {
    res.status(errorCode).send("There was an error creating the user.");
  } else res.send(req.body);
});

app.get("/users/:email/apps", async (req, res) => {
  let email = req.params.email;
  let portalService = new PortalService(
    process.env.PROJECT_ID,
    process.env.REGION,
  );

  let apps = await portalService.getApps(email);
  if (apps.error) res.status(apps.error.code).send(apps.error.message);
  else res.status(200).send(JSON.stringify(apps.data));
});

app.post("/users/:email/apps", async (req, res) => {
  let email = req.params.email;
  let appName = req.body.name;
  let products = req.body.products;
  let portalService = new PortalService(
    process.env.PROJECT_ID,
    process.env.REGION,
  );

  let app = await portalService.createApp(email, appName);
  if (app.error) res.status(app.error.code).send(app.error.message);
  else res.status(200).send(JSON.stringify(app.data));
});

app.delete("/users/:email/apps/:appName", async (req, res) => {
  let email = req.params.email;
  let appName = req.params.appName;
  let portalService = new PortalService(
    process.env.PROJECT_ID,
    process.env.REGION,
  );

  let app = await portalService.deleteApp(email, appName);
  if (app.error) res.status(app.error.code).send(app.error.message);
  else res.status(200).send(JSON.stringify(app.data));
});

app.get("/products", async (req, res) => {
  let portalService = new PortalService(
    process.env.PROJECT_ID,
    process.env.REGION,
  );

  let productData = await portalService.getProducts();
  if (productData.error)
    res.status(productData.error.code).send(productData.error.message);
  else res.status(200).send(JSON.stringify(productData.data.apiProduct));
});

app.put(
  "/users/:email/apps/:appName/keys/:keyName/products/:productName",
  async (req, res) => {
    let email = req.params.email;
    let appName = req.params.appName;
    let keyName = req.params.keyName;
    let productName = req.params.productName;
    let portalService = new PortalService(
      process.env.PROJECT_ID,
      process.env.REGION,
    );

    let apps = await portalService.addAppKeyProducts(email, appName, keyName, [
      productName,
    ]);
    if (apps.error) res.status(apps.error.code).send(apps.error.message);
    else res.status(200).send(JSON.stringify(apps.data));
  },
);

app.post("/user/mcp", mcpUserService.mcppost);
app.get("/user/mcp", mcpUserService.handleSessionRequest);
app.delete("/user/mcp", mcpUserService.handleSessionRequest);

app.delete(
  "/users/:email/apps/:appName/keys/:keyName/products/:productName",
  async (req, res) => {
    let email = req.params.email;
    let appName = req.params.appName;
    let keyName = req.params.keyName;
    let productName = req.params.productName;
    let portalService = new PortalService(
      process.env.PROJECT_ID,
      process.env.REGION,
    );

    let apps = await portalService.removeAppKeyProduct(
      email,
      appName,
      keyName,
      productName,
    );
    if (apps.error) res.status(apps.error.code).send(apps.error.message);
    else res.status(200).send(JSON.stringify(apps.data));
  },
);

async function loadCache(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    let portalService = new PortalService(
      process.env.PROJECT_ID,
      process.env.REGION,
    );
    let projectApis = await portalService.getApis(
      "target_user.enum_values.values.display_name:Public",
    );
    if (projectApis.data && projectApis.data.length > 0) {
      cache.apis = projectApis.data;

      for (let api of cache.apis) {
        let versions = await portalService.getApiVersions(api.name);
        if (versions && versions.data && versions.data.length > 0)
          cache.versions = cache.versions.concat(versions.data);
      }
    }

    resolve(true);
  });
}

app.listen("8080", () => {
  console.log(`agentic-portal listening on port 8080`);
});
