export default class userSession {
  static logedInUsers: userSession[] = [];
  sessionUserName: string;
  sessionToken: string;
  constructor(sessionUserName:string, sessionToken: string) {
    this.sessionUserName = sessionUserName;
    this.sessionToken = sessionToken;
  }

  static findUserByUserName(userName:string): userSession | null {
    for(const user of this.logedInUsers) {
      if(user.sessionUserName === userName) {
        return user;
      }
    }
    return null;
  }

  static verifyUserSession(sessionUserName: string, sessionToken: string): boolean {
    const userFound = this.logedInUsers.find(user => 
      user.sessionUserName === sessionUserName &&
      user.sessionToken === sessionToken
    );
    return userFound != null;
  }
}
