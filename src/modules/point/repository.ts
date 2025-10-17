import { Database } from '../../infra/database';

import {
  CreatePoint,
  ListPointsQuery,
  Point,
  pointModel,
  UpdatePoint,
} from './models';

export interface IPointRepository {
  findAll(query: ListPointsQuery): Promise<{ data: Point[]; total: number }>;
  findById(id: string): Promise<Point | null>;
  findByMaterialId(materialId: string): Promise<Point[]>;
  create(data: CreatePoint): Promise<Point>;
  update(id: string, data: UpdatePoint): Promise<Point | null>;
  delete(id: string): Promise<boolean>;
}

const buildPointQuery = (withGroupBy = false) => `
  SELECT 
    p.id,
    p.name,
    p.address,
    p.latitude,
    p.longitude,
    p.active,
    p.created_at as "createdAt",
    p.updated_at as "updatedAt",
    COALESCE(
      json_agg(
        json_build_object(
          'id', m.id,
          'name', m.name,
          'slug', m.slug,
          'description', m.description,
          'active', m.active
        ) ORDER BY m.name
      ) FILTER (WHERE m.id IS NOT NULL),
      '[]'
    ) as materials
  FROM points_of_collection p
  LEFT JOIN point_materials pm ON p.id = pm.point_id
  LEFT JOIN materials m ON pm.material_id = m.id
  ${withGroupBy ? 'GROUP BY p.id' : ''}
`;

const insertPointMaterials = async (
  db: Database,
  pointId: string,
  materialIds: string[]
) => {
  if (materialIds.length === 0) return;

  const values = materialIds
    .map((_, index) => `($1, $${index + 2})`)
    .join(', ');

  await db.query(
    `INSERT INTO point_materials (point_id, material_id) VALUES ${values}`,
    [pointId, ...materialIds]
  );
};

export const makePointRepository = (db: Database): IPointRepository => ({
  findAll: async (query: ListPointsQuery) => {
    let sql = buildPointQuery(false);
    const params: any[] = [];
    let paramIndex = 1;

    const conditions: string[] = [];

    if (query.search) {
      conditions.push(
        `(p.name ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex})`
      );
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    if (query.active !== undefined) {
      conditions.push(`p.active = $${paramIndex}`);
      params.push(query.active);
      paramIndex++;
    }

    if (query.materialIds && query.materialIds.length > 0) {
      conditions.push(`m.id = ANY($${paramIndex})`);
      params.push(query.materialIds);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(query.limit, query.offset);

    const [result, countResult] = await Promise.all([
      db.query(sql, params),
      db.query('SELECT COUNT(*) FROM points_of_collection'),
    ]);

    return {
      data: pointModel.array().parse(result.rows),
      total: parseInt(countResult.rows[0].count),
    };
  },

  findById: async (id: string) => {
    const sql = `${buildPointQuery(false)} WHERE p.id = $1 GROUP BY p.id`;
    const result = await db.query(sql, [id]);
    return result.rows[0] ? pointModel.parse(result.rows[0]) : null;
  },

  findByMaterialId: async (materialId: string) => {
    const sql = `${buildPointQuery(false)} WHERE m.id = $1 GROUP BY p.id`;
    const result = await db.query(sql, [materialId]);
    return pointModel.array().parse(result.rows);
  },

  create: async (data: CreatePoint) => {
    const pointResult = await db.query(
      `INSERT INTO points_of_collection (name, address, latitude, longitude, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [data.name, data.address, data.latitude, data.longitude, data.active]
    );

    const pointId = pointResult.rows[0].id;

    if (data.materialIds?.length) {
      await insertPointMaterials(db, pointId, data.materialIds);
    }

    const sql = `${buildPointQuery(false)} WHERE p.id = $1 GROUP BY p.id`;
    const result = await db.query(sql, [pointId]);
    return pointModel.parse(result.rows[0]);
  },

  update: async (id: string, data: UpdatePoint) => {
    const fieldMap: Record<string, string> = {
      name: 'name',
      address: 'address',
      latitude: 'latitude',
      longitude: 'longitude',
      active: 'active',
    };

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && fieldMap[key]) {
        updates.push(`${fieldMap[key]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updates.length > 0) {
      await db.query(
        `UPDATE points_of_collection SET ${updates.join(
          ', '
        )}, updated_at = NOW() WHERE id = $${paramIndex}`,
        [...values, id]
      );
    }

    if (data.materialIds?.length) {
      await db.query('DELETE FROM point_materials WHERE point_id = $1', [id]);
      await insertPointMaterials(db, id, data.materialIds);
    }

    const sql = `${buildPointQuery(false)} WHERE p.id = $1 GROUP BY p.id`;
    const result = await db.query(sql, [id]);
    return pointModel.parse(result.rows[0]);
  },

  delete: async (id: string) => {
    const result = await db.query(
      'DELETE FROM points_of_collection WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },
});
