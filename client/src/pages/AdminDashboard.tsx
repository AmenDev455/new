import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FileText, BookOpen, Mail, Eye, TrendingUp, LogOut } from "lucide-react";

interface AnalyticsData {
  totalPoemViews: number;
  totalProseViews: number;
  totalSubscribers: number;
  mostPopularPoem: { title: string; views: number } | null;
  recentActivity: Array<{ type: string; count: number }>;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">
            Welcome back, {user?.firstName || "Admin"}
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your poetry platform
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Poem Views</span>
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold" data-testid="metric-poem-views">
              {analytics?.totalPoemViews || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total views</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Prose Views</span>
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold" data-testid="metric-prose-views">
              {analytics?.totalProseViews || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total views</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Subscribers</span>
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold" data-testid="metric-subscribers">
              {analytics?.totalSubscribers || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Newsletter subscribers</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Most Popular</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-lg font-semibold line-clamp-1" data-testid="metric-popular-poem">
              {analytics?.mostPopularPoem?.title || "No data"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.mostPopularPoem?.views || 0} views
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Manage Poems</h3>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and publish your poetry
                </p>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => window.location.href = "/admin/poems"}
              data-testid="button-manage-poems"
            >
              Go to Poems
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Manage Prose</h3>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and publish your prose stories
                </p>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => window.location.href = "/admin/prose"}
              data-testid="button-manage-prose"
            >
              Go to Prose
            </Button>
          </Card>
        </div>

        {/* Public Site Link */}
        <div className="mt-12 text-center">
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/"}
            data-testid="button-view-site"
          >
            View Public Site
          </Button>
        </div>
      </div>
    </div>
  );
}
