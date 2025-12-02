import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import RBACLayout from "@/components/RBACLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <RBACLayout>
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Oops! Page not found
          </p>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </RBACLayout>
  );
};

export default NotFound;
