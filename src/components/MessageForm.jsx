import React, { useState, useEffect } from 'react';
import './MessageForm.css';

function MessageForm({ currentUser, onClose, onSendMessage, initialRecipient = '' }) {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setRecipient(initialRecipient);
  }, [initialRecipient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 입력 검증
    if (!recipient.trim()) {
      setError('받는 사람을 입력하세요.');
      return;
    }

    if (!message.trim()) {
      setError('메시지 내용을 입력하세요.');
      return;
    }

    // 위험한 문자 체크 (XSS 방지)
    const dangerousPattern = /<script|<iframe|javascript:|onerror=|onload=/i;
    if (dangerousPattern.test(message) || dangerousPattern.test(recipient)) {
      setError('위험한 문자가 포함되어 있습니다.');
      return;
    }

    // 쉼표로 구분된 여러 수신자 처리
    const recipients = recipient.split(',').map(r => r.trim()).filter(r => r);
    
    if (recipients.length === 0) {
      setError('받는 사람을 입력하세요.');
      return;
    }

    // 자기 자신 확인
    const hasSelf = recipients.some(r => r.toLowerCase() === currentUser.username.toLowerCase());
    if (hasSelf) {
      setError('자기 자신에게는 메시지를 보낼 수 없습니다.');
      return;
    }

    // 서버에 메시지 전송 (각각 전송)
    try {
      let successCount = 0;
      let failedRecipients = [];

      for (const recip of recipients) {
        try {
          const response = await fetch('http://localhost:5000/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              to: recip,
              content: message.trim()
            })
          });

          const data = await response.json();

          if (response.ok) {
            successCount++;
            if (onSendMessage) {
              onSendMessage({
                id: data.data._id,
                from: currentUser.username,
                fromName: currentUser.username,
                to: data.data.to,
                toName: data.data.toName,
                content: data.data.content,
                date: data.data.date,
                read: false
              });
            }
          } else {
            failedRecipients.push(recip);
          }
        } catch (err) {
          failedRecipients.push(recip);
        }
      }

      if (successCount > 0) {
        alert(`${successCount}명에게 메시지를 보냈습니다.`);
      }
      
      if (failedRecipients.length > 0) {
        setError(`다음 사용자에게 메시지 전송에 실패했습니다: ${failedRecipients.join(', ')}`);
        return;
      }

      onClose();
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      setError('메시지 전송 중 오류가 발생했습니다.');
      return;
    }
  };

  return (
    <div className="message-form-overlay" onClick={onClose}>
      <div className="message-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="message-form-header">
          <h2>메시지 보내기</h2>
          <button className="btn-close-modal" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="message-error">{error}</div>}
          
          <div className="form-group">
            <label>받는 사람</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="사용자 이름 (여러명은 쉼표로 구분)"
              className="message-input"
            />
          </div>

          <div className="form-group">
            <label>메시지</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요 (텍스트만 가능)"
              className="message-textarea"
              rows="8"
            />
            <div className="char-count">{message.length} / 500</div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-send">
              전송
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MessageForm;
