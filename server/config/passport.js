const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// 사용자 세션 직렬화
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 사용자 세션 역직렬화
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth 전략 (환경 변수가 설정된 경우에만)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email']
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 기존 Google 계정 사용자 찾기
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // 기존 사용자
          return done(null, user);
        }

        // 이메일로 기존 사용자 찾기
        const email = profile.emails[0].value;
        user = await User.findOne({ email });

        if (user) {
          // 기존 이메일 사용자에 Google ID 연결
          user.googleId = profile.id;
          if (!user.avatar && profile.photos && profile.photos.length > 0) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // 새 사용자 생성
        const username = profile.emails[0].value.split('@')[0] + '_' + Date.now();
        
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          username,
          name: profile.displayName,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
          // OAuth 사용자는 비밀번호 불필요
        });

        await user.save();
        done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);
} else {
  console.log('⚠️  Google OAuth 설정이 없습니다. Google 로그인을 사용하려면 .env에 GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 설정하세요.');
}

// GitHub OAuth 전략 (환경 변수가 설정된 경우에만)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
        scope: ['user:email']
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 기존 GitHub 계정 사용자 찾기
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // 기존 사용자
          return done(null, user);
        }

        // 이메일로 기존 사용자 찾기
        const email = profile.emails && profile.emails.length > 0 
          ? profile.emails[0].value 
          : `${profile.username}@github.com`;
        
        user = await User.findOne({ email });

        if (user) {
          // 기존 이메일 사용자에 GitHub ID 연결
          user.githubId = profile.id;
          if (!user.avatar && profile.photos && profile.photos.length > 0) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // 새 사용자 생성
        const username = profile.username || profile.displayName.replace(/\s/g, '_') + '_' + Date.now();
        
        user = new User({
          githubId: profile.id,
          email,
          username,
          name: profile.displayName || profile.username,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
          bio: profile._json.bio || undefined
        });

        await user.save();
        done(null, user);
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        done(error, null);
      }
    }
  )
);
} else {
  console.log('⚠️  GitHub OAuth 설정이 없습니다. GitHub 로그인을 사용하려면 .env에 GITHUB_CLIENT_ID와 GITHUB_CLIENT_SECRET을 설정하세요.');
}

module.exports = passport;
