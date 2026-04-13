import type { Core } from '@strapi/strapi';

import { EDITOR_PERMISSION_ACTIONS, PUBLIC_PERMISSION_ACTIONS } from './constants';

type RoleLike = { id: number; type?: string; name?: string };

async function ensureRolePermissions(strapi: Core.Strapi, role: RoleLike, actions: readonly string[]) {
  const existingPermissions = (await strapi.db.query('plugin::users-permissions.permission').findMany({
    where: {
      role: role.id,
      action: { $in: [...actions] },
    },
    select: ['action'],
  })) as Array<{ action?: string }>;

  const existingActions = new Set(existingPermissions.map((permission) => permission.action).filter(Boolean));
  const missingActions = actions.filter((action) => !existingActions.has(action));

  await Promise.all(
    missingActions.map((action) =>
      strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      })
    )
  );
}

export async function setPublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) return;

  await ensureRolePermissions(strapi, publicRole as RoleLike, PUBLIC_PERMISSION_ACTIONS);

  const roles = (await strapi.db.query('plugin::users-permissions.role').findMany({
    select: ['id', 'type', 'name'],
  })) as RoleLike[];
  const editorRoles = roles.filter((role) => {
    const roleType = (role.type ?? '').toLowerCase();
    const roleName = (role.name ?? '').toLowerCase();
    return roleType === 'authenticated' || roleName.includes('редактор') || roleName.includes('editor');
  });

  await Promise.all(
    editorRoles.map((role) => ensureRolePermissions(strapi, role, EDITOR_PERMISSION_ACTIONS))
  );
}
