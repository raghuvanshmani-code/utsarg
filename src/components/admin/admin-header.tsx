
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAdminAuth } from "@/app/admin/auth-provider";

interface AdminHeaderProps {
    title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
    const { username } = useAdminAuth();
    
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            {username && (
                <div className="flex items-center gap-2 text-sm">
                    <span>Welcome, <span className="font-semibold">{username}</span></span>
                </div>
            )}
        </header>
    )
}
