import * as dotenv from "dotenv";
dotenv.config();

import TelegramBot = require("node-telegram-bot-api");
import { BotAPI } from "./api/bot";
import { MessageWrapper } from "./MessageWrapper";
import { TgAuthService, TgAuthServiceResponses } from "./users/TgAuthService";
import { NetworkingService } from "./networking/Networking";
import { Config } from "./config";
import { InitBackup, ProcessBackup } from "./backup/BackupService";
import { Sleep } from "./util/Sleep";
import { NetworkingWeb as NetworkingWebService } from "./networking/NetworkingWebService";
import { Scheduler } from "./util/Scheduler";
import { ErrorLogger } from "./util/ErrorLogger";
import * as EventEmitter from "events";
import { SyncEvent } from "./util/SyncEvent";

let waitingCallback: ((message: MessageWrapper) => any) | null = null;

export function setWaitingForValue(message: string, callback: (message: MessageWrapper) => any)
{
    Server.SendMessage(message, [[{ text: "/exit" }]]);
    waitingCallback = callback;
}

export function setWaitingForValuePure(callback: (message: MessageWrapper) => any)
{
    waitingCallback = callback;
}

export function defaultKeyboard(): TelegramBot.KeyboardButton[][]
{
    return [
        [{ text: "/networking" },],
    ];
}

class App
{
    private bot: TelegramBot;
    private readingMessage: boolean = false;
    public loaded = false;

    public MessageEvent = new SyncEvent();
    public IntervalEvent = new SyncEvent();

    public async WaitForLoad()
    {
        while (!this.loaded) {
            await Sleep(500);
        }
    }

    public constructor()
    {
        this.bot = BotAPI;

        NetworkingService.Init();
        InitBackup();

        // Web modules
        NetworkingWebService.Init();

        this.bot.on("text", async (msg) =>
        {
            while (this.readingMessage) {
                await Sleep(100);
            }
            this.readingMessage = true;
            await this.messageHandler(msg);
            this.readingMessage = false;

        });

        setInterval(this.Intervals.bind(this), 15 * 60 * 1000);
    }

    public async Intervals()
    {
        const intervals = [
            Scheduler.Interval.bind(Scheduler),
        ];

        for (const listener of intervals) {
            try {
                const r = await listener();
            }
            catch (e) {
                ErrorLogger.Log(e);
            }
        }

        this.IntervalEvent.Emit();
    }

    private async messageHandler(msg: TelegramBot.Message)
    {
        try {
            const message = new MessageWrapper(msg);
            const time = message.getPrintableTime();
            console.log(`[${time}] ${msg.text}`);

            if (!msg.text) {
                return;
            }

            if (message.checkRegex(/^\/id/)) {
                message.reply(`Current chat id: ${message.message.chat.id}`); return;
            }

            const user = await TgAuthService.EnsureUser(message.message.chat.id);

            if (user.code == TgAuthServiceResponses.NewUser) {
                message.reply(`Welcome to Ultimate Networking Companion bot.`);
            }

            if (waitingCallback) {
                if (message.message.text === "/exit") {
                    waitingCallback = null; return;
                }

                const callback = waitingCallback;
                waitingCallback = null;
                await callback.call(this, message);

                return true;
            }

            if (message.checkRegex(/\/exit/)) {
                return message.reply("Main menu.");
            }

            const listeners = [
                NetworkingService.Process.bind(NetworkingService),
                ProcessBackup,
            ];

            for (const listener of listeners) {
                const r = await listener(message);
                if (r !== false) {
                    return;
                }
            }

            const d = await this.MessageEvent.Emit(message);
            if (d) {
                return;
            }

            message.reply("Unknown command");
        }
        catch (e) {
            Server.SendMessage(e + "");
        }
    }

    public async SendMessage(text: string, keyboard: TelegramBot.KeyboardButton[][] | null = null, parse_mode: TelegramBot.ParseMode = "Markdown")
    {
        try {
            console.log(text);
            const msg = await BotAPI.sendMessage(Config.AdminChat, text || "null", {
                parse_mode,
                reply_markup: {
                    keyboard: keyboard || defaultKeyboard(),
                }
            });
            return new MessageWrapper(msg);
        }
        catch (e) {
            console.error(JSON.parse(JSON.stringify(e)));
            const msg = await BotAPI.sendMessage(Config.AdminChat, JSON.stringify(e) || "Error: null", {
                parse_mode,
                reply_markup: {
                    keyboard: keyboard || defaultKeyboard(),
                }
            });
            return new MessageWrapper(msg);
        }
    }
}

export const Server = new App();

console.log("Bot started");

if (!Config.isTest() && !Config.isDev()) {
    Server.SendMessage("Bot restarted");
}
Server.loaded = true;
