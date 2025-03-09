# Self-hosted Ultimate Networking Companion

A web application and a Telegram bot to help you maintain your networking via contacts list and notifications.

Imagine that you are the head of a department in a large IT company. You attend conferences twice a month, regularly conduct interviews and poach experienced specialists from other companies. Your Linkedin profile has more than 1000 connections, and you can’t keep up with your Facebook feed.

As a teamlead nowadays and a journalist in the past, I know this pain firsthand. What if you had a single solution for tracking all activity with your work contacts? That’s what my project is about. Now you won’t forget where you met Bill Gates and which of your friends to invite to a new position.

  - Do you want to keep in touch with a contact? Create an active contact and it will appear in the pool of offers for communication.
  - Do you just want to remember a person? Create a contact and deactivate it.
  - Do you want to remember the details of a friend? Write everything down in the contact description.
  - Mark your initiated, successful and offline communications. Remember where you met and what you did in the communication descriptions.

[Ask for support in Discord server](https://discord.gg/SthVvfQZj5). [Subscribe to my Telegram channel](https://t.me/sb8blog)

## User Stories

- User can create contacts
- User can modify contacts. When user updates contact's name all links to communications are persisted.
- User can deactivate contacts. The system will no longer suggest it to the user.
- System suggests a contact to communicate with daily. That's a Networking Communication. It's default status is Sent.
- User can move the NetworkingCommunication to Initiated status and then to Done status when the recipient has responded.
- When User changes the NetworkingCommunication status with a bot - bot chooses the most recent communication to update.
- On Friday system suggests an extended list of contacts for weekends without creating NetworkingCommunication to not spoil the stats.