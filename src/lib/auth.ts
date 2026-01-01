// Demo authentication - NOT for production use
// Data stored in localStorage

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'superadmin' | 'admin' | 'user';
  createdAt: string;
}

const USERS_KEY = 'sim_kia_users';
const SESSION_KEY = 'sim_kia_session';

// Initialize default superadmin
export const initializeAuth = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    const defaultUser: User = {
      id: crypto.randomUUID(),
      username: 'superadmin',
      password: 'suportadmin',
      role: 'superadmin',
      createdAt: new Date().toISOString()
    };
    saveUsers([defaultUser]);
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const addUser = (username: string, password: string, role: User['role'] = 'user'): { success: boolean; message: string } => {
  const users = getUsers();
  
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username sudah digunakan' };
  }
  
  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    password,
    role,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  return { success: true, message: 'User berhasil ditambahkan' };
};

export const deleteUser = (id: string): { success: boolean; message: string } => {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return { success: false, message: 'User tidak ditemukan' };
  }
  
  if (user.username === 'superadmin') {
    return { success: false, message: 'Superadmin tidak dapat dihapus' };
  }
  
  const filtered = users.filter(u => u.id !== id);
  saveUsers(filtered);
  return { success: true, message: 'User berhasil dihapus' };
};

export const login = (username: string, password: string): { success: boolean; user?: User; message: string } => {
  initializeAuth();
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const session = { userId: user.id, username: user.username, role: user.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user, message: 'Login berhasil' };
  }
  
  return { success: false, message: 'Username atau password salah' };
};

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): { userId: string; username: string; role: User['role'] } | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};

export const getCurrentUser = (): User | null => {
  const session = getSession();
  if (!session) return null;
  
  const users = getUsers();
  return users.find(u => u.id === session.userId) || null;
};
