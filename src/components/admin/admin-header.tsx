
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar"
import { useUser } from "@/firebase";

interface AdminHeaderProps {
    title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
    const { user } = useUser();
    
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 shrink-0">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            {user && (
                <div className="hidden md:flex items-center gap-2 text-sm">
                    <span>Welcome, <span className="font-semibold">{user.displayName || user.email}</span></span>
                </div>
            )}
        </header>
    )
}
