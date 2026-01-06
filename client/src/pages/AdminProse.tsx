import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Eye, ArrowLeft } from "lucide-react";
import type { Prose, InsertProse } from "@shared/schema";

const THEMES = ["Spiritual Depth", "Presence & Connection", "Time & Purpose", "Growth & Becoming"];
const MOODS = ["Reflective", "Energetic", "Melancholic", "Inspiring"];

export default function AdminProse() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProse, setEditingProse] = useState<Prose | null>(null);
  const [formData, setFormData] = useState<Partial<InsertProse>>({
    title: "",
    philosophyContent: "",
    narrativeContent: "",
    theme: "Spiritual Depth",
    mood: "Reflective",
    readingTime: 5,
    status: "draft",
    isFeatured: 0,
  });

  // Redirect if not authenticated
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
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: proseStories = [] } = useQuery<Prose[]>({
    queryKey: ["/api/admin/prose"],
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertProse>) => {
      await apiRequest("POST", "/api/admin/prose", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prose"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prose"] });
      toast({ title: "Prose story created successfully!" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProse> }) => {
      await apiRequest("PUT", `/api/admin/prose/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prose"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prose"] });
      toast({ title: "Prose story updated successfully!" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/prose/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prose"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prose"] });
      toast({ title: "Prose story deleted successfully!" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      philosophyContent: "",
      narrativeContent: "",
      theme: "Spiritual Depth",
      mood: "Reflective",
      readingTime: 5,
      status: "draft",
      isFeatured: 0,
    });
    setEditingProse(null);
  };

  const handleEdit = (prose: Prose) => {
    setEditingProse(prose);
    setFormData({
      title: prose.title,
      philosophyContent: prose.philosophyContent,
      narrativeContent: prose.narrativeContent,
      theme: prose.theme,
      mood: prose.mood,
      readingTime: prose.readingTime,
      status: prose.status,
      isFeatured: prose.isFeatured,
      relatedPoemId: prose.relatedPoemId || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProse) {
      updateMutation.mutate({ id: editingProse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/admin"}
              data-testid="button-back-admin"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <h1 className="font-display text-2xl font-bold">Manage Prose</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Add Prose Button */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">All Prose Stories ({proseStories.length})</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-add-prose">
                <Plus className="w-4 h-4 mr-2" />
                Add New Prose Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProse ? "Edit Prose Story" : "Create New Prose Story"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-prose-title"
                  />
                </div>

                <div>
                  <Label htmlFor="philosophyContent">Philosophy (Left Column)</Label>
                  <Textarea
                    id="philosophyContent"
                    value={formData.philosophyContent}
                    onChange={(e) => setFormData({ ...formData, philosophyContent: e.target.value })}
                    required
                    rows={8}
                    data-testid="input-prose-philosophy"
                  />
                </div>

                <div>
                  <Label htmlFor="narrativeContent">Narrative (Right Column)</Label>
                  <Textarea
                    id="narrativeContent"
                    value={formData.narrativeContent}
                    onChange={(e) => setFormData({ ...formData, narrativeContent: e.target.value })}
                    required
                    rows={8}
                    data-testid="input-prose-narrative"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={formData.theme}
                      onValueChange={(value) => setFormData({ ...formData, theme: value })}
                    >
                      <SelectTrigger data-testid="select-prose-theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {THEMES.map((theme) => (
                          <SelectItem key={theme} value={theme}>
                            {theme}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mood">Mood</Label>
                    <Select
                      value={formData.mood}
                      onValueChange={(value) => setFormData({ ...formData, mood: value })}
                    >
                      <SelectTrigger data-testid="select-prose-mood">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOODS.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="readingTime">Reading Time (minutes)</Label>
                    <Input
                      id="readingTime"
                      type="number"
                      min="1"
                      value={formData.readingTime}
                      onChange={(e) => setFormData({ ...formData, readingTime: parseInt(e.target.value) })}
                      data-testid="input-prose-reading-time"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger data-testid="select-prose-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="featured">Featured (0 = not featured, 1 = featured on home)</Label>
                  <Input
                    id="featured"
                    type="number"
                    min="0"
                    max="1"
                    value={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: parseInt(e.target.value) })}
                    data-testid="input-prose-featured"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingProse ? "Update" : "Create"} Prose Story
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prose List */}
        <div className="grid gap-4">
          {proseStories.map((prose) => (
            <Card key={prose.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display text-xl font-semibold">
                      {prose.title}
                    </h3>
                    <Badge variant={prose.status === "published" ? "default" : "secondary"}>
                      {prose.status}
                    </Badge>
                    {prose.isFeatured > 0 && (
                      <Badge variant="outline">Featured</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{prose.theme}</Badge>
                    <Badge variant="outline">{prose.mood}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {prose.philosophyContent.slice(0, 150)}...
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {prose.views} views
                    </span>
                    <span>{prose.readingTime} min read</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(prose)}
                    data-testid={`button-edit-${prose.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this prose story?")) {
                        deleteMutation.mutate(prose.id);
                      }
                    }}
                    data-testid={`button-delete-${prose.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {proseStories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No prose stories yet. Create your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
