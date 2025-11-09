import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

interface SaveButtonProps {
  itemId: number;
  itemType: "campaign" | "charity" | "post";
  variant?: "default" | "icon" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onSaveChange?: (isSaved: boolean) => void;
}

export function SaveButton({ 
  itemId, 
  itemType, 
  variant = "ghost", 
  size = "icon",
  className,
  onSaveChange 
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [savedItemId, setSavedItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkIfSaved();
  }, [itemId, itemType]);

  const checkIfSaved = async () => {
    try {
      const response = await api.get("/me/saved");
      const data = response.data.grouped || response.data.all || [];
      
      let allItems: any[] = [];
      if (data.campaigns) allItems = [...allItems, ...data.campaigns];
      if (data.charities) allItems = [...allItems, ...data.charities];
      if (data.posts) allItems = [...allItems, ...data.posts];
      
      // Fallback for old format
      if (Array.isArray(response.data.all)) {
        allItems = response.data.all;
      }

      const saved = allItems.find((item: any) => {
        const savable = item.savable || item.campaign;
        return savable && savable.id === itemId;
      });

      if (saved) {
        setIsSaved(true);
        setSavedItemId(saved.id);
      }
    } catch (error) {
      console.error("Failed to check save status", error);
    }
  };

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (isSaved && savedItemId) {
        // Remove from saved
        await api.delete(`/me/saved/${savedItemId}`);
        setIsSaved(false);
        setSavedItemId(null);
        toast({
          title: "Removed",
          description: `${capitalize(itemType)} removed from saved items`,
        });
        onSaveChange?.(false);
      } else {
        // Save item
        const response = await api.post("/me/saved", {
          savable_id: itemId,
          savable_type: itemType,
        });
        setIsSaved(true);
        setSavedItemId(response.data.saved.id);
        toast({
          title: "Saved",
          description: `${capitalize(itemType)} added to saved items`,
        });
        onSaveChange?.(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isSaved ? 'remove' : 'save'} ${itemType}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  if (variant === "icon" || size === "icon") {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "relative transition-all",
          isSaved && "text-yellow-500 hover:text-yellow-600",
          className
        )}
        title={isSaved ? "Remove from saved" : "Save for later"}
      >
        <Bookmark 
          className={cn(
            "h-5 w-5 transition-all",
            isSaved && "fill-yellow-500",
            loading && "animate-pulse"
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "gap-2",
        isSaved && "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400",
        className
      )}
    >
      <Bookmark 
        className={cn(
          "h-4 w-4",
          isSaved && "fill-current"
        )}
      />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
