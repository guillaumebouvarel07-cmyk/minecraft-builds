-- Extension pour générer des UUID
create extension if not exists "pgcrypto";

-- Types énumérés
create type difficulty_level as enum ('facile', 'moyen', 'difficile', 'expert');
create type edition_type as enum ('java', 'bedrock', 'both');
create type construction_status as enum ('brouillon', 'publie');
create type file_kind as enum ('schematic', 'litematic', 'worldedit', 'structure_block');
