import { SetMetadata } from '@nestjs/common';

export const PLATFORM_KEY = 'platform';
export const Platform = (platform: 'mobile' | 'web' | 'shared') => SetMetadata(PLATFORM_KEY, platform);
