CREATE DATABASE recicla
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\c recicla;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE points_of_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE point_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id UUID NOT NULL REFERENCES points_of_collection(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (point_id, material_id)
);

CREATE INDEX idx_point_materials_point_id ON point_materials(point_id);
CREATE INDEX idx_point_materials_material_id ON point_materials(material_id);

INSERT INTO users (id, name, email, password, role) VALUES 
(
  'Bilbo Baggins',
  'bilbo.baggins@email.com',
  'senha123',
  'admin'
),
(
  'Frodo Baggins',
  'frodo.baggins@email.com',
  'senha123',
  'user'
),
(
  'Samwise Gamgee',
  'samwise.gamgee@email.com',
  'senha123',
  'user'
);

INSERT INTO materials (name, slug, description, active) VALUES 
(
  'Papel',
  'papel',
  'Papéis em geral, jornais, revistas, cadernos, caixas de papelão',
  true
),
(
  'Plástico',
  'plastico',
  'Garrafas PET, embalagens plásticas, sacolas, potes de plástico',
  true
),
(
  'Vidro',
  'vidro',
  'Garrafas de vidro, potes, frascos, copos de vidro',
  true
);

INSERT INTO points_of_collection (name, address, latitude, longitude, active) VALUES 
(
  'Ecoponto Centro',
  'Rua Felipe Schmidt, 123, Centro - Florianópolis/SC',
  -27.5954,
  -48.5480,
  true
),
(
  'Ponto Verde Lagoa da Conceição',
  'Rua das Rendeiras, 456, Lagoa da Conceição - Florianópolis/SC',
  -27.6000,
  -48.4500,
  true
),
(
  'Coleta Sustentável Jurerê',
  'Rua dos Búzios, 789, Jurerê Internacional - Florianópolis/SC',
  -27.4300,
  -48.4800,
  true
);

INSERT INTO point_materials (point_id, material_id) VALUES 
(
  (SELECT id FROM points_of_collection WHERE name = 'Ecoponto Centro'),
  (SELECT id FROM materials WHERE slug = 'papel')
),
(
  (SELECT id FROM points_of_collection WHERE name = 'Ecoponto Centro'),
  (SELECT id FROM materials WHERE slug = 'plastico')
),
(
  (SELECT id FROM points_of_collection WHERE name = 'Ecoponto Centro'),
  (SELECT id FROM materials WHERE slug = 'vidro')
),
(
  (SELECT id FROM points_of_collection WHERE name = 'Ponto Verde Lagoa da Conceição'),
  (SELECT id FROM materials WHERE slug = 'papel')
),
(
  (SELECT id FROM points_of_collection WHERE name = 'Ponto Verde Lagoa da Conceição'),
  (SELECT id FROM materials WHERE slug = 'plastico')
),
(
  (SELECT id FROM points_of_collection WHERE name = 'Coleta Sustentável Jurerê'),
  (SELECT id FROM materials WHERE slug = 'vidro')
),
(
  (SELECT id FROM points_of_collection WHERE name = 'Coleta Sustentável Jurerê'),
  (SELECT id FROM materials WHERE slug = 'papel')
);

\echo '✓ Database recicla created successfully!';
\echo '✓ Table users created successfully!';
\echo '✓ Table materials created successfully!';
\echo '✓ Table points_of_collection created successfully!';
\echo '✓ Table point_materials created successfully!';