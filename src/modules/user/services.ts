import { BadRequestError, NotFoundError } from '../../shared/exceptions';

import { CreateUserInput, UpdateUserInput, User } from './models';
import { IUserRepository } from './repository';

const MAX_LIMIT = 100;

export interface IUserService {
  findAll(limit: number, offset?: number): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export const makeUserService = (repository: IUserRepository): IUserService => {
  const validateEmailUniqueness = async (email: string) => {
    const existingUser = await repository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }
  };

  const ensureUserExists = async (id: string): Promise<User> => {
    const user = await repository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  };

  return {
    findAll: async (limit: number, offset: number = 0) => {
      if (limit > MAX_LIMIT) {
        throw new BadRequestError(`Limit cannot exceed ${MAX_LIMIT}`);
      }
      return repository.findAll(limit, offset);
    },

    findById: (id: string) => repository.findById(id),

    findByEmail: (email: string) => repository.findByEmail(email),

    create: async (data: CreateUserInput) => {
      await validateEmailUniqueness(data.email);
      return repository.create(data);
    },

    update: async (id: string, data: UpdateUserInput) => {
      const existingUser = await ensureUserExists(id);

      if (data.email && data.email !== existingUser.email) {
        await validateEmailUniqueness(data.email);
      }

      return repository.update(id, data);
    },

    delete: async (id: string) => {
      await ensureUserExists(id);
      return repository.delete(id);
    },
  };
};
