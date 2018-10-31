/**
 * Daily mongodb backup
 */
import { registerSetting, getSetting } from "meteor/vulcan:core";
import registerCron from "./registerCron";
import { spawn, exec, execSync } from "child_process";
import fs from "fs";
const AWS = require("aws-sdk");

registerSetting(
  "cron.mongoBackup.enable",
  false,
  "Automatically backup the database"
);
registerSetting(
  "cron.mongoBackup.aws.bucket",
  "meteor-app",
  "AWS S3 bucket name for storage"
);
registerSetting("AWS.REGION", undefined, "AWS Region");
registerSetting(
  "cron.mongoBackup.email",
  undefined,
  "Email address to notify on database update"
);

// TODO: register settings in Vulcan
// TODO: allow activation, deactivation of MongoDB glacier storage

const job = () => {
  try {
    console.log("*** Backup mongo database");
    // STEP 1: generate the dump and zip it
    //const mongoUrl = process.env.MONGO_URL;
    const folderName = `mongodump-${execSync('printf `date +"%m-%d-%y"`')}`;
    const savePath = `/tmp/${folderName}`;
    const mongodumpArgs = `--out ${savePath}`;
    const zipFileName = `${folderName}.zip`;
    const zipPath = `/tmp/${zipFileName}`;
    const zipArgs = `-r ${zipPath} ${folderName}`;
    const mongodumpCmd = `mongodump ${mongodumpArgs}`;
    // we can't use zip with absolute path (otherwise folder structure is messay)
    // we must cd to the correct folder instead
    const zipCmd = `cd /tmp && zip ${zipArgs}`;
    const script = [mongodumpCmd, zipCmd].join(" && ");
    const userEmail = getSetting("cron.mongoBackup.email");
    // Using spawn instead of exec:
    // mongodump.stdout.on("data", function(data) {
    //   console.log("stdout: " + data);
    // });
    // mongodump.stderr.on("data", function(data) {
    //   console.log("stderr: " + data);
    // });
    // mongodump.on("exit", function(code) {
    //
    //  console.log("mongodump exited with code " + code);
    // ...
    // })

    const onDumpExec = error => {
      if (error) {
        console.log("*** Could not generate mongodump. Error:", error);
      } else {
        // STEP 2: push the dump to AWS S3
        // @see https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/glacier-example-uploadrchive.html
        fs.readFile(zipPath, onFileRead);
      }
    };
    const mongodumpProcess = exec(script, null, onDumpExec);
    const onFileRead = async (err, data) => {
      if (err) {
        console.log("*** Could not open MongoDB dump file", err);
        return;
      }
      //
      saveToS3(data, (err, data) => {
        if (err) {
          console.log("*** Could not send MongoDB dump to AWS S3", err);
        } else {
          console.log("*** Successfully backed up MongoDB Data");
        }
        //  // STEP 3: email on success OR failure
        //  // TODO
      });
    };
    const saveToS3 = (data, cb) => {
      // setup AWS
      AWS.config.update({
        region: getSetting("AWS.REGION")
      });
      const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
      const base64data = new Buffer(data, "binary");
      const params = {
        Bucket: getSetting("cron.mongoBackup.aws.bucket"),
        Key: `mongo-backups/${zipFileName}`,
        Body: base64data
      };
      console.log(
        "*** Sending MongoDB dump to S3...",
        params.Bucket,
        params.Key
      );
      s3.putObject(params, (err, data) => {
        cb(err, data);
      });
    };
  } catch (err) {
    console.log("*** ERROR: could not backup mongo database", err);
    // TODO: email error
  }
};

//if (process.env === "development") {
console.log("Running MongoDB job");
job();
//}
registerCron({
  frequencySettingName: "cron.mongoBackup.frequency",
  timeSettingName: "cron.mongoBackup.time",
  name: "scheduleMongoBackup",
  enable: getSetting("cron.mongoBackup.enable"),
  job
});
