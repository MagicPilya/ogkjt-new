import type { Core } from '@strapi/strapi';

import type { FolderTreeNode } from './config';
import { UPLOAD_FOLDER_UID } from './config';

export function patchUploadFolderStructure(strapi: Core.Strapi) {
  const folderService = strapi.plugin('upload').service('folder') as {
    getStructure?: () => Promise<unknown>;
    __ogkjtFolderStructurePatchApplied?: boolean;
  };

  if (!folderService?.getStructure || folderService.__ogkjtFolderStructurePatchApplied) return;

  folderService.getStructure = async () => {
    const metadata = strapi.db.metadata.get(UPLOAD_FOLDER_UID) as {
      attributes?: {
        parent?: {
          joinTable?: {
            name: string;
            joinColumn: { name: string };
            inverseJoinColumn: { name: string };
          };
        };
      };
    };
    const joinTable = metadata.attributes?.parent?.joinTable;

    const folders = (await strapi.db.query(UPLOAD_FOLDER_UID).findMany({
      select: ['id', 'name'],
    })) as Array<{ id: number; name: string }>;
    if (!folders.length) return [];

    const parentByFolderId = new Map<number, number>();
    if (joinTable) {
      const rows = (await strapi.db
        .connection(joinTable.name)
        .select(
          `${joinTable.joinColumn.name} as folderId`,
          `${joinTable.inverseJoinColumn.name} as parentId`
        )) as Array<{ folderId?: number; parentId?: number }>;
      for (const row of rows) {
        if (!row?.folderId || !row?.parentId) continue;
        parentByFolderId.set(Number(row.folderId), Number(row.parentId));
      }
    }

    const nodesById = new Map<number, FolderTreeNode>();
    for (const folder of folders) {
      nodesById.set(folder.id, {
        id: folder.id,
        name: folder.name,
        parent: parentByFolderId.get(folder.id) ?? null,
        children: [],
      });
    }

    const roots: FolderTreeNode[] = [];
    for (const node of nodesById.values()) {
      if (node.parent && nodesById.has(node.parent)) {
        nodesById.get(node.parent)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortTree = (nodes: FolderTreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      for (const node of nodes) {
        if (node.children.length) sortTree(node.children);
      }
    };

    sortTree(roots);
    return roots;
  };

  folderService.__ogkjtFolderStructurePatchApplied = true;
}
