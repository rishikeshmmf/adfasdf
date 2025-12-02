import { useState } from "react";
import RBACLayout from "@/components/RBACLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, Eye } from "lucide-react";
import { getPermissionNames } from "@shared/rbac-utils";
import PermissionTree from "@/components/PermissionTree";
import RoleOrgChart from "@/components/RoleOrgChart";
import RoleHierarchyTree from "@/components/RoleHierarchyTree";

const PERMISSION_LEVELS = {
  0: { name: "Basic", color: "bg-blue-100 text-blue-700" },
  1: { name: "Intermediate", color: "bg-purple-100 text-purple-700" },
  2: { name: "Advanced", color: "bg-orange-100 text-orange-700" },
  3: { name: "Admin", color: "bg-red-100 text-red-700" },
};

const PERMISSION_TREE = [
  {
    id: "perm-view",
    name: "View",
    description: "View resources",
    level: 0,
    children: [
      {
        id: "perm-view-own",
        name: "View Own",
        description: "View own resources",
        level: 1,
      },
      {
        id: "perm-view-all",
        name: "View All",
        description: "View all resources",
        level: 2,
      },
    ],
  },
  {
    id: "perm-create",
    name: "Create",
    description: "Create resources",
    level: 1,
  },
  {
    id: "perm-edit",
    name: "Edit",
    description: "Edit resources",
    level: 1,
    children: [
      {
        id: "perm-edit-own",
        name: "Edit Own",
        description: "Edit own resources",
        level: 1,
      },
      {
        id: "perm-edit-all",
        name: "Edit All",
        description: "Edit all resources",
        level: 2,
      },
    ],
  },
  {
    id: "perm-delete",
    name: "Delete",
    description: "Delete resources",
    level: 2,
  },
  {
    id: "perm-approve",
    name: "Approve",
    description: "Approve requests",
    level: 2,
  },
  {
    id: "perm-reject",
    name: "Reject",
    description: "Reject requests",
    level: 2,
  },
];

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: string[];
  childRoles?: string[];
  createdAt: string;
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "role-admin",
      name: "Admin",
      description: "Full system access",
      level: 3,
      permissions: [
        "perm-view-all",
        "perm-create",
        "perm-edit-all",
        "perm-delete",
        "perm-approve",
      ],
      childRoles: ["role-content-writer", "role-support"],
      createdAt: "2024-01-10",
    },
    {
      id: "role-content-writer",
      name: "Content Writer",
      description: "Can create and edit content",
      level: 2,
      permissions: ["perm-view-all", "perm-create", "perm-edit-all"],
      createdAt: "2024-01-12",
    },
    {
      id: "role-account-approval",
      name: "Account Approval",
      description: "Can approve accounts",
      level: 2,
      permissions: ["perm-view-all", "perm-approve", "perm-reject"],
      createdAt: "2024-01-14",
    },
    {
      id: "role-support",
      name: "Support",
      description: "Support team access",
      level: 1,
      permissions: ["perm-view-own", "perm-create"],
      createdAt: "2024-01-15",
    },
    {
      id: "role-user",
      name: "User",
      description: "Regular user",
      level: 0,
      permissions: ["perm-view-own"],
      createdAt: "2024-01-16",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [hierarchyOpen, setHierarchyOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "0",
    permissions: new Set<string>(),
  });

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => {
      const newSet = new Set(prev.permissions);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return { ...prev, permissions: newSet };
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        level: parseInt(formData.level),
        permissions: Array.from(formData.permissions),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setRoles([...roles, newRole]);
      setFormData({ name: "", description: "", level: "0", permissions: new Set() });
      setOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  // Build role hierarchy tree
  const roleHierarchyTree = roles
    .filter((r) => !roles.some((other) => other.childRoles?.includes(r.id)))
    .map((role) => ({
      id: role.id,
      name: role.name,
      level: role.level,
      level_name: PERMISSION_LEVELS[role.level as keyof typeof PERMISSION_LEVELS].name,
      parentId: null,
      children: (role.childRoles || [])
        .map((childId) => roles.find((r) => r.id === childId))
        .filter(Boolean)
        .map((child) => ({
          id: child!.id,
          name: child!.name,
          level: child!.level,
          level_name:
            PERMISSION_LEVELS[
              child!.level as keyof typeof PERMISSION_LEVELS
            ].name,
          parentId: role.id,
          children: [],
        })),
    }));

  return (
    <RBACLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Roles</h2>
            <p className="text-muted-foreground mt-1">
              Define and manage user roles with specific permissions and hierarchy
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={hierarchyOpen} onOpenChange={setHierarchyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Hierarchy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Role Hierarchy</DialogTitle>
                </DialogHeader>
                <RoleHierarchyTree roles={roleHierarchyTree} />
              </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      placeholder="e.g., Content Writer"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-desc">Description</Label>
                    <Input
                      id="role-desc"
                      placeholder="Role description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-level">Permission Level</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) =>
                        setFormData({ ...formData, level: value })
                      }
                    >
                      <SelectTrigger id="role-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">
                          Basic - View only access
                        </SelectItem>
                        <SelectItem value="1">
                          Intermediate - Create and edit access
                        </SelectItem>
                        <SelectItem value="2">
                          Advanced - Full control except delete
                        </SelectItem>
                        <SelectItem value="3">
                          Admin - Complete system access
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Permissions (Hierarchical)</Label>
                    <div className="bg-secondary p-4 rounded-lg border border-border max-h-64 overflow-y-auto">
                      <PermissionTree
                        permissions={PERMISSION_TREE}
                        selectedIds={formData.permissions}
                        onSelect={handlePermissionToggle}
                        selectable={true}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select permissions based on the color-coded hierarchy levels
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Role</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 flex-wrap p-4 bg-secondary rounded-lg border border-border">
          {Object.entries(PERMISSION_LEVELS).map(([level, info]) => (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${info.color}`}></div>
              <span className="text-sm font-medium text-foreground">
                {info.name} Level
              </span>
            </div>
          ))}
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead>Role Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold inline-block",
                        PERMISSION_LEVELS[
                          role.level as keyof typeof PERMISSION_LEVELS
                        ].color
                      )}
                    >
                      {
                        PERMISSION_LEVELS[
                          role.level as keyof typeof PERMISSION_LEVELS
                        ].name
                      }
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {role.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length > 0 ? (
                        role.permissions.slice(0, 3).map((perm) => {
                          const permission = PERMISSION_TREE.find(
                            (p) => p.id === perm
                          ) ||
                            PERMISSION_TREE.flatMap((p) => p.children || []).find(
                              (p) => p.id === perm
                            );
                          return (
                            <span
                              key={perm}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground"
                            >
                              {permission?.name || perm}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No permissions
                        </span>
                      )}
                      {role.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                          +{role.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(role.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </RBACLayout>
  );
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
