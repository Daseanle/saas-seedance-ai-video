
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addKeyword } from "@/app/actions/keywords";
import { useToast } from "@/hooks/use-toast";

export function AddKeywordDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await addKeyword(null, formData);

        setLoading(false);

        if (!result.success) {
            toast({
                title: "Error adding keyword",
                description: result.message,
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Keyword Added",
            description: result.message,
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Keyword
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Keyword</DialogTitle>
                        <DialogDescription>
                            Track keyword rankings and AI visibility.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="keyword" className="text-right">
                                Keyword
                            </Label>
                            <Input
                                id="keyword"
                                name="keyword"
                                placeholder="e.g. ai tools"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="volume" className="text-right">
                                Volume
                            </Label>
                            <Input
                                id="volume"
                                name="volume"
                                type="number"
                                placeholder="0"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Keyword"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
