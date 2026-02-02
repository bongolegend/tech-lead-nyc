import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createInterviewAppServer(
  projectId: pulumi.Input<string>,
  region: pulumi.Input<string>,
  runApi: gcp.projects.Service,
  artifactregistryApi: gcp.projects.Service,
  dbConnectionName: pulumi.Output<string>,
  dbPublicIp: pulumi.Output<string>
) {
  const config = new pulumi.Config();
  const dbUser = config.requireSecret("db-user");
  const dbPassword = config.requireSecret("db-password");

  const registryUrl = pulumi.interpolate`${region}-docker.pkg.dev/${projectId}/registry0-shared`;

  const service = new gcp.cloudrunv2.Service(
    "interview-app-server",
    {
      name: "interview-app-server",
      project: projectId,
      location: region,
      ingress: "INGRESS_TRAFFIC_ALL",
      template: {
        containers: [
          {
            image: "us-east1-docker.pkg.dev/tech-lead-nyc/registry0-shared/interview-app-server:oauth",          
            ports: { containerPort: 8080 },
            envs: [
              { name: "DB_HOST", value: dbPublicIp },
              { name: "DB_PORT", value: "5432" },
              { name: "DB_USER", value: dbUser },
              { name: "DB_PASSWORD", value: dbPassword },
              { name: "DB_NAME", value: "main" },
              {
                name: "DATABASE_URL",
                value: pulumi.interpolate`postgresql://${dbUser}:${dbPassword}@${dbPublicIp}:5432/main`,
              },
              { name: "GOOGLE_CLIENT_ID", value: "REMOVED_GOOGLE_CLIENT_ID" },
              { name: "GOOGLE_CLIENT_SECRET", value: "REMOVED_GOOGLE_CLIENT_SECRET" },            
            ],            
          },
        ],
        scaling: { minInstanceCount: 1, maxInstanceCount: 10 },
        timeout: "300s",
      },
    },
    { dependsOn: [runApi, artifactregistryApi] }
  );

  // new gcp.cloudrunv2.ServiceIamMember(
  //   "interview-app-server-public",
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
