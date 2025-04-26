1. Postgresql support well multiple schemas (Mysql limits)
2. There are 2 common SasS (Software as Service) : shared database and schema (all table should have tenantId , for instance clinicId), the second is shared database but different schemas (each tenant has own schema)
3. TypeORM, Prisma, Drizzle support well for multi-tenancy architecture.
4. This demo use docker-compose to run Postgresql , Drizzle, NestJS
