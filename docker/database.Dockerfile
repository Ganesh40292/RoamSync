FROM mysql:8.0

ENV MYSQL_DATABASE=tripsyncai
ENV MYSQL_ROOT_PASSWORD=rootpassword

COPY ../database/schema.sql /docker-entrypoint-initdb.d/01-schema.sql

EXPOSE 3306
