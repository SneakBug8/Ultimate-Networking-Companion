import { User } from "./User";
import { UserToken } from "./UserToken";

class WebAuthServiceClass {
    public chatId: number | undefined;

    public async TryAuthToken(token: string): Promise<User | null>
    {
        const tokenentry = await UserToken.GetByToken(token);
        if (tokenentry) {
            const userentry = await User.GetById(tokenentry.UserId);

            if (userentry) {
                return userentry;
            }
        }
        return null;
    }
}

export const WebAuthService = new WebAuthServiceClass();
