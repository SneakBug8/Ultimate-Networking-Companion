import archiver = require("archiver");
import * as fs from "fs";
import * as path from "path";
import { Config } from "../config";
import { Server, setWaitingForValue } from "..";
import TelegramBot = require("node-telegram-bot-api");
import { BackupData } from "./BackupData";
import { MessageWrapper } from "../MessageWrapper";
import { BotAPI } from "../api/bot";
import { Sleep } from "../util/Sleep";
import { IntervalsExecution } from "../util/IntervalsExecution";
import { Scheduler } from "../util/Scheduler";
import { Client } from "basic-ftp"

const backuppath = path.resolve(Config.dataPath(), "../backup.zip");

let data = new BackupData();

const datafilepath = path.resolve(Config.dataPath(), "backup.json");
const daysbetweenbackups = 2;
const whattimeofaday = 19;

export async function InitBackup() {
  if (fs.existsSync(datafilepath)) {
    const file = fs.readFileSync(datafilepath);

    data = JSON.parse(file.toString()) as BackupData;

    console.log(`Read backup data.`);
  }
  else {
    console.log(`Created new datafile for backups.`);
    BackupSave();
  }

  Scheduler.Schedule(20, CreateBackup);
}

export async function BackupSave() {
  const tdata = JSON.stringify(data);
  fs.writeFileSync(datafilepath, tdata);
}

export async function BackupCycle() {
  /*const now = new Date(Date.now());
  const executed = await IntervalsExecution.Executed("backup");

  if (!executed && Math.abs(data.lastSend - now.getDate()) > daysbetweenbackups && now.getHours() >= whattimeofaday) {
    console.log(now + " backup time");
    CreateBackup();
    IntervalsExecution.Execute("backup");
  }*/
}

// Scheduled with scheduler
async function CreateBackup(force: boolean = false) {
  try {
    const now = new Date(Date.now());

    if (Math.abs(data.lastSend - now.getDate()) <= daysbetweenbackups && !force) {
      return;
    }

    console.log("[Backup] Starting backup sequence");

    data.lastSend = now.getDate();

    await MakeBackupArchive();

    Server.SendMessage("Backup archive created");

    await Sleep(1000);

    /*BotAPI.sendDocument(Config.DefaultChat, fs.createReadStream(backuppath), {
      disable_notification: true
    });*/

    await PublishBackupArchive(true);

    console.log("[Backup] Backup archive uploaded");

    Server.SendMessage("Backup archive uploaded");

    BackupSave();
    return "Backup archive created and uploaded";
  }
  catch (e) {
    return e + "";
  }
}

async function MakeBackupArchive() {
  const output = fs.createWriteStream(backuppath);
  const archive = archiver("zip");

  output.on("close", () => {
    console.log(archive.pointer() + " total bytes");
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  // append files from a directories into the archive
  archive.directory(Config.dataPath(), "data");
  archive.directory(path.resolve(Config.dataPath(), "../diary"), "diary");

  await archive.finalize();
}

async function PublishBackupArchive(verbose: boolean = false) {
  var ready = false;
  try {
    const c = new Client();

    await c.access({
      host: process.env["backup_ftphost"],
      user: process.env["backup_ftpuser"],
      password: process.env["backup_ftppassword"],
    });

    c.ftp.verbose = true;
    c.trackProgress(info => {
      console.log("Transferred Overall", info.bytesOverall)
    })

    const destpath = process.env["backup_ftppath"] + "ultimatenetworking.zip";
    const fragments = path.dirname(destpath);

    const input = fs.createReadStream(backuppath);

    await c.ensureDir(fragments);
    await c.uploadFrom(input, destpath);

    Server.SendMessage(`Uploaded ${backuppath} to ${destpath}`)
      .then((x) => x.deleteAfterTime(1));
  }
  catch (e) {
    console.error(e);
    Server.SendMessage(JSON.stringify(e) || "null");
  }
}

export async function ProcessBackup(message: MessageWrapper) {
  if (message.checkRegex(/\/backup force/)) {
    message.reply("Initiating backup sequence");
    message.reply(await CreateBackup(true) + "");
    return;
  }
  return false;
}
