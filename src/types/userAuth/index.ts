enum UserGrade {
  Master = 'M',
  Admin = 'A',
  User = 'U',
}

interface UserInfo {
  grade: UserGrade;
  email: string;
  username: string;
}

interface UserInfoResponseType extends UserInfo {
  member_id: string; // 서버 사용 용도
}

interface LoginRequestType {
  email: string;
  password: string;
}

interface LoginResponseType extends UserInfoResponseType {
  access_token: string;
}

export type { UserGrade, LoginRequestType, LoginResponseType, UserInfo, UserInfoResponseType };
