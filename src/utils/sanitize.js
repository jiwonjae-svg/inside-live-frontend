// XSS 방지를 위한 HTML escape 유틸리티
export const escapeHtml = (text) => {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// 텍스트를 안전하게 표시하기 위한 컴포넌트
export const SafeText = ({ text, className, style }) => {
  if (!text) return null;
  
  // React는 기본적으로 텍스트를 escape하므로 그대로 사용
  return <span className={className} style={style}>{text}</span>;
};

// textarea나 input의 값을 sanitize
export const sanitizeInput = (value) => {
  if (!value) return '';
  
  // HTML 태그와 스크립트 제거
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};
