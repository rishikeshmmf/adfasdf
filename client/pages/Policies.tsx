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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight } from "lucide-react";

interface Policy {
  id: string;
  name: string;
  description: string;
  service: string;
  permissions: PermissionNode[];
  createdAt: string;
}

interface PermissionNode {
  id: string;
  name: string;
  children?: PermissionNode[];
  selected?: boolean;
}

const SERVICES = ["Labs Service", "Courses Service", "Payment Service"];

const PERMISSION_TREE: PermissionNode[] = [
  {
    id: "view",
    name: "View",
    children: [
      { id: "view-own", name: "View Own Resources" },
      { id: "view-all", name: "View All Resources" },
    ],
  },
  {
    id: "edit",
    name: "Edit",
    children: [
      { id: "edit-own", name: "Edit Own Resources" },
      { id: "edit-all", name: "Edit All Resources" },
    ],
  },
  {
    id: "delete",
    name: "Delete",
    children: [
      { id: "delete-own", name: "Delete Own Resources" },
      { id: "delete-all", name: "Delete All Resources" },
    ],
  },
  {
    id: "approve",
    name: "Approve/Reject",
    children: [
      { id: "approve-content", name: "Approve Content" },
      { id: "reject-content", name: "Reject Content" },
    ],
  },
];

function PermissionTreeNode({
  node,
  selected,
  onToggle,
  level = 0,
}: {
  node: PermissionNode;
  selected: string[];
  onToggle: (id: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selected.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div className={`flex items-center gap-2 py-1 ${level > 0 ? "ml-4" : ""}`}>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0 hover:bg-secondary rounded"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <Checkbox
          id={`perm-${node.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(node.id)}
        />
        <Label htmlFor={`perm-${node.id}`} className="font-normal cursor-pointer">
          {node.name}
        </Label>
      </div>
      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <PermissionTreeNode
            key={child.id}
            node={child}
            selected={selected}
            onToggle={onToggle}
            level={level + 1}
          />
        ))}
    </div>
  );
}

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: "1",
      name: "Student Read Policy",
      description: "Allow students to view course materials",
      service: "Courses Service",
      permissions: [
        {
          id: "view",
          name: "View",
          children: [
            { id: "view-own", name: "View Own Resources", selected: true },
          ],
          selected: true,
        },
      ],
      createdAt: "2024-01-10",
    },
    {
      id: "2",
      name: "Instructor Full Access",
      description: "Full access for instructors",
      service: "Courses Service",
      permissions: [
        {
          id: "edit",
          name: "Edit",
          children: [
            { id: "edit-all", name: "Edit All Resources", selected: true },
          ],
          selected: true,
        },
      ],
      createdAt: "2024-01-12",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    service: "",
    selectedPermissions: [] as string[],
  });

  const handlePermissionToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(id)
        ? prev.selectedPermissions.filter((p) => p !== id)
        : [...prev.selectedPermissions, id],
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.service) {
      const newPolicy: Policy = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        service: formData.service,
        permissions: PERMISSION_TREE.map((p) => ({
          ...p,
          selected: formData.selectedPermissions.includes(p.id),
        })),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setPolicies([...policies, newPolicy]);
      setFormData({
        name: "",
        description: "",
        service: "",
        selectedPermissions: [],
      });
      setOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    setPolicies(policies.filter((p) => p.id !== id));
  };

  return (
    <RBACLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Policies</h2>
            <p className="text-muted-foreground mt-1">
              Create and manage access policies with granular permissions
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Policy</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-name">Policy Name</Label>
                  <Input
                    id="policy-name"
                    placeholder="e.g., Student Read Policy"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy-desc">Description</Label>
                  <Input
                    id="policy-desc"
                    placeholder="Policy description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy-service">Service</Label>
                  <Select
                    value={formData.service}
                    onValueChange={(value) =>
                      setFormData({ ...formData, service: value })
                    }
                  >
                    <SelectTrigger id="policy-service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICES.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2 bg-secondary p-4 rounded-lg border border-border max-h-48 overflow-y-auto">
                    {PERMISSION_TREE.map((node) => (
                      <PermissionTreeNode
                        key={node.id}
                        node={node}
                        selected={formData.selectedPermissions}
                        onToggle={handlePermissionToggle}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Policies Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead>Policy Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {policy.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {policy.service}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {policy.permissions
                        .filter((p) => p.selected)
                        .map((perm) => (
                          <span
                            key={perm.id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground"
                          >
                            {perm.name}
                          </span>
                        ))}
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
                        onClick={() => handleDelete(policy.id)}
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
