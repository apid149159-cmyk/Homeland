import { UserProfile } from '../types';

// Simulate Network Latency
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
  
  // Check if user is already logged in (Persistent Session)
  async getSession(): Promise<UserProfile | null> {
    await delay(400); // Check latency
    const stored = localStorage.getItem('eventUser');
    return stored ? JSON.parse(stored) : null;
  }

  async login(email: string): Promise<UserProfile> {
    await delay(); // Simulate API call

    // Mock User Generation logic
    const mockUser: UserProfile = {
      id: 'u-' + Date.now(),
      name: email.split('@')[0],
      email: email,
      role: email.includes('admin') ? 'ADMIN' : 'ORGANIZER',
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
      provider: 'EMAIL'
    };

    localStorage.setItem('eventUser', JSON.stringify(mockUser));
    return mockUser;
  }

  async socialLogin(provider: 'GOOGLE' | 'FACEBOOK' | 'LINE'): Promise<UserProfile> {
    await delay(1200); // OAuth takes longer

    let mockUser: UserProfile;

    if (provider === 'GOOGLE') {
        mockUser = {
            id: 'g-12345',
            name: 'Google User',
            email: 'user@gmail.com',
            role: 'ORGANIZER',
            avatar: 'https://lh3.googleusercontent.com/ogw/AF2bZyiWv8_1s_S0z_x6y3j6y3j6y3j6y3j6y3j6y3j6=s64-c-mo', 
            provider: 'GOOGLE'
        };
    } else if (provider === 'FACEBOOK') {
         mockUser = {
            id: 'fb-67890',
            name: 'Facebook Fan',
            email: 'user@facebook.com',
            role: 'ORGANIZER',
            avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Facebook',
            provider: 'FACEBOOK'
        };
    } else {
        mockUser = {
            id: 'ln-11223',
            name: 'Line Friend',
            email: 'user@line.me',
            role: 'ORGANIZER',
            avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Line',
            provider: 'LINE'
        };
    }

    localStorage.setItem('eventUser', JSON.stringify(mockUser));
    return mockUser;
  }

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem('eventUser');
  }
}

export const authService = new AuthService();