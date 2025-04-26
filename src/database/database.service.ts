import { BadRequestException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { execSync } from "child_process";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';
import { TenancyService } from "src/tenancy/tenancy.service";
import { Schema, schema } from "./schema";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private defaultPool: Pool;
    private readonly logger = new Logger(DatabaseService.name);
    private readonly tenantConnections: Map<string, { pool: Pool, database: NodePgDatabase<Schema> }> = new Map();

    constructor(private readonly configService: ConfigService, private readonly tenancyService: TenancyService) {
        const dbUrl = this.configService.get<string>('DATABASE_URL');
        console.log('Database URL:', dbUrl);
    }

    async onModuleInit() {
        this.createDefaultPool();
        await this.createTenantConnections();
    };

    async onModuleDestroy() {
        await this.defaultPool.end();
        for (const connection of this.tenantConnections.values()) {
            await connection.pool.end();
        }
        // this.tenantConnections.clear();
    };

    private async createDefaultPool() {
        this.defaultPool = new Pool({
            connectionString: this.configService.getOrThrow<string>('DATABASE_URL')
        });
    }

    private async createTenantConnections() {
        for (const [tenantId, connectionString] of Object.entries(
            this.tenancyService.getTenants()
        )) {
            await this.createTenantConnection(tenantId, connectionString);
            this.runMigrations(tenantId, connectionString);
        }
    }

    private async createTenantConnection(tenantId: string, connectionString: string) {
        await this.createDatabaseIfNotExists(tenantId);
        const pool = new Pool({
            connectionString: connectionString
        });
        const database = drizzle(pool, { schema });
        this.tenantConnections.set(tenantId, { pool, database });
    }


    private async createDatabaseIfNotExists(tenantId: string) {
        const result = await this.defaultPool.query(`
        SELECT 1 FROM pg_database WHERE datname = '${tenantId}'
    `);
        if (result.rowCount === 0) {
            await this.defaultPool.query(`CREATE DATABASE "${tenantId}"`);
        }
    }

    private runMigrations(tenantId: string, connectionString: string) {
        const originalDatabaseUrl = this.configService.getOrThrow('DATABASE_URL');
        process.env.DATABASE_URL = connectionString; // Temporarily set the tenant's connection string

        try {
            const output = execSync('npx drizzle-kit migrate --config drizzle.config.ts', {
                encoding: 'utf-8',
            });
            this.logger.log(`Migrations ran successfully for tenant ${tenantId}: ${output}`);
        } catch (error) {
            this.logger.error(`Failed to run migrations for tenant ${tenantId}: ${error.message}`);
            throw error; // Re-throw the error to handle it upstream
        } finally {
            process.env.DATABASE_URL = originalDatabaseUrl; // Restore the original DATABASE_URL
        }
    }

    getDatabase() {
        const tenantId = this.tenancyService.getTenantContext()?.tenantId;
        if (!tenantId) {
            throw new BadRequestException('Tenant ID is undefined');
        }
        return this.tenantConnections.get(tenantId)?.database;
    }
};