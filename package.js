Package.describe({
  name: "vulcan:mongo-backup"
});

Package.onUse(api => {
  api.use(["vulcan:core", "percolatestudio:synced-cron"]);

  api.mainModule("lib/server/main.js", "server");
  api.mainModule("lib/client/main.js", "client");
});
