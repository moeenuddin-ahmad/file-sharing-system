import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheUtilsService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async invalidate(route: string, id?: number | string) {
    const base = `/${route}`;

    await this.cacheManager.del(base);

    if (id !== undefined) {
      await this.cacheManager.del(`${base}/${id}`);
    }
  }
}
