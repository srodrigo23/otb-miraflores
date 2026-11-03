FROM public.ecr.aws/supabase/postgres:17.6.1.167

# Archivos del backup (roles.sql, schema.sql, data.sql)
COPY backup/ /backup/

# Se ejecuta automáticamente SOLO la primera vez (cuando el volumen de datos está vacío).
# El prefijo "zz-" asegura que corra después de los scripts de inicialización de Supabase.
COPY restore.sh /docker-entrypoint-initdb.d/restore.sh
RUN chmod +x /docker-entrypoint-initdb.d/restore.sh