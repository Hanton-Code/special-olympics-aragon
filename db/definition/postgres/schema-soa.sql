-- DDL PostgreSQL CONSOLIDADO para el Portal de Gestión SOA (MVP)

-- 1. Tablas de Catálogo y Maestras
--------------------------------------------------------------------------------

CREATE TABLE ESTADO_INSCRIPCION (
    estado_inscripcion_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estado_inscripcion_nombre VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT chk_estado_inscripcion_valido 
        CHECK (estado_inscripcion_nombre IN ('CONFIRMADA', 'ESPERA', 'RESERVA', 'CANCELADA'))
);

CREATE TABLE DOCUMENTO_TIPO (
    documento_tipo_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE,
    tipo_propietario VARCHAR(20) NOT NULL, -- 'TUTORIZADO', 'VOLUNTARIO', 'LEGAL'
    CONSTRAINT chk_propietario_tipo_valido
        CHECK (tipo_propietario IN ('TUTORIZADO', 'VOLUNTARIO', 'LEGAL'))
);

CREATE TABLE TEMPORADA (
    temporada_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    temporada_nombre VARCHAR(50) NOT NULL UNIQUE,
    f_inicio DATE, -- AÑADIDO: Para definir el rango de la temporada
    f_fin DATE,    -- AÑADIDO: Para definir el rango de la temporada
    CONSTRAINT chk_fechas_temporada CHECK (f_fin IS NULL OR f_inicio IS NULL OR f_fin > f_inicio)
);

-- 2. Entidades de Usuario y Staff
--------------------------------------------------------------------------------

CREATE TABLE STAFF (
    staff_id SERIAL PRIMARY KEY,
    staff_email VARCHAR(255) NOT NULL UNIQUE,
    staff_password_hash CHAR(60) NOT NULL, -- REINTRODUCIDO: Esencial para autenticación segura
    staff_rol VARCHAR(20) NOT NULL, -- 'IT' o 'ADMIN'
    staff_nombre VARCHAR(50) NOT NULL,
    staff_apellido VARCHAR(50) NOT NULL,
    staff_activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_staff_rol_valido CHECK (staff_rol IN ('IT', 'ADMIN'))
);

