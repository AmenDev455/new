import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, BookOpen, Moon, Heart, Clock, Sprout } from "lucide-react";
import type { Prose } from "@shared/schema";

interface ProseCardProps {
  prose: Prose;
  onClick?: () => void;
}

const themeIcons = {
  "Spiritual Depth": Moon,
  "Presence & Connection": Heart,
  "Time & Purpose": Clock,
  "Growth & Becoming": Sprout,
};

export function ProseCard({ prose, onClick }: ProseCardProps) {
  const philosophySummary = prose.philosophyContent.slice(0, 120) + "...";
  const ThemeIcon = themeIcons[prose.theme as keyof typeof themeIcons] || Moon;

  return (
    <Card 
      className="p-6 cursor-pointer border-[1px] border-[#b8935f]/20 bg-transparent hover:border-[#a88860]/40 transition-all duration-300 group"
      onClick={onClick}
      data-testid={`card-prose-${prose.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-display text-2xl font-semibold text-[#1a1614] dark:text-white group-hover:text-[#a88860] transition-colors duration-300">
          {prose.title}
        </h3>
        <div className="flex-shrink-0 text-[#a88860] dark:text-[#b8935f]">
          <ThemeIcon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className="bg-[#a88860] dark:bg-[#b8935f] text-white border-0 text-xs">
          {prose.theme}
        </Badge>
        <Badge variant="outline" className="border-[#b8935f]/30 dark:border-[#b8935f]/30 text-[#a88860] dark:text-[#b8935f] border-[1px] text-xs">
          {prose.mood}
        </Badge>
      </div>

      <p className="text-[#3d3935] dark:text-[#e5e1dc] leading-relaxed mb-4">
        {philosophySummary}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-[#b8935f]/10 dark:border-[#b8935f]/10">
        <div className="flex items-center gap-4 text-sm text-[#a88860] dark:text-[#b8935f]">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {prose.readingTime} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {prose.views}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[#a88860] dark:text-[#b8935f] hover:text-[#a88860]/80 p-0 h-auto hover:bg-transparent"
          data-testid={`button-read-prose-${prose.id}`}
        >
          Read Story
        </Button>
      </div>
    </Card>
  );
}
