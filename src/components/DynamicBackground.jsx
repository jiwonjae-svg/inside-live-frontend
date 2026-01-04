import React, { useEffect, useRef } from 'react';
import './DynamicBackground.css';

/**
 * 동적 그라데이션 배경 컴포넌트
 * 
 * 알고리즘 설명:
 * 1. 여러 개의 색상 원(blob)을 생성하여 화면에 배치
 * 2. 각 원은 독립적으로 랜덤한 방향과 속도로 이동
 * 3. HSL 색상 공간을 사용하여 부드러운 색상 전환
 * 4. CSS filter: blur를 사용하여 그라데이션 효과 생성
 * 5. requestAnimationFrame을 사용한 부드러운 애니메이션
 */
function DynamicBackground() {
  const canvasRef = useRef(null);
  const blobsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기를 화면 크기에 맞춤
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Blob 클래스 정의
    class ColorBlob {
      constructor(canvas) {
        // 초기 위치를 랜덤하게 설정
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        
        // 크기를 랜덤하게 설정 (화면 크기의 30~60%)
        this.radius = Math.min(canvas.width, canvas.height) * (0.3 + Math.random() * 0.3);
        
        // HSL 색상 설정 (부드러운 색상 전환을 위해)
        this.hue = Math.random() * 360; // 0-360도 사이의 색상
        this.saturation = 60 + Math.random() * 40; // 60-100% 채도
        this.lightness = 50 + Math.random() * 20; // 50-70% 명도
        
        // 색상 변화 속도
        this.hueSpeed = 0.1 + Math.random() * 0.2;
        
        // 이동 속도 (매우 느리게)
        this.vx = (Math.random() - 0.5) * 0.3; // -0.15 ~ 0.15
        this.vy = (Math.random() - 0.5) * 0.3;
        
        // 이동 방향 변경 타이머
        this.directionChangeTimer = 0;
        this.directionChangeInterval = 200 + Math.random() * 200; // 200-400 프레임마다
      }

      update(canvas) {
        // 색상을 천천히 변화
        this.hue = (this.hue + this.hueSpeed) % 360;
        
        // 방향 변경 타이머 증가
        this.directionChangeTimer++;
        
        // 일정 시간마다 이동 방향을 부드럽게 변경
        if (this.directionChangeTimer > this.directionChangeInterval) {
          const newVx = (Math.random() - 0.5) * 0.3;
          const newVy = (Math.random() - 0.5) * 0.3;
          
          // 부드러운 전환을 위해 lerp(선형 보간) 사용
          this.vx += (newVx - this.vx) * 0.1;
          this.vy += (newVy - this.vy) * 0.1;
          
          this.directionChangeTimer = 0;
          this.directionChangeInterval = 200 + Math.random() * 200;
        }
        
        // 위치 업데이트
        this.x += this.vx;
        this.y += this.vy;
        
        // 화면 경계에서 부드럽게 반대 방향으로 이동
        const margin = this.radius * 0.5;
        
        if (this.x < -margin) {
          this.x = canvas.width + margin;
        } else if (this.x > canvas.width + margin) {
          this.x = -margin;
        }
        
        if (this.y < -margin) {
          this.y = canvas.height + margin;
        } else if (this.y > canvas.height + margin) {
          this.y = -margin;
        }
      }

      draw(ctx) {
        // 방사형 그라데이션 생성
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        
        // 중심은 불투명, 가장자리는 투명
        gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0.4)`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
          this.x - this.radius,
          this.y - this.radius,
          this.radius * 2,
          this.radius * 2
        );
      }
    }

    // 4-6개의 blob 생성
    const blobCount = 4 + Math.floor(Math.random() * 3);
    blobsRef.current = Array.from({ length: blobCount }, () => new ColorBlob(canvas));

    // 애니메이션 루프
    let animationId;
    const animate = () => {
      // 이전 프레임 지우기
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 배경색 설정 (다크모드 대응)
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDarkMode ? '#0a0e27' : '#f0f0f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 모든 blob 업데이트 및 그리기
      blobsRef.current.forEach(blob => {
        blob.update(canvas);
        blob.draw(ctx);
      });
      
      // 다음 프레임 요청
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // 클린업
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="dynamic-background" />;
}

export default DynamicBackground;
