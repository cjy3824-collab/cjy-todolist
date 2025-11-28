import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

// Google OAuth 시작
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth 콜백
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // 인증 성공 후 JWT 토큰을 프론트엔드로 전달
    const { accessToken, refreshToken } = req.user;
    
    // 프론트엔드로 리다이렉트하면서 토큰 전달 (쿼리 파라미터로)
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }
);

// GitHub OAuth 시작
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub OAuth 콜백
router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    // 인증 성공 후 JWT 토큰을 프론트엔드로 전달
    const { accessToken, refreshToken } = req.user;
    
    // 프론트엔드로 리다이렉트하면서 토큰 전달 (쿼리 파라미터로)
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }
);

export default router;