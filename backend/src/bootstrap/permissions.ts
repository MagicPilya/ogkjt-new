import type { Core } from '@strapi/strapi';

import { PUBLIC_PERMISSION_ACTIONS } from './constants';

export async function setPublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) return;

  // Batch fetch existing permissions to avoid N+1 queries on startup.
  const existingPermissions = (await strapi.db.query('plugin::users-permissions.permission').findMany({
    where: {
      role: publicRole.id,
      action: { $in: [...PUBLIC_PERMISSION_ACTIONS] },
    },
    select: ['action'],
  })) as Array<{ action?: string }>;

  const existingActions = new Set(existingPermissions.map((permission) => permission.action).filter(Boolean));
  const missingActions = PUBLIC_PERMISSION_ACTIONS.filter((action) => !existingActions.has(action));

  await Promise.all(
    missingActions.map((action) =>
      strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      })
    )
  );
}
