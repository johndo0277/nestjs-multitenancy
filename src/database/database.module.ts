import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseService } from "./database.service";
import { TenancyModule } from "src/tenancy/tenancy.module";

@Module({
    imports: [ConfigModule, TenancyModule],
    providers: [DatabaseService],
    exports: [DatabaseService]

})

export class DatabaseModule { }
