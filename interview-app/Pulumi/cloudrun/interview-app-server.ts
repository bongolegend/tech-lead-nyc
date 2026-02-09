import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createInterviewAppServer(
  projectId: pulumi.Input<string>,
  region: pulumi.Input<string>,
  runApi: gcp.projects.Service,
  artifactregistryApi: gcp.projects.Service,
  dbConnectionName: pulumi.Input<string>
) {
  const config = new pulumi.Config();

  // DB secrets
  const dbUser = config.requireSecret("db-user");
  const dbPassword = config.requireSecret("db-password");

  // OAuth secrets (THIS IS THE IMPORTANT PART)
  const googleClientId = config.requireSecret("google-client-id");
  const googleClientSecret = config.requireSecret("google-client-secret");

  const jwtSecret = config.requireSecret("jwt-secret");

  // Image tag from config so you can deploy a new build: build & push, then
  // pulumi config set server-image-tag <tag> (e.g. latest or a digest) and pulumi up
  const serverImageTag = config.get("server-image-tag") || "latest";
  const registryUrl = pulumi.interpolate`${region}-docker.pkg.dev/${projectId}/registry0-shared`;
  const serverImage = pulumi.interpolate`${registryUrl}/interview-server:${serverImageTag}`;

  // Changing label forces a new revision so Cloud Run pulls the image (e.g. current :latest)
  const revisionHint = String(Date.now());

  const service = new gcp.cloudrunv2.Service(
    "interview-app-server",
    {
      name: "interview-app-server",
      project: projectId,
      location: region,
      ingress: "INGRESS_TRAFFIC_ALL",
      labels: { "pulumi-revision": revisionHint },

      template: {
        containers: [
          {
            image: serverImage,
            ports: { containerPort: 8080 },

            envs: [
              { name: "DB_USER", value: dbUser },
              { name: "DB_PASSWORD", value: dbPassword },
              { name: "DB_NAME", value: "main" },

              {
                name: "DATABASE_URL",
                value: pulumi.interpolate`postgresql://${dbUser}:${dbPassword}@localhost:5432/main?host=/cloudsql/${dbConnectionName}`,
              },
              { 
                name: "API_URL",
                value: "https://interview-app-server-831130136724.us-east1.run.app",
              },
              
              { name: "GOOGLE_CLIENT_ID", value: googleClientId },
              { name: "GOOGLE_CLIENT_SECRET", value: googleClientSecret },

              {
                name: "GOOGLE_CALLBACK_URL",
                value:
                  "https://interview-app-server-831130136724.us-east1.run.app/auth/google/callback",
              },

              {
                name: "FRONTEND_URL",
                value:
                  "https://interview-app-client-z6tjwkruwq-ue.a.run.app",
              },
              { name: "VITE_GOOGLE_CLIENT_ID", value: config.require("VITE_GOOGLE_CLIENT_ID") },
              { name: "JWT_SECRET", value: jwtSecret },
            ],

            volumeMounts: [
              {
                name: "cloudsql",
                mountPath: "/cloudsql",
              },
            ],
          },
        ],

        volumes: [
          {
            name: "cloudsql",
            cloudSqlInstance: {
              instances: [dbConnectionName],
            },
          },
        ],

        scaling: { minInstanceCount: 1, maxInstanceCount: 10 },
        timeout: "300s",
      },
    },
    { dependsOn: [runApi, artifactregistryApi] }
  );

  return {
    service,
    serviceUrl: service.uri,
    serviceName: service.name,
  };
}