CREATE TABLE RESPONSABLE_LEGAL (
    responsable_legal_id SERIAL PRIMARY KEY,
    responsable_legal_nombre VARCHAR(25) NOT NULL,
    responsable_legal_apellidos VARCHAR(40) NOT NULL,
    responsable_legal_mail VARCHAR(50) NOT NULL UNIQUE, -- CORREGIDO: Mail es el login, debe ser UNIQUE
    responsable_legal_password_hash CHAR(60) NOT NULL, -- REINTRODUCIDO: Esencial para autenticación
    responsable_legal_tel BIGINT NOT NULL UNIQUE,
    responsable_legal_tel_emerg BIGINT,
    responsable_legal_f_nac DATE NOT NULL, -- CORREGIDO: De TIMESTAMP a DATE
    responsable_legal_dni VARCHAR(9) NOT NULL UNIQUE
        CHECK(responsable_legal_dni ~ '^[0-9]{8}[A-Z]$'),
    responsable_legal_foto VARCHAR(500),
    responsable_legal_ocupacion VARCHAR(40),
    responsable_legal_hobbies VARCHAR(300),
    responsable_legal_direccion VARCHAR(80),
    responsable_legal_cpostal INT,
    responsable_legal_tall_camiseta VARCHAR(3)
        CHECK (responsable_legal_tall_camiseta IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    responsable_legal_tall_pie SMALLINT CHECK (responsable_legal_tall_pie BETWEEN 2 AND 60),
    responsable_legal_tall_pantalon SMALLINT CHECK (responsable_legal_tall_pantalon BETWEEN 2 AND 60),
    rl_activo BOOLEAN NOT NULL DEFAULT TRUE, -- Mantenemos flag de estado
    
    -- INCONSISTENCIA PUNTUAL MANTENIDA: UNIQUE (nombre, apellidos)
    CONSTRAINT uq_responsable_legal_nombre_apellidos UNIQUE (responsable_legal_nombre, responsable_legal_apellidos) 
);

CREATE TABLE VOLUNTARIO (
    voluntario_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    voluntario_nombre VARCHAR(25) NOT NULL,
    voluntario_apellidos VARCHAR(40) NOT NULL,
    voluntario_mail VARCHAR(50) NOT NULL UNIQUE, -- CORREGIDO: Mail es el login, debe ser UNIQUE
    voluntario_password_hash CHAR(60) NOT NULL, -- REINTRODUCIDO: Esencial para autenticación
    voluntario_tel BIGINT NOT NULL UNIQUE,
    voluntario_tel_emerg BIGINT,
    voluntario_f_alta TIMESTAMP DEFAULT NOW(), -- REINTRODUCIDO: Fecha de registro
    voluntario_f_baja TIMESTAMP,
    voluntario_f_nac DATE NOT NULL, -- CORREGIDO: De TIMESTAMP a DATE
    voluntario_dni VARCHAR(9) NOT NULL UNIQUE
        CHECK(voluntario_dni ~ '^[0-9]{8}[A-Z]$'),
    voluntario_foto VARCHAR(500),
    voluntario_ocupacion VARCHAR(40),
    voluntario_hobbies VARCHAR(300),
    voluntario_direccion VARCHAR(80),
    voluntario_cpostal INT,
    voluntario_tall_camiseta VARCHAR(3)
        CHECK (voluntario_tall_camiseta IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    voluntario_tall_pie SMALLINT CHECK (voluntario_tall_pie BETWEEN 2 AND 60),
    voluntario_tall_pantalon SMALLINT CHECK (voluntario_tall_pantalon BETWEEN 2 AND 60),
    voluntario_activo BOOLEAN NOT NULL DEFAULT TRUE, -- Mantenemos flag de estado

    -- INCONSISTENCIA PUNTUAL MANTENIDA: UNIQUE (nombre, apellidos)
    CONSTRAINT uq_voluntario_nombre_apellidos UNIQUE (voluntario_nombre, voluntario_apellidos) 
);

CREATE TABLE TUTORIZADO (
    tutorizado_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    tutorizado_responsable_legal_id INT NOT NULL REFERENCES RESPONSABLE_LEGAL(responsable_legal_id),
    tutorizado_nombre VARCHAR(25) NOT NULL,
    tutorizado_apellidos VARCHAR(40) NOT NULL,
    tutorizado_f_nac DATE NOT NULL, -- CORREGIDO: De TIMESTAMP a DATE
    tutorizado_dni VARCHAR(9) NOT NULL UNIQUE -- CORREGIDO: No se referenciaba a responsable_legal_dni
        CHECK(tutorizado_dni ~ '^[0-9]{8}[A-Z]$'),
    tutorizado_foto VARCHAR(500),
    tutorizado_direccion VARCHAR(80),
    tutorizado_cpostal INT,
    tutorizado_tall_camiseta VARCHAR(3)
        CHECK (tutorizado_tall_camiseta IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    tutorizado_tall_pie SMALLINT CHECK (tutorizado_tall_pie BETWEEN 2 AND 60),
    tutorizado_tall_pantalon SMALLINT CHECK (tutorizado_tall_pantalon BETWEEN 2 AND 60),
    tutorizado_datos_salud JSONB, -- REINTRODUCIDO: Esencial para datos sensibles (GDPR/Requisitos)
    tutorizado_activo BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- INCONSISTENCIA PUNTUAL MANTENIDA: UNIQUE (nombre, apellidos)
    CONSTRAINT uq_tutorizado_nombre_apellidos UNIQUE (tutorizado_nombre, tutorizado_apellidos)
);

-- 3. Gestión Documental (Polimorfismo)
--------------------------------------------------------------------------------

CREATE TABLE DOCUMENTO (
    documento_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    documento_url VARCHAR(500) NOT NULL, -- URL de Google Cloud Storage
    documento_tipo SMALLINT NOT NULL REFERENCES DOCUMENTO_TIPO (documento_tipo_id), -- Renombrado de documento_tipo_id a documento_tipo para seguir el cliente (pero se mantiene FK)
    documento_estado VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE', -- REINTRODUCIDO: Esencial para la Validación Staff
    documento_f_subida TIMESTAMP NOT NULL DEFAULT NOW(), -- REINTRODUCIDO: Esencial para Auditoría/Seguimiento
    
    -- FKs para el Polimorfismo (Solo una debe estar NOT NULL)
    doc_voluntario_id INT REFERENCES VOLUNTARIO (voluntario_id), 
    doc_tutorizado_id INT REFERENCES TUTORIZADO (tutorizado_id), -- CORREGIDO: Tipo de SMALLINT a INT
    doc_responsable_legal_id INT REFERENCES RESPONSABLE_LEGAL (responsable_legal_id), -- REINTRODUCIDO: Documentación Legal del Tutor

    CONSTRAINT chk_documento_estado_valido CHECK (documento_estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),

    -- REINTRODUCIDO: Restricción de Polimorfismo: Asegura UN SOLO propietario
    CONSTRAINT chk_documento_propietario_unico CHECK (
        (CASE WHEN doc_voluntario_id IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN doc_tutorizado_id IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN doc_responsable_legal_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
    -- NOTA: Se eliminó la problemática UNIQUE(documento_voluntario, documento_tipo) sugerida por el cliente, ya que un voluntario podría subir varios documentos del mismo tipo (ej. varios certificados médicos a lo largo de los años).
);
-- Índice para optimizar la validación por Staff
CREATE INDEX idx_documento_estado_tipo ON DOCUMENTO (documento_estado, documento_tipo); 


-- 4. Gestión de Actividades e Inscripciones
--------------------------------------------------------------------------------

CREATE TABLE ACTIVIDAD (
    actividad_id SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    actividad_nombre VARCHAR(50) NOT NULL,
    actividad_descripcion VARCHAR(500), 
    actividad_duracion INT, -- Mantenido como atributo extra (horas)
    actividad_lugar VARCHAR(50) NOT NULL,
    actividad_temporada SMALLINT NOT NULL REFERENCES TEMPORADA (temporada_id), 
    
    actividad_f_inicio TIMESTAMP NOT NULL, -- CORREGIDO: Renombrado de actividad_fecha
    actividad_f_fin TIMESTAMP,             -- REINTRODUCIDO: Para cubrir el rango de actividad (opcional)

    actividad_num_plazas_part SMALLINT NOT NULL DEFAULT 50, -- CORREGIDO: De actividad_num_plazas a _part para claridad
    actividad_num_plazas_vol SMALLINT NOT NULL DEFAULT 15,  -- CORREGIDO: De actividad_num_voluntarios a _vol para claridad

    CONSTRAINT chk_plazas_positivas CHECK (actividad_num_plazas_part >= 0 AND actividad_num_plazas_vol >= 0)
);
-- Índice para consulta rápida por fecha y temporada
CREATE INDEX idx_actividad_fecha_temporada ON ACTIVIDAD (actividad_f_inicio, actividad_temporada);

CREATE TABLE INSCRIPCION (
    inscripcion_id SERIAL PRIMARY KEY,
    inscripcion_actividad_id SMALLINT NOT NULL REFERENCES ACTIVIDAD (actividad_id),
    inscripcion_estado_id SMALLINT NOT NULL REFERENCES ESTADO_INSCRIPCION (estado_inscripcion_id),
    inscripcion_tipo VARCHAR(15) NOT NULL, -- 'PARTICIPANTE' o 'VOLUNTARIO'
    inscripcion_f_registro TIMESTAMP NOT NULL DEFAULT NOW(), -- CLAVE FIFO

    -- FKs para el Polimorfismo de Inscrito
    inscripcion_tutorizado_id INT REFERENCES TUTORIZADO (tutorizado_id), 
    inscripcion_voluntario_id INT REFERENCES VOLUNTARIO (voluntario_id), 

    CONSTRAINT chk_inscripcion_tipo_valido CHECK (inscripcion_tipo IN ('PARTICIPANTE', 'VOLUNTARIO')),
    
    -- Restricción de Exclusividad: Solo un tipo de inscrito
    CONSTRAINT chk_inscrito_exclusivo CHECK (
        (CASE WHEN inscripcion_tutorizado_id IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN inscripcion_voluntario_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    
    -- Restricción de Unicidad (Evitar doble inscripción activa en la misma actividad)
    CONSTRAINT uq_inscrito_por_actividad_part UNIQUE (inscripcion_actividad_id, inscripcion_tutorizado_id),
    CONSTRAINT uq_inscrito_por_actividad_vol UNIQUE (inscripcion_actividad_id, inscripcion_voluntario_id)
);

-- Índice para optimizar la lógica de promoción (FIFO) y consultas de estado/actividad
CREATE INDEX idx_inscripcion_fifo ON INSCRIPCION (inscripcion_actividad_id, inscripcion_estado_id, inscripcion_f_registro ASC);