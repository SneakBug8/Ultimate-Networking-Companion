# Personal telegram bot

Small telegram bot to help me make some operations during a day, such as:
- Creating notes
- Publishing them to personal wiki
- Maintaining networking via contacts list and notifications
- Run multiple timers
- Calculate everything possible with JS
- Monitor what you are doing and for what time

All major config is included in `.env` and `src/config.ts`. FTP upload always uses basedir. You can make separate user with correct base folder for uploading to the right folder.

## Installation

Serve it as a regular Node.JS app: `npm start`.

Don't forget to rename `.env example` to `.env` and fill required variables. You can ignore ftp-related things if you won't use Publishing mechanisms.

## Usage

Default behaviour for the bot upon receiving message is to save it a note (optionally, create a file with current date and time). Other commands are:

  - `/id` - show chat id of current chat. Use that to configure allowed chatid's in `.env` file.

  - `/ping` - check whether bot is online
  - `/path` - show current filepath
  - `/reset` - reset current filepath
  - `/space` - insert big separator (horizontal line)
  - `/files` - list list of files by folders
  - `/file [name]` - set current filename (open or create a file)
  - `/log` or `/read` - read current file
  - `/logs` - read current file splitted by separators.
  - `/get [name]` - read another file
  - `/logs [name]` - read another file splitted by separators.
  - `/delete` - delete current file
  - `/delete [name]` - delete another file

  File slots allow use to remember last used files with short numbers and switch between them with one short command. For example, you can use slot #1 for todays notes - reseting it once a day and slot #2 for English vocabulary, which you will use for a long time.

  - `/slot [num]` - use file slot with number
  - `/slots` - log all recorded slots
  - `/slot reset` - reset file in current slot
  - `/slot reset [num]` - reset numbered slot
  - `/slots reset` - reset all slots

  - `/publish` - send file to remote FTP server
  - `/load` - download file from remote FTP server

  - `/timer start` - start timer
  - `/timer stop` - stop latest timer
  - `/timer clear` - stop all timers

  - `/eval [code]` - eval arbitrary JS code. Can be used as a simple calculator

  - `/networking add [name]` - add contact to your networking list
  - `/networking remove [name]` - disable contact from futher suggestions for networking
  - `/networking done [name]` - mark interaction with [name] as done for the statistics. If used without name - uses last person suggested for interaction.
  - `/networking list` - list all your contacts. List is sorted by total numbers this person has been suggested
  - `/networking force` - run networking script right now

  - `/learning start []` - start learning/doing smth
  - `/learning stop` or `/learning end` - stop learning/doing
  - `/learning now` - what is recorded now
  - `/learning stats` - statistics over what've you done in hours
  - `/learning list` - all notifications for you to do smth based on day&hour. Can be edited only directly in `leaning.json` file