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
import type { Poem, InsertPoem } from "@shared/schema";

const THEMES = ["Spiritual Depth", "Presence & Connection", "Time & Purpose", "Growth & Becoming"];
const MOODS = ["Reflective", "Energetic", "Melancholic", "Inspiring"];

export default function AdminPoems() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [formData, setFormData] = useState<Partial<InsertPoem>>({
    title: "",
    content: "",
    theme: "Spiritual Depth",
    mood: "Reflective",
    readingTime: 3,
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

  const { data: poems = [] } = useQuery<Poem[]>({
    queryKey: ["/api/admin/poems"],
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertPoem>) => {
      await apiRequest("POST", "/api/admin/poems", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/poems"] });
      queryClient.invalidateQueries({ queryKey: ["/api/poems"] });
      toast({ title: "Poem created successfully!" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPoem> }) => {
      await apiRequest("PUT", `/api/admin/poems/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/poems"] });
      queryClient.invalidateQueries({ queryKey: ["/api/poems"] });
      toast({ title: "Poem updated successfully!" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/poems/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/poems"] });
      queryClient.invalidateQueries({ queryKey: ["/api/poems"] });
      toast({ title: "Poem deleted successfully!" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      theme: "Spiritual Depth",
      mood: "Reflective",
      readingTime: 3,
      status: "draft",
      isFeatured: 0,
    });
    setEditingPoem(null);
  };

  const handleEdit = (poem: Poem) => {
    setEditingPoem(poem);
    setFormData({
      title: poem.title,
      content: poem.content,
      theme: poem.theme,
      mood: poem.mood,
      readingTime: poem.readingTime,
      status: poem.status,
      isFeatured: poem.isFeatured,
      seoTitle: poem.seoTitle || undefined,
      seoDescription: poem.seoDescription || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPoem) {
      updateMutation.mutate({ id: editingPoem.id, data: formData });
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
            <h1 className="font-display text-2xl font-bold">Manage Poems</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Add Poem Button */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">All Poems ({poems.length})</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-add-poem">
                <Plus className="w-4 h-4 mr-2" />
                Add New Poem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPoem ? "Edit Poem" : "Create New Poem"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-poem-title"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={10}
                    className="font-display"
                    data-testid="input-poem-content"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={formData.theme}
                      onValueChange={(value) => setFormData({ ...formData, theme: value })}
                    >
                      <SelectTrigger data-testid="select-poem-theme">
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
                      <SelectTrigger data-testid="select-poem-mood">
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
                      data-testid="input-poem-reading-time"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger data-testid="select-poem-status">
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
                  <Label htmlFor="featured">Featured Position (0 = not featured, 1-3 = position)</Label>
                  <Input
                    id="featured"
                    type="number"
                    min="0"
                    max="3"
                    value={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: parseInt(e.target.value) })}
                    data-testid="input-poem-featured"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingPoem ? "Update" : "Create"} Poem
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Poems List */}
        <div className="grid gap-4">
          {poems.map((poem) => (
            <Card key={poem.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display text-xl font-semibold">
                      {poem.title}
                    </h3>
                    <Badge variant={poem.status === "published" ? "default" : "secondary"}>
                      {poem.status}
                    </Badge>
                    {poem.isFeatured > 0 && (
                      <Badge variant="outline">Featured #{poem.isFeatured}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{poem.theme}</Badge>
                    <Badge variant="outline">{poem.mood}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {poem.content.split('\n')[0]}...
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {poem.views} views
                    </span>
                    <span>{poem.readingTime} min read</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(poem)}
                    data-testid={`button-edit-${poem.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this poem?")) {
                        deleteMutation.mutate(poem.id);
                      }
                    }}
                    data-testid={`button-delete-${poem.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {poems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No poems yet. Create your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
