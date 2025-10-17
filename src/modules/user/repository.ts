import { Database } from '../../infra/database';

import { User, CreateUserInput, UpdateUserInput, userModel } from './models';

export interface IUserRepository {
  findAll(limit?: number, offset?: number): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

const SELECT_FIELDS = `
  id, name, email, password, role, 
  created_at as "createdAt", 
  updated_at as "updatedAt"
` as const;

const QUERIES = {
  FIND_ALL: `SELECT ${SELECT_FIELDS} FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
  FIND_BY_ID: `SELECT ${SELECT_FIELDS} FROM users WHERE id = $1`,
  FIND_BY_EMAIL: `SELECT ${SELECT_FIELDS} FROM users WHERE email = $1`,
  CREATE: `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING ${SELECT_FIELDS}`,
  DELETE: `DELETE FROM users WHERE id = $1`,
} as const;

const parseUser = (row: any): User | null =>
  row ? userModel.parse(row) : null;

const buildUpdateQuery = (data: UpdateUserInput, id: string) => {
  const entries = Object.entries(data).filter(
    ([, value]) => value !== undefined
  );

  if (entries.length === 0) return null;

  const fields = entries.map(([key], i) => `${key} = $${i + 1}`).join(', ');
  const values = entries.map(([, value]) => value);

  return {
    query: `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = $${
      values.length + 1
    } RETURNING ${SELECT_FIELDS}`,
    params: [...values, id],
  };
};

export const makeUserRepository = (db: Database): IUserRepository => ({
  findAll: async (limit = 100, offset = 0) => {
    const result = await db.query(QUERIES.FIND_ALL, [limit, offset]);
    return userModel.array().parse(result.rows);
  },

  findById: async (id: string) => {
    const result = await db.query(QUERIES.FIND_BY_ID, [id]);
    return parseUser(result.rows[0]);
  },

  findByEmail: async (email: string) => {
    const result = await db.query(QUERIES.FIND_BY_EMAIL, [email]);
    return parseUser(result.rows[0]);
  },

  create: async (data: CreateUserInput) => {
    const result = await db.query(QUERIES.CREATE, [
      data.name,
      data.email,
      data.password,
      data.role,
    ]);
    return userModel.parse(result.rows[0]);
  },

  update: async (id: string, data: UpdateUserInput) => {
    const updateQuery = buildUpdateQuery(data, id);

    if (!updateQuery) return null;

    const result = await db.query(updateQuery.query, updateQuery.params);
    return parseUser(result.rows[0]);
  },

  delete: async (id: string) => {
    const result = await db.query(QUERIES.DELETE, [id]);
    return (result.rowCount ?? 0) > 0;
  },
});
