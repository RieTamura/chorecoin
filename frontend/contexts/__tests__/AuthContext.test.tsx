import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../AuthContext';
import apiService from '../../services/api';
import { User } from '../../types';

// Mock the api service
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    getMe: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
  },
}));

// Test component that uses the auth context
const TestComponent: React.FC<{ onRender?: (context: any) => void }> = ({ onRender }) => {
  const context = useAuth();
  
  React.useEffect(() => {
    if (onRender) {
      onRender(context);
    }
  }, [context.user, context.isLoading]);

  return (
    <>
      <Text testID="user-email">{context.user?.email || 'No user'}</Text>
      <Text testID="loading-state">{context.isLoading ? 'Loading' : 'Not loading'}</Text>
      <Text testID="user-name">{context.user?.name || 'No name'}</Text>
    </>
  );
};

describe('AuthContext', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    userType: 'parent',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (apiService.getMe as jest.Mock).mockResolvedValue(mockUser);
    (apiService.loginWithGoogle as jest.Mock).mockResolvedValue({ user: mockUser, token: 'mock-token' });
    (apiService.logout as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('AuthProvider initialization', () => {
    it('should render children successfully', () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(getByTestId('user-email')).toBeTruthy();
      expect(getByTestId('loading-state')).toBeTruthy();
    });

    it('should initialize with loading state as true', () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(getByTestId('loading-state')).toHaveTextContent('Loading');
    });

    it('should set loading to false after initial auth check with no token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      expect(apiService.getMe).not.toHaveBeenCalled();
    });

    it('should check auth status and set user if token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('existing-token');
      (apiService.getMe as jest.Mock).mockResolvedValue(mockUser);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(apiService.getMe).toHaveBeenCalled();
      expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
    });
  });

  describe('Timeout functionality (new feature)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should timeout after 5 seconds when API call hangs', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('existing-token');
      
      // Mock a hanging API call
      (apiService.getMe as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Fast-forward time by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      // Should have removed the token after timeout
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should succeed if API responds before timeout', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('existing-token');
      (apiService.getMe as jest.Mock).mockResolvedValue(mockUser);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Don't advance timers, let the promise resolve naturally
      await waitFor(() => {
        expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
      });

      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
      expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
    });

    it('should handle timeout with specific error message', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('existing-token');
      (apiService.getMe as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const consoleErrorSpy = jest.spyOn(console, 'error');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'API call failed:',
          expect.objectContaining({
            message: 'Request timeout',
          })
        );
      });
    });

    it('should timeout at exactly 5000ms, not before or significantly after', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('existing-token');
      (apiService.getMe as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should not timeout before 5 seconds
      act(() => {
        jest.advanceTimersByTime(4999);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();

      // Should timeout at 5 seconds
      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      });
    });
  });

  describe('Error handling in checkAuthStatus', () => {
    it('should remove token and set loading to false when API call fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-token');
      (apiService.getMe as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      expect(console.error).toHaveBeenCalledWith('Auth check failed:', expect.any(Error));
    });

    it('should still remove token even if removeItem fails during error handling', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('bad-token');
      (apiService.getMe as jest.Mock).mockRejectedValue(new Error('API Error'));
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Remove failed'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('login function', () => {
    it('should successfully log in with valid ID token', async () => {
      const mockResponse = { user: mockUser, token: 'new-token' };
      (apiService.loginWithGoogle as jest.Mock).mockResolvedValue(mockResponse);

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      await act(async () => {
        await authContext.login('mock-id-token');
      });

      expect(apiService.loginWithGoogle).toHaveBeenCalledWith('mock-id-token');
      expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
      expect(getByTestId('user-name')).toHaveTextContent(mockUser.name);
    });

    it('should throw error when login fails', async () => {
      (apiService.loginWithGoogle as jest.Mock).mockRejectedValue(new Error('Login failed'));

      let authContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await expect(authContext.login('invalid-token')).rejects.toThrow('Login failed');
      expect(console.error).toHaveBeenCalledWith('Login failed:', expect.any(Error));
    });

    it('should handle network errors during login', async () => {
      const networkError = new Error('Network error');
      (apiService.loginWithGoogle as jest.Mock).mockRejectedValue(networkError);

      let authContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await expect(authContext.login('test-token')).rejects.toThrow('Network error');
    });

    it('should not set user if login throws an error', async () => {
      (apiService.loginWithGoogle as jest.Mock).mockRejectedValue(new Error('Auth error'));

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      try {
        await authContext.login('bad-token');
      } catch (e) {
        // Expected
      }

      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should handle empty ID token', async () => {
      (apiService.loginWithGoogle as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      let authContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await expect(authContext.login('')).rejects.toThrow();
    });

    it('should update user state with different user types', async () => {
      const childUser: User = { ...mockUser, userType: 'child' };
      (apiService.loginWithGoogle as jest.Mock).mockResolvedValue({ user: childUser, token: 'token' });

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await act(async () => {
        await authContext.login('test-token');
      });

      expect(getByTestId('user-email')).toHaveTextContent(childUser.email);
    });
  });

  describe('logout function', () => {
    it('should successfully log out user', async () => {
      // Set up initial logged-in state
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('existing-token');
      (apiService.getMe as jest.Mock).mockResolvedValue(mockUser);

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
      });

      await act(async () => {
        await authContext.logout();
      });

      expect(apiService.logout).toHaveBeenCalled();
      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should handle logout errors gracefully and not throw', async () => {
      (apiService.logout as jest.Mock).mockRejectedValue(new Error('Logout failed'));

      let authContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      // Should not throw
      await expect(authContext.logout()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
    });

    it('should set user to null even when API call fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('token');
      (apiService.getMe as jest.Mock).mockResolvedValue(mockUser);
      (apiService.logout as jest.Mock).mockRejectedValue(new Error('Server error'));

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
      });

      await act(async () => {
        await authContext.logout();
      });

      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should handle network errors during logout', async () => {
      (apiService.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await act(async () => {
        await authContext.logout();
      });

      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });
  });

  describe('refreshUser function', () => {
    it('should successfully refresh user data', async () => {
      const updatedUser: User = { ...mockUser, name: 'Updated Name' };
      (apiService.getMe as jest.Mock).mockResolvedValue(updatedUser);

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await act(async () => {
        await authContext.refreshUser();
      });

      expect(apiService.getMe).toHaveBeenCalled();
      expect(getByTestId('user-name')).toHaveTextContent('Updated Name');
    });

    it('should handle refresh errors gracefully', async () => {
      (apiService.getMe as jest.Mock).mockRejectedValue(new Error('Refresh failed'));

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await act(async () => {
        await authContext.refreshUser();
      });

      expect(console.error).toHaveBeenCalledWith('Refresh user failed:', expect.any(Error));
      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should not modify user state when refresh fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('token');
      (apiService.getMe as jest.Mock)
        .mockResolvedValueOnce(mockUser) // Initial load
        .mockRejectedValueOnce(new Error('Refresh error')); // Refresh fails

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
      });

      const userEmailBefore = getByTestId('user-email').children[0];

      await act(async () => {
        await authContext.refreshUser();
      });

      // User should remain the same after failed refresh
      expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
    });

    it('should handle multiple rapid refresh calls', async () => {
      const updatedUser: User = { ...mockUser, name: 'Refreshed' };
      (apiService.getMe as jest.Mock).mockResolvedValue(updatedUser);

      let authContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await act(async () => {
        await Promise.all([
          authContext.refreshUser(),
          authContext.refreshUser(),
          authContext.refreshUser(),
        ]);
      });

      // All calls should complete
      expect(apiService.getMe).toHaveBeenCalledTimes(3);
    });

    it('should update user with changed user type on refresh', async () => {
      const parentUser: User = { ...mockUser, userType: 'parent' };
      const childUser: User = { ...mockUser, userType: 'child' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('token');
      (apiService.getMe as jest.Mock)
        .mockResolvedValueOnce(parentUser)
        .mockResolvedValueOnce(childUser);

      let authContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && authContext.user);

      await act(async () => {
        await authContext.refreshUser();
      });

      expect(apiService.getMe).toHaveBeenCalledTimes(2);
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const TestComponentWithoutProvider = () => {
        useAuth();
        return <Text>Test</Text>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should provide auth context when used within AuthProvider', () => {
      let authContext: any;

      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      expect(authContext).toBeDefined();
      expect(authContext).toHaveProperty('user');
      expect(authContext).toHaveProperty('isLoading');
      expect(authContext).toHaveProperty('login');
      expect(authContext).toHaveProperty('logout');
      expect(authContext).toHaveProperty('refreshUser');
    });

    it('should have correct function types', async () => {
      let authContext: any;

      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      expect(typeof authContext.login).toBe('function');
      expect(typeof authContext.logout).toBe('function');
      expect(typeof authContext.refreshUser).toBe('function');
    });
  });

  describe('Edge cases and race conditions', () => {
    it('should handle rapid login/logout cycles', async () => {
      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await act(async () => {
        await authContext.login('token1');
        await authContext.logout();
        await authContext.login('token2');
        await authContext.logout();
      });

      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should handle concurrent login and refresh operations', async () => {
      let authContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await act(async () => {
        await Promise.all([
          authContext.login('token'),
          authContext.refreshUser(),
        ]);
      });

      // Should complete without errors
      expect(apiService.loginWithGoogle).toHaveBeenCalled();
    });

    it('should handle null user data from API', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('token');
      (apiService.getMe as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should handle undefined response from login', async () => {
      (apiService.loginWithGoogle as jest.Mock).mockResolvedValue(undefined);

      let authContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      await expect(act(async () => {
        await authContext.login('token');
      })).rejects.toThrow();
    });

    it('should handle malformed user data', async () => {
      const malformedUser = { id: 'test' }; // Missing required fields
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('token');
      (apiService.getMe as jest.Mock).mockResolvedValue(malformedUser);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      // Should still set the user even if data is incomplete
      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });
  });

  describe('State management', () => {
    it('should maintain separate state for multiple AuthProvider instances', async () => {
      const { getByTestId: getByTestId1 } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const { getByTestId: getByTestId2 } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId1('loading-state')).toHaveTextContent('Not loading');
        expect(getByTestId2('loading-state')).toHaveTextContent('Not loading');
      });

      expect(getByTestId1('user-email')).toHaveTextContent('No user');
      expect(getByTestId2('user-email')).toHaveTextContent('No user');
    });

    it('should not cause memory leaks on unmount', async () => {
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });

      // Should unmount without errors
      unmount();
    });

    it('should preserve user state across component re-renders', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('token');
      (apiService.getMe as jest.Mock).mockResolvedValue(mockUser);

      const { getByTestId, rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
      });

      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // User should still be present after rerender
      await waitFor(() => {
        expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete authentication flow: login -> refresh -> logout', async () => {
      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => authContext && !authContext.isLoading);

      // Login
      await act(async () => {
        await authContext.login('test-token');
      });
      expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);

      // Refresh
      const updatedUser = { ...mockUser, name: 'Updated' };
      (apiService.getMe as jest.Mock).mockResolvedValue(updatedUser);
      await act(async () => {
        await authContext.refreshUser();
      });
      expect(getByTestId('user-name')).toHaveTextContent('Updated');

      // Logout
      await act(async () => {
        await authContext.logout();
      });
      expect(getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should recover from failed initial load and allow subsequent login', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-token');
      (apiService.getMe as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      let authContext: any;
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state')).toHaveTextContent('Not loading');
      });

      expect(getByTestId('user-email')).toHaveTextContent('No user');

      // Now try to login
      (apiService.loginWithGoogle as jest.Mock).mockResolvedValue({ user: mockUser, token: 'new-token' });
      await act(async () => {
        await authContext.login('new-token');
      });

      expect(getByTestId('user-email')).toHaveTextContent(mockUser.email);
    });
  });
});