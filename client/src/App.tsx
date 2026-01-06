import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import PoetryCollection from "@/pages/PoetryCollection";
import ProseCollection from "@/pages/ProseCollection";
import ProseStory from "@/pages/ProseStory";
import About from "@/pages/About";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPoems from "@/pages/AdminPoems";
import AdminProse from "@/pages/AdminProse";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/poetry" component={PoetryCollection} />
      <Route path="/prose" component={ProseCollection} />
      <Route path="/prose/:id" component={ProseStory} />
      <Route path="/about" component={About} />
      
      {/* Admin Routes (Protected) */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/poems" component={AdminPoems} />
      <Route path="/admin/prose" component={AdminProse} />
      
      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
