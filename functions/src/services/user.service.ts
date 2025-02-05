import { db } from '../config/firebase';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

export class UserService {
  private readonly usersRef = db.ref('users');

  private async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const snapshot = await this.usersRef
        .orderByChild('email')
        .equalTo(email)
        .once('value');

      if (!snapshot.exists()) {
        return false;
      }

      // If we're updating a user, exclude their own email from the check
      if (excludeUserId) {
        let isEmailTaken = false;
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.key !== excludeUserId) {
            isEmailTaken = true;
          }
        });
        return isEmailTaken;
      }

      return true;
    } catch (error) {
      console.error('Error checking email:', error);
      throw new Error('Failed to check email availability');
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if email is already taken
      const isEmailTaken = await this.isEmailTaken(createUserDto.email);
      if (isEmailTaken) {
        throw new Error('Email is already in use');
      }

      const newUserRef = this.usersRef.push();
      const now = new Date().toISOString();
      
      const user: User = {
        id: newUserRef.key!,
        ...createUserDto,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      await newUserRef.set(user);
      return user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  }

  async getUser(id: string): Promise<User | null> {
    const snapshot = await this.usersRef.child(id).get();
    return snapshot.val();
  }

  async getAllUsers(skip: number = 0, limit: number = 10): Promise<User[]> {
    try {
      console.log(`Fetching users with skip: ${skip}, limit: ${limit}`);
      
      const snapshot = await this.usersRef
        .orderByChild('status')
        .equalTo('active')
        .once('value');
      
      console.log('Snapshot received:', snapshot.exists());
      
      const users: User[] = [];
      snapshot.forEach((childSnapshot) => {
        console.log('Processing user:', childSnapshot.key);
        users.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });

      console.log(`Total users found: ${users.length}`);
      
      const paginatedUsers = users.slice(skip, skip + limit);
      console.log(`Returning ${paginatedUsers.length} users`);
      
      return paginatedUsers;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserCount(): Promise<number> {
    try {
      const snapshot = await this.usersRef
        .orderByChild('status')
        .equalTo('active')
        .once('value');
        
      return snapshot.numChildren();
    } catch (error) {
      console.error('Error counting users:', error);
      throw new Error('Failed to get user count');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const userRef = this.usersRef.child(id);
      const snapshot = await userRef.get();
      
      if (!snapshot.exists()) {
        throw new Error('User not found');
      }

      // If email is being updated, check if the new email is already taken
      if (updateUserDto.email) {
        const isEmailTaken = await this.isEmailTaken(updateUserDto.email, id);
        if (isEmailTaken) {
          throw new Error('Email is already in use');
        }
      }

      const currentUser = snapshot.val();
      const updatedUser: User = {
        ...currentUser,
        ...updateUserDto,
        id, // Ensure ID is preserved
        updatedAt: new Date().toISOString(),
      };

      await userRef.update(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<User | null> {
    try {
      const userRef = this.usersRef.child(id);
      const snapshot = await userRef.get();
      
      if (!snapshot.exists()) {
        return null;
      }

      const user = snapshot.val();
      const updatedUser: User = {
        ...user,
        status: 'inactive',
        updatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString()
      };

      await userRef.update(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  }
}
