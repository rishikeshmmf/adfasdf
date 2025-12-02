import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleNode {
  id: string;
  name: string;
  level: number; // 0=BASIC, 1=INTERMEDIATE, 2=ADVANCED, 3=ADMIN
  level_name: string;
  parentId: string | null;
  children: RoleNode[];
}

const LEVEL_COLORS = {
  0: "from-blue-400 to-blue-500", // BASIC
  1: "from-purple-400 to-purple-500", // INTERMEDIATE
  2: "from-orange-400 to-orange-500", // ADVANCED
  3: "from-red-400 to-red-500", // ADMIN
};

const LEVEL_BG_COLORS = {
  0: "bg-blue-50 border-blue-200",
  1: "bg-purple-50 border-purple-200",
  2: "bg-orange-50 border-orange-200",
  3: "bg-red-50 border-red-200",
};

const LEVEL_TEXT_COLORS = {
  0: "text-blue-900",
  1: "text-purple-900",
  2: "text-orange-900",
  3: "text-red-900",
};

interface RoleHierarchyTreeProps {
  roles: RoleNode[];
}

function RoleTreeNode({ node }: { node: RoleNode }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      {/* Role Card */}
      <div
        className={cn(
          "p-4 rounded-lg border-2 bg-white shadow-sm hover:shadow-md transition-shadow",
          LEVEL_BG_COLORS[node.level as keyof typeof LEVEL_BG_COLORS]
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{node.name}</h3>
            <div
              className={cn(
                `inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 bg-gradient-to-r text-white`,
                LEVEL_COLORS[node.level as keyof typeof LEVEL_COLORS]
              )}
            >
              {node.level_name}
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <div className="ml-6 border-l-4 border-gray-300 pl-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
            <ChevronDown className="w-4 h-4" />
            Child Roles ({node.children.length})
          </div>
          {node.children.map((child) => (
            <RoleTreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoleHierarchyTree({ roles }: RoleHierarchyTreeProps) {
  return (
    <div className="space-y-4">
      {roles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No role hierarchy to display</p>
        </div>
      ) : (
        roles.map((role) => <RoleTreeNode key={role.id} node={role} />)
      )}
    </div>
  );
}
