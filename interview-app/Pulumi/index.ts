import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { createInterviewAppClient } from "./cloudrun/interview-app-client";
import { createInterviewAppServer } from "./cloudrun/interview-app-server";
import { createCloudSqlInstance } from "./cloudsql/db0";

const config = new pulumi.Config();
const environment = config.require("environment");
const region = config.require("region");
const projectId = config.require("gcp-project");

// APIs
const artifactregistryApi = new gcp.projects.Service("artifactregistry-api", {
  project: projectId,
  service: "artifactregistry.googleapis.com",
});

const runApi = new gcp.projects.Service("run-api", {
  project: projectId,
  service: "run.googleapis.com",
});

const sqlApi = new gcp.projects.Service("sql-api", {
  project: projectId,
  service: "sqladmin.googleapis.com",
});

// Cloud SQL FIRST
const cloudSqlResources = createCloudSqlInstance(projectId, region);

// Server FIRST (needs DB)
const serverResources = createInterviewAppServer(
  projectId,
  region,
  runApi,
  artifactregistryApi,
  cloudSqlResources.connectionName,
  cloudSqlResources.publicIp
);

// Client SECOND
const clientResources = createInterviewAppClient(
  projectId,
  region,
  runApi,
  artifactregistryApi
);

// Exports
export const clientServiceUrl = clientResources.serviceUrl;
export const serverServiceUrl = serverResources.serviceUrl;
export const dbConnectionName = cloudSqlResources.connectionName;
