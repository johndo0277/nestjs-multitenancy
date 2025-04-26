//install nestjs cli (global)
npm i -g @nestjs/cli@latest
//create a new project (name nestjs-multitenancy)
nest new nestjs-multitenancy
//install drizzle-orm and pg connector
npm i drizzle-orm pg

//install migration tool
npm i -D drizzle-kit
npx drizzle-kit generate
if (nmp i -g drizzle-kit) : run drizzle-kit generate

//install nestjs/config (not hard code database connection)
npm i @nestjs/config

//create module tenancy
nest g module tenancy
//create service tenancy
nest g service tenancy
//create middleware tenancy
nest g middleware tenancy
//instal type for pg compatible to TypeScript
npm i --save-dev @types/pg