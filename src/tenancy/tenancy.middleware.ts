import { Injectable, NestMiddleware } from '@nestjs/common';
import { TenancyService } from './tenancy.service';

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  constructor(private readonly tenancyService: TenancyService) {

  }
  use(req: any, res: any, next: () => void) {
    // Extract the tenant ID from the request headers
    const tenantId = req.headers['tenant-id'];
    this.tenancyService.validateTenantId(tenantId);
    this.tenancyService.runWithTenant(tenantId, () => next());
  }
}
