-- Mise à jour automatique de updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_constructions_updated_at
before update on constructions
for each row execute function set_updated_at();
