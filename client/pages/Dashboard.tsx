import RBACLayout from "@/components/RBACLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      label: "Services",
      value: "3",
      description: "Active services",
      href: "/services",
      icon: "⚙️",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Roles",
      value: "6",
      description: "Total roles",
      href: "/roles",
      icon: "👥",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Policies",
      value: "12",
      description: "Active policies",
      href: "/policies",
      icon: "📋",
      color: "from-green-500 to-green-600",
    },
    {
      label: "Users",
      value: "24",
      description: "Total users",
      href: "/users",
      icon: "👤",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const recentActivities = [
    { action: "Created new policy", target: "Student Read Policy", time: "2 hours ago" },
    { action: "Updated role", target: "Content Writer", time: "1 day ago" },
    { action: "Added user", target: "john@example.com", time: "2 days ago" },
    { action: "Created service", target: "Payment Service", time: "3 days ago" },
  ];

  return (
    <RBACLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">Welcome to RBAC Admin</h2>
          <p className="text-muted-foreground mt-2">
            Manage your role-based access control system with services, roles, policies, and users
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.label}
                    </p>
                    <h3 className="text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-2">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`text-3xl bg-gradient-to-br ${stat.color} rounded-lg p-3`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/services">
                <Button variant="outline" className="w-full justify-between">
                  <span>Create New Service</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/roles">
                <Button variant="outline" className="w-full justify-between">
                  <span>Create New Role</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/policies">
                <Button variant="outline" className="w-full justify-between">
                  <span>Create New Policy</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/users">
                <Button variant="outline" className="w-full justify-between">
                  <span>Add New User</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* System Info */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">System Info</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Version</p>
                <p className="font-medium text-foreground">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="font-medium text-foreground">Operational</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">User Type</p>
                <p className="font-medium text-foreground">Admin</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start justify-between pb-4 border-b border-border last:border-b-0">
                <div>
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-muted-foreground text-sm">{activity.target}</p>
                </div>
                <p className="text-muted-foreground text-xs whitespace-nowrap ml-4">
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Documentation */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h3 className="text-lg font-bold text-foreground mb-2">
            📖 Getting Started
          </h3>
          <p className="text-muted-foreground mb-4">
            New to RBAC? Learn how to create services, define roles, set policies, and manage users effectively.
          </p>
          <Button className="gap-2">
            View Documentation
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    </RBACLayout>
  );
}
