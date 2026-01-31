import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const project = gcp.config.project!;
const region = gcp.config.region || "us-central1";

const repo = new gcp.artifactregistry.Repository("interviewAppRepo", {
  format: "DOCKER",
  location: region,
  repositoryId: "interview-app",
});

const image = new docker.Image("interviewAppImage", {
  imageName: pulumi.interpolate`${region}-docker.pkg.dev/${project}/${repo.repositoryId}/interview-app:latest`,
  build: {
    context: "../../../apps/interview-app",
  },
});

export const imageUri = image.imageName;
