"use client";

import { useState, useEffect } from "react";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check, ChevronsUpDown, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserOption {
  id: string;
  email: string;
  name: string | null;
}

interface SentNotification {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  user: { id: string; email: string; name: string | null };
}

export default function NotificationsPage() {
  const { userData, isLoading: authLoading } = useUserData();
  const router = useRouter();

  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const [history, setHistory] = useState<SentNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push("/auth/login");
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users?limit=200");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      toast.error("Failed to load users");
    }
  }

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=50");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data.notifications ?? []);
    } catch {
      toast.error("Failed to load notification history");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSend() {
    if (!selectedUser) {
      toast.error("Select a recipient");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Body is required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, title: title.trim(), body: body.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to send");
      }

      toast.success(`Notification sent to ${selectedUser.email}`);
      setTitle("");
      setBody("");
      setSelectedUser(null);
      fetchHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(userSearch.toLowerCase())
  );

  if (authLoading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Push Notifications</h1>
        <p className="text-muted-foreground">
          Send in-app notifications to BehaviorIQ users via Supabase Realtime
        </p>
      </div>

      {/* Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Compose Notification
          </CardTitle>
          <CardDescription>
            Notifications are delivered instantly while the user has the iOS app open. They appear as local banners.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User picker */}
          <div className="space-y-1.5">
            <Label>Recipient</Label>
            <Popover open={userPickerOpen} onOpenChange={setUserPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={userPickerOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedUser ? (
                    <span>
                      {selectedUser.email}
                      {selectedUser.name && (
                        <span className="text-muted-foreground ml-1">({selectedUser.name})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select user…</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search by email or name…"
                    value={userSearch}
                    onValueChange={setUserSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {filteredUsers.slice(0, 30).map((u) => (
                        <CommandItem
                          key={u.id}
                          value={u.email}
                          onSelect={() => {
                            setSelectedUser(u);
                            setUserPickerOpen(false);
                            setUserSearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedUser?.id === u.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <div className="font-medium">{u.email}</div>
                            {u.name && (
                              <div className="text-xs text-muted-foreground">{u.name}</div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-title">Title</Label>
            <Input
              id="notif-title"
              placeholder="e.g. Assessment reminder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-body">Body</Label>
            <Textarea
              id="notif-body"
              placeholder="Notification message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <Button onClick={handleSend} disabled={sending} className="w-full sm:w-auto">
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending…" : "Send Notification"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Last 50 notifications sent</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchHistory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No notifications sent yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Body</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{n.user.email}</div>
                        {n.user.name && (
                          <div className="text-xs text-muted-foreground">{n.user.name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{n.title}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                        {n.body}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(n.sentAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
