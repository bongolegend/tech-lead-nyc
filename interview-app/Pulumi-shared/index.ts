import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();

const project = config.require("gcp-project");
const region = config.require("region");

const repo = new gcp.artifactregistry.Repository("registry0-shared", {
  location: region,
  repositoryId: "registry0-shared",
  description: "Shared Docker images",
  format: "DOCKER",
  project,
});

export const registryUrl = pulumi.interpolate`${region}-docker.pkg.dev/${project}/${repo.repositoryId}`;
