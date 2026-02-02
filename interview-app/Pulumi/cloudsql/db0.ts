import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createCloudSqlInstance(
  projectId: pulumi.Input<string>,
  region: pulumi.Input<string>
) {
  const config = new pulumi.Config();

  const dbUser = "appuser";
  const dbPassword = config.requireSecret("db-password");

  const instance = new gcp.sql.DatabaseInstance("db0", {
    name: "db0",
    project: projectId,
    region,
    databaseVersion: "POSTGRES_16",
    settings: {
      tier: "db-perf-optimized-N-2",
      edition: "ENTERPRISE_PLUS",
      ipConfiguration: { ipv4Enabled: true },
      deletionProtectionEnabled: true,
    },    
  });

  new gcp.sql.User("db0-user", {
    name: dbUser,
    instance: instance.name,
    password: dbPassword,
    project: projectId,
  });

  new gcp.sql.Database("db0-main", {
    name: "main",
    instance: instance.name,
    project: projectId,
  });

  return {
    instance,
    connectionName: instance.connectionName,
    publicIp: instance.publicIpAddress,
    dbUser,
  };
}
