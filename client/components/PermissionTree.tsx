import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionNode {
  id: string;
  name: string;
  level: number; // 0=BASIC, 1=INTERMEDIATE, 2=ADVANCED, 3=ADMIN
  description?: string;
  children?: PermissionNode[];
  selected?: boolean;
}

const LEVEL_COLORS = {
  0: "bg-blue-50 border-blue-200 text-blue-900", // BASIC
  1: "bg-purple-50 border-purple-200 text-purple-900", // INTERMEDIATE
  2: "bg-orange-50 border-orange-200 text-orange-900", // ADVANCED
  3: "bg-red-50 border-red-200 text-red-900", // ADMIN
};

const LEVEL_BADGES = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-purple-100 text-purple-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-red-100 text-red-700",
};

const LEVEL_NAMES = ["Basic", "Intermediate", "Advanced", "Admin"];

interface PermissionTreeProps {
  permissions: PermissionNode[];
  onSelect?: (permissionId: string) => void;
  selectedIds?: Set<string>;
  selectable?: boolean;
}

function PermissionTreeNode({
  node,
  selectedIds,
  onSelect,
  selectable,
}: {
  node: PermissionNode;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  selectable?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedIds?.has(node.id) ?? false;

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg border transition-all",
          LEVEL_COLORS[node.level as keyof typeof LEVEL_COLORS]
        )}
      >
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        {selectable && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(node.id)}
            className="w-4 h-4 cursor-pointer"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.name}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap",
                LEVEL_BADGES[node.level as keyof typeof LEVEL_BADGES]
              )}
            >
              {LEVEL_NAMES[node.level]}
            </span>
          </div>
          {node.description && (
            <p className="text-xs opacity-75 mt-1 truncate">
              {node.description}
            </p>
          )}
        </div>
      </div>

      {expanded &&
        hasChildren &&
        node.children!.map((child) => (
          <div key={child.id} className="ml-4 border-l-2 border-gray-200 pl-2">
            <PermissionTreeNode
              node={child}
              selectedIds={selectedIds}
              onSelect={onSelect}
              selectable={selectable}
            />
          </div>
        ))}
    </div>
  );
}

export default function PermissionTree({
  permissions,
  onSelect,
  selectedIds = new Set(),
  selectable = false,
}: PermissionTreeProps) {
  return (
    <div className="space-y-2">
      {permissions.map((permission) => (
        <PermissionTreeNode
          key={permission.id}
          node={permission}
          selectedIds={selectedIds}
          onSelect={onSelect}
          selectable={selectable}
        />
      ))}
    </div>
  );
}
