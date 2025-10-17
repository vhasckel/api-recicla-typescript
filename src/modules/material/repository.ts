import { Database } from '../../infra/database';

import {
  CreateMaterial,
  Material,
  materialModel,
  MaterialWithPoints,
  materialWithPointsModel,
  UpdateMaterial,
} from './models';

const SELECT_MATERIAL_WITH_POINTS = `
  SELECT 
    m.id,
    m.name,
    m.slug,
    m.description,
    m.active,
    m.created_at as "createdAt",
    m.updated_at as "updatedAt",
    COALESCE(
      json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'address', p.address,
          'latitude', p.latitude,
          'longitude', p.longitude,
          'active', p.active
        ) ORDER BY p.name
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'
    ) as points
  FROM materials m
  LEFT JOIN point_materials pm ON m.id = pm.material_id
  LEFT JOIN points_of_collection p ON pm.point_id = p.id
`;

const SELECT_MATERIAL_FIELDS = `
id,
name,
slug,
description,
active,
created_at as "createdAt",
  updated_at as "updatedAt"
` as const;

const QUERIES = {
  FIND_ALL: `SELECT ${SELECT_MATERIAL_FIELDS} FROM materials ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
  FIND_BY_ID: `SELECT ${SELECT_MATERIAL_FIELDS} FROM materials WHERE id = $1`,
  FIND_BY_SLUG: `SELECT ${SELECT_MATERIAL_FIELDS} FROM materials WHERE slug = $1`,
  CREATE: `INSERT INTO materials (name, slug, description, active) VALUES ($1, $2, $3, $4) RETURNING ${SELECT_MATERIAL_FIELDS}`,
  DELETE: `DELETE FROM materials WHERE id = $1`,
};

export interface IMaterialRepository {
  findAll(limit: number, offset?: number): Promise<Material[]>;
  findById(id: string): Promise<Material | null>;
  findBySlug(slug: string): Promise<Material | null>;
  create(data: CreateMaterial): Promise<Material>;
  update(id: string, data: UpdateMaterial): Promise<Material | null>;
  delete(id: string): Promise<boolean>;
  findByIdWithPoints(id: string): Promise<MaterialWithPoints | null>;
  findAllWithPoints(
    limit: number,
    offset: number
  ): Promise<MaterialWithPoints[]>;
}

export const makeMaterialRepository = (db: Database): IMaterialRepository => ({
  findAll: async (limit: number = 100, offset: number = 0) => {
    const result = await db.query(QUERIES.FIND_ALL, [limit, offset]);
    return materialModel.array().parse(result.rows);
  },

  findById: async (id: string) => {
    const result = await db.query(QUERIES.FIND_BY_ID, [id]);
    return result.rows[0] ? materialModel.parse(result.rows[0]) : null;
  },

  findBySlug: async (slug: string) => {
    const result = await db.query(QUERIES.FIND_BY_SLUG, [slug]);
    return result.rows[0] ? materialModel.parse(result.rows[0]) : null;
  },

  create: async (data: CreateMaterial) => {
    const result = await db.query(QUERIES.CREATE, [
      data.name,
      data.slug,
      data.description,
      data.active,
    ]);
    return materialModel.parse(result.rows[0]);
  },

  update: async (id: string, data: UpdateMaterial) => {
    const updateFields = Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key], index) => `${key} = $${index + 1}`);

    if (updateFields.length === 0) {
      return null;
    }

    const values = Object.values(data).filter((value) => value !== undefined);
    const query = `
    UPDATE materials
    SET ${updateFields.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length + 1}
    RETURNING ${SELECT_MATERIAL_FIELDS}
    `;

    const result = await db.query(query, [...values, id]);
    return result.rows[0] ? materialModel.parse(result.rows[0]) : null;
  },

  delete: async (id: string) => {
    const result = await db.query(QUERIES.DELETE, [id]);
    return (result.rowCount ?? 0) > 0;
  },

  findByIdWithPoints: async (id: string) => {
    const sql = `
      ${SELECT_MATERIAL_WITH_POINTS}
      WHERE m.id = $1
      GROUP BY m.id, m.name, m.slug, m.description, m.active, m.created_at, m.updated_at
    `;

    const result = await db.query(sql, [id]);
    return result.rows[0]
      ? materialWithPointsModel.parse(result.rows[0])
      : null;
  },

  findAllWithPoints: async (limit: number = 100, offset: number = 0) => {
    const sql = `
      ${SELECT_MATERIAL_WITH_POINTS}
      GROUP BY m.id, m.name, m.slug, m.description, m.active, m.created_at, m.updated_at
      ORDER BY m.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(sql, [limit, offset]);
    return materialWithPointsModel.array().parse(result.rows);
  },
});
