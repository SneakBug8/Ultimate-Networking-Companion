import { Config } from "../config";
import { User } from "./User";

export enum TgAuthServiceResponses {
    NewUser,
    ExistingUser
}

class TgAuthServiceClass {
    public chatId: number | undefined;

    public async EnsureUser(chatId: number): Promise<{code: TgAuthServiceResponses, user: User}>
    {
        const user = await User.GetByChat(chatId);

        if (user) {
            return {code: TgAuthServiceResponses.ExistingUser, user};
        }
        else {
            const user = new User();
            user.chatId = chatId;
            await User.Insert(user);
            const nuser = await User.GetByChat(chatId);
            if (nuser) {
                user.Id = nuser.Id;
                return { code: TgAuthServiceResponses.NewUser, user };
            }
            
            throw new Error("Couldn't create new user");
        }
    }

    public ChatHasAdminRights(chatId: number): boolean {
        return chatId == Config.AdminChat;
    }
}

export const TgAuthService = new TgAuthServiceClass();
