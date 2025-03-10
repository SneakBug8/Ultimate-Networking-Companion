import { MIS_DT } from "../util/MIS_DT";
import { Scheduler } from "../util/Scheduler";
import { User } from "./User";
import { UserToken } from "./UserToken";
import { createHash } from 'node:crypto'

class WebAuthServiceClass {
    public chatId: number | undefined;

    public async Init() {
        Scheduler.Schedule(1, async () => {
            const tokens = await UserToken.GetTokens();
            for (const token of tokens) {
                await this.ReviewToken(token);
            }

            const users = await User.GetUsers();
            for (const user of users) {
                await this.IssueToken(user);
            }
        });
    }

    // Delete outdated tokens
    public async ReviewToken(token: UserToken) {
        const now = MIS_DT.GetExact();

        if (token.LIVEUNTIL < now) {
            UserToken.Delete(token.Id);
        }
    }

    // If user has no token, issue one
    public async IssueToken(user: User) {
        const now = MIS_DT.GetExact();

        const tokens = await UserToken.GetByUserID(user.Id);

        if (tokens.length == 0) {
            const newtoken = new UserToken();
            newtoken.userId = user.Id;
            newtoken.LIVEUNTIL = now + MIS_DT.GetDay() * 30;
            newtoken.token = createHash('sha512').update(
                Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString()).digest('hex');

            UserToken.Insert(newtoken);
        }
    }

    public async TryAuthToken(token: string): Promise<User | null> {
        console.log("User with token ", token)
        if (!token) {
            return null;
        }
        const tokenentry = await UserToken.GetByToken(token);
        const now = MIS_DT.GetExact();
        if (tokenentry && tokenentry.LIVEUNTIL > now) {
            const userentry = await User.GetById(tokenentry.userId);

            if (userentry) {
                // Update his token to serve longer
                tokenentry.LIVEUNTIL = now + MIS_DT.GetDay() * 10;
                UserToken.Update(tokenentry);
                return userentry;
            }
        }
        return null;
    }
}

export const WebAuthService = new WebAuthServiceClass();
