import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createInterviewAppClient(
  projectId: pulumi.Input<string>,
  region: pulumi.Input<string>,
  runApi: gcp.projects.Service,
  artifactregistryApi: gcp.projects.Service
) {
  const config = new pulumi.Config();
  const clientImageTag = config.get("client-image-tag") || "latest";
  const registryUrl = pulumi.interpolate`${region}-docker.pkg.dev/${projectId}/registry0-shared`;
  const clientImage = pulumi.interpolate`${registryUrl}/interview-client:${clientImageTag}`;
  const revisionHint = String(Date.now());

  const service = new gcp.cloudrunv2.Service(
    "interview-app-client",
    {
      name: "interview-app-client",
      project: projectId,
      location: region,
      ingress: "INGRESS_TRAFFIC_ALL",
      labels: { "pulumi-revision": revisionHint },
      template: {
        containers: [
          {
            image: clientImage,
            ports: { containerPort: 80 },
            envs: [
              {
                name: "VITE_GOOGLE_CLIENT_ID",
                value: config.require("VITE_GOOGLE_CLIENT_ID"),
              },
            ],
          },
        ],
        scaling: { minInstanceCount: 1, maxInstanceCount: 10 },
      },
    },
    { dependsOn: [runApi, artifactregistryApi] }
  );

  // new gcp.cloudrunv2.ServiceIamMember(
  //   "interview-app-client-public",
  //   {
  //     project: projectId,
  //     location: region,
  //     name: service.name,
  //     role: "roles/run.invoker",
  //     member: "allUsers",
  //   },
  //   { dependsOn: [service] }
  // );

  return {
    service,
    serviceUrl: service.uri,
    serviceName: service.name,
  };
}
