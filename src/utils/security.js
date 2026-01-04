/**
 * 보안 유틸리티 함수 모음
 */

// XSS 방지: HTML 태그 및 특수문자 이스케이프
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

// XSS 방지: 스크립트 태그 제거
export const removeScriptTags = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// SQL Injection 방지: 특수문자 검증 (localStorage 사용이지만 방어적 코딩)
export const validateInput = (input, maxLength = 1000) => {
  if (typeof input !== 'string') return false;
  
  // 길이 검증
  if (input.length > maxLength) return false;
  
  // 위험한 패턴 검사
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror 등
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }
  
  return true;
};

// 비밀번호 강도 검증
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`최소 ${minLength}자 이상이어야 합니다.`);
  }
  if (!hasUpperCase) {
    errors.push('대문자를 포함해야 합니다.');
  }
  if (!hasLowerCase) {
    errors.push('소문자를 포함해야 합니다.');
  }
  if (!hasNumbers) {
    errors.push('숫자를 포함해야 합니다.');
  }
  if (!hasSpecialChar) {
    errors.push('특수문자를 포함해야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    strength: calculatePasswordStrength(password)
  };
};

// 비밀번호 강도 계산
const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  if (strength <= 2) return '약함';
  if (strength <= 4) return '보통';
  return '강함';
};

// 이메일 형식 검증
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 사용자명 검증 (영문, 숫자, 언더스코어만 허용)
export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// 간단한 비밀번호 해싱 (실제 프로덕션에서는 bcrypt 등 사용 권장)
export const hashPassword = (password) => {
  // 실제로는 서버에서 bcrypt, scrypt 등을 사용해야 함
  // 여기서는 간단한 해시 시뮬레이션
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

// CSRF 토큰 생성 (간단한 버전)
export const generateCSRFToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// 세션 타임아웃 체크
export const isSessionExpired = (loginTime, timeoutMinutes = 60) => {
  if (!loginTime) return true;
  
  const now = new Date().getTime();
  const elapsed = now - loginTime;
  const timeoutMs = timeoutMinutes * 60 * 1000;
  
  return elapsed > timeoutMs;
};

// Rate Limiting (간단한 클라이언트 측 구현)
const rateLimitStore = {};

export const checkRateLimit = (action, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  
  if (!rateLimitStore[action]) {
    rateLimitStore[action] = [];
  }
  
  // 윈도우 시간 이전의 시도 제거
  rateLimitStore[action] = rateLimitStore[action].filter(
    timestamp => now - timestamp < windowMs
  );
  
  // 최대 시도 횟수 체크
  if (rateLimitStore[action].length >= maxAttempts) {
    return {
      allowed: false,
      retryAfter: windowMs - (now - rateLimitStore[action][0])
    };
  }
  
  // 현재 시도 기록
  rateLimitStore[action].push(now);
  
  return { allowed: true };
};

// 파일 업로드 검증
export const validateFileUpload = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSizeMB = 5) => {
  const errors = [];
  
  // 파일 타입 검증
  if (!allowedTypes.includes(file.type)) {
    errors.push(`허용되지 않는 파일 형식입니다. 허용: ${allowedTypes.join(', ')}`);
  }
  
  // 파일 크기 검증
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`파일 크기가 ${maxSizeMB}MB를 초과합니다.`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// 안전한 localStorage 사용
export const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      const sanitizedKey = sanitizeHTML(key);
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(sanitizedKey, stringValue);
      return true;
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
      return false;
    }
  },
  
  getItem: (key) => {
    try {
      const sanitizedKey = sanitizeHTML(key);
      return localStorage.getItem(sanitizedKey);
    } catch (error) {
      console.error('localStorage 읽기 실패:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      const sanitizedKey = sanitizeHTML(key);
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (error) {
      console.error('localStorage 삭제 실패:', error);
      return false;
    }
  }
};

// 콘텐츠 보안 정책 헤더 시뮬레이션 (메타 태그로 구현 가능)
export const getCSPDirectives = () => {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  };
};
