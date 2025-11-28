import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import UserModel from '../models/UserModel.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from '../utils/jwtUtils.js';

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.OAUTH_CALLBACK_URL}/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 사용자 정보에서 이메일 찾기
        const email = profile.emails?.[0]?.value || null;
        
        // 기존 사용자인지 확인
        let user = await UserModel.findByEmail(email);
        
        if (!user) {
          // 신규 사용자 생성
          user = await UserModel.create({
            username: profile.displayName || profile.username,
            email: email,
            password: null // OAuth 사용자는 비밀번호 없음
          });
        }
        
        // JWT 토큰 생성
        const jwtAccessToken = generateAccessToken(user);
        const jwtRefreshToken = generateRefreshToken(user);
        
        // Refresh 토큰 저장
        await storeRefreshToken(user.userId, jwtRefreshToken);
        
        // 사용자 정보와 토큰을 함께 반환
        return done(null, { ...user, accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.OAUTH_CALLBACK_URL}/github/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub에서 이메일 정보가 없을 수 있으므로 확인
        const email = profile.emails?.[0]?.value || `github_${profile.id}@example.com`;
        
        // 기존 사용자인지 확인
        let user = await UserModel.findByEmail(email);
        
        if (!user) {
          // 신규 사용자 생성
          user = await UserModel.create({
            username: profile.username || profile.displayName,
            email: email,
            password: null // OAuth 사용자는 비밀번호 없음
          });
        }
        
        // JWT 토큰 생성
        const jwtAccessToken = generateAccessToken(user);
        const jwtRefreshToken = generateRefreshToken(user);
        
        // Refresh 토큰 저장
        await storeRefreshToken(user.userId, jwtRefreshToken);
        
        // 사용자 정보와 토큰을 함께 반환
        return done(null, { ...user, accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// 세션 직렬화 및 역직렬화
passport.serializeUser((user, done) => {
  done(null, user.userId);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await UserModel.findById(userId);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;