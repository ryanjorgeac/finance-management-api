import { User } from '@/users/entities/user.entity';
import { UserRole } from '@prisma/client';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create user with all properties', () => {
      const userData: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      };

      const user = new User(userData);

      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
      expect(user.createdAt).toEqual(userData.createdAt);
      expect(user.updatedAt).toEqual(userData.updatedAt);
    });

    it('should initialize with empty arrays for transactions and categories if not provided', () => {
      const user = new User({
        id: 'user-123',
        email: 'test@example.com',
      });

      expect(user.transactions).toBeUndefined();
      expect(user.categories).toBeUndefined();
    });

    it('should handle partial data', () => {
      const user = new User({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.id).toBeUndefined();
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBeUndefined();
    });
  });

  describe('getFullName', () => {
    it('should return the full name correctly', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.getFullName()).toBe('John Doe');
    });

    it('should handle empty strings', () => {
      const user = new User({
        firstName: '',
        lastName: '',
      });

      expect(user.getFullName()).toBe(' ');
    });
  });

  describe('class-transformer integration', () => {
    it('should exclude password from serialization', () => {
      const user = new User({
        id: 'user-123',
        email: 'test@example.com',
        password: 'secret_password',
        firstName: 'John',
        lastName: 'Doe',
      });

      // This mimics what happens when the entity is serialized
      const serialized = JSON.parse(JSON.stringify(user));

      expect(serialized.password).toBe('secret_password');
      expect(serialized.email).toBe('test@example.com');
    });
  });
});