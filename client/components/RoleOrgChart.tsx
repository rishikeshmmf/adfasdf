import { getPermissionNames } from "@shared/rbac-utils";
import { cn } from "@/lib/utils";

interface RoleNode {
  id: string;
  name: string;
  level: number; // 0=BASIC, 1=INTERMEDIATE, 2=ADVANCED, 3=ADMIN
  level_name: string;
  permissionCode: number;
  parentId: string | null;
  children: RoleNode[];
}

const LEVEL_STYLES = {
  0: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    badge: "bg-blue-100 text-blue-700",
    header: "bg-blue-200",
  },
  1: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    badge: "bg-purple-100 text-purple-700",
    header: "bg-purple-200",
  },
  2: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    badge: "bg-orange-100 text-orange-700",
    header: "bg-orange-200",
  },
  3: {
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-100 text-red-700",
    header: "bg-red-200",
  },
};

interface RoleOrgChartProps {
  roles: RoleNode[];
}

function RoleOrgChartNode({ node, isRoot }: { node: RoleNode; isRoot: boolean }) {
  const hasChildren = node.children && node.children.length > 0;
  const styles = LEVEL_STYLES[node.level as keyof typeof LEVEL_STYLES];
  const permissions = getPermissionNames(node.permissionCode);

  return (
    <div className="flex flex-col items-center">
      {/* Role Card */}
      <div
        className={cn(
          "w-80 rounded-xl border-2 overflow-hidden shadow-lg transition-all hover:shadow-xl",
          styles.bg,
          styles.border
        )}
      >
        {/* Header with Level Badge */}
        <div className={cn("px-4 py-3", styles.header)}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">{node.name}</h3>
            <div
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                styles.badge
              )}
            >
              {node.level_name}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-3">
          {/* Permission Code */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs font-semibold text-gray-600 mb-2">
              PERMISSION CODE
            </div>
            <div className="text-2xl font-mono font-bold text-gray-900">
              {node.permissionCode.toString().padStart(3, "0")}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              (Similar to Unix chmod)
            </div>
          </div>

          {/* Permissions List */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">
              PERMISSIONS ({permissions.length})
            </div>
            {permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No permissions</p>
            )}
          </div>

          {/* Child Count */}
          {hasChildren && (
            <div className="text-xs bg-white p-2 rounded border border-gray-200">
              <span className="font-semibold text-gray-700">
                ↓ {node.children.length} subordinate role{node.children.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Connection Line to Children */}
      {hasChildren && (
        <>
          <div className="w-1 h-6 bg-gray-400"></div>
          <div className="flex gap-6">
            {/* Horizontal Connector */}
            <div className="w-0.5 h-6 bg-gray-400 absolute" style={{ left: "50%" }}></div>

            {/* Children */}
            <div className="flex gap-12 relative">
              {node.children.map((child, index) => {
                const totalChildren = node.children.length;
                const isFirstChild = index === 0;
                const isLastChild = index === totalChildren - 1;

                return (
                  <div key={child.id} className="flex flex-col items-center relative">
                    {/* Vertical line from connector to child */}
                    <div
                      className="w-0.5 bg-gray-400 absolute top-0"
                      style={{
                        height: "24px",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    />
                    {/* Horizontal connector line */}
                    <div
                      className="h-0.5 bg-gray-400 absolute top-6"
                      style={{
                        width: "48px",
                        left: isFirstChild ? "0" : "-24px",
                        transform: isFirstChild ? "translateX(-100%)" : "translateX(50%)",
                      }}
                    />
                    <div style={{ marginTop: "30px" }}>
                      <RoleOrgChartNode node={child} isRoot={false} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RoleOrgChart({ roles }: RoleOrgChartProps) {
  return (
    <div className="w-full overflow-x-auto bg-gray-50 p-8 rounded-lg">
      {roles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No role hierarchy to display</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 items-center">
          {roles.map((role) => (
            <RoleOrgChartNode key={role.id} node={role} isRoot={true} />
          ))}
        </div>
      )}
    </div>
  );
}
