import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 현재 사용자 정보 불러오기
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await authAPI.getCurrentUser();
          setCurrentUser(data.user);
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
          // 토큰이 유효하지 않으면 제거
          await authAPI.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // 회원가입
  const register = async (username, email, password, name, rememberMe = true) => {
    try {
      const data = await authAPI.register(username, email, password, name, rememberMe);
      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }
  };

  // 로그인
  const login = async (username, password, rememberMe = false) => {
    try {
      const data = await authAPI.login(username, password, rememberMe);
      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setCurrentUser(null);
    }
  };

  // 회원정보 수정
  const updateProfile = async (userId, updatedData) => {
    try {
      // localStorage 기반으로 직접 업데이트
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...updatedData
        }));
      }
      
      return updatedData;
    } catch (error) {
      throw new Error(error.message || '회원정보 수정에 실패했습니다.');
    }
  };

  // 계정 삭제
  const deleteAccount = async (userId) => {
    try {
      const { usersAPI } = await import('../services/api');
      await usersAPI.deleteUser(userId);
      
      if (currentUser && currentUser.id === userId) {
        await logout();
      }
    } catch (error) {
      throw new Error(error.message || '계정 삭제에 실패했습니다.');
    }
  };

  // 계정 찾기 (이메일로 사용자명 찾기)
  const findAccount = async (email) => {
    try {
      const { authAPI } = await import('../services/api');
      const data = await authAPI.findAccount(email);
      return data.username;
    } catch (error) {
      throw new Error(error.message || '계정을 찾을 수 없습니다.');
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email, newPassword) => {
    try {
      const { authAPI } = await import('../services/api');
      await authAPI.resetPassword(email, newPassword);
      return true;
    } catch (error) {
      throw new Error(error.message || '비밀번호 재설정에 실패했습니다.');
    }
  };

  // 사용자 정보 새로고침 (차단 해제 등의 상태 변경 반영)
  const refreshUser = async () => {
    const token = getToken();
    if (token) {
      try {
        const data = await authAPI.getCurrentUser();
        setCurrentUser(data.user);
        return data.user;
      } catch (error) {
        console.error('사용자 정보 새로고침 실패:', error);
        throw error;
      }
    }
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    updateProfile,
    deleteAccount,
    findAccount,
    resetPassword,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
