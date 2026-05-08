"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";

interface UserOption {
  id: string;
  email: string;
  name: string | null;
  iosAppLastSeen: string | null;
}

interface SentNotification {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  user: { id: string; email: string; name: string | null };
}

export function PushNotificationsTab() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const [history, setHistory] = useState<SentNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filterEnabled]);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchUsers() {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filterEnabled) params.set("iosActive", "true");
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users ?? []);
      if (selectedUser && filterEnabled) {
        const stillPresent = (data.users ?? []).some((u: UserOption) => u.id === selectedUser.id);
        if (!stillPresent) setSelectedUser(null);
      }
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
    if (!selectedUser) { toast.error("Select a recipient"); return; }
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!body.trim()) { toast.error("Body is required"); return; }

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

  const filteredUsers = userSearch
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.name ?? "").toLowerCase().includes(userSearch.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-4">
      {/* Compose */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Compose Notification
          </CardTitle>
          <CardDescription className="text-xs">
            Delivered instantly while the user has the iOS app open.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">iOS app users only</Label>
              <p className="text-xs text-muted-foreground">
                Only show users who opened the iOS app in the last 7 days
              </p>
            </div>
            <Switch checked={filterEnabled} onCheckedChange={setFilterEnabled} />
          </div>

          {/* User picker */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Recipient
              <span className="text-muted-foreground ml-1">({users.length} users)</span>
            </Label>
            <Input
              placeholder="Search by email or name…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="text-sm mb-1.5"
            />
            <Select
              value={selectedUser?.id ?? ""}
              onValueChange={(id) => {
                const u = users.find((u) => u.id === id) ?? null;
                setSelectedUser(u);
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select user…" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.slice(0, 100).map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.email}{u.name ? ` (${u.name})` : ""}
                    {u.iosAppLastSeen ? ` · ${new Date(u.iosAppLastSeen).toLocaleDateString()}` : ""}
                  </SelectItem>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No users found.</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-title" className="text-xs">Title</Label>
            <Input
              id="notif-title"
              placeholder="e.g. Assessment reminder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="text-sm"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-body" className="text-xs">Body</Label>
            <Textarea
              id="notif-body"
              placeholder="Notification message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={500}
              className="text-sm"
            />
          </div>

          <Button onClick={handleSend} disabled={sending} size="sm">
            <Send className="h-3.5 w-3.5 mr-2" />
            {sending ? "Sending…" : "Send Notification"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Recent Notifications</CardTitle>
              <CardDescription className="text-xs">Last 50 sent</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchHistory}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">No notifications sent yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Recipient</TableHead>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Body</TableHead>
                    <TableHead className="text-xs text-right">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="text-xs">
                        <div className="font-medium">{n.user.email}</div>
                        {n.user.name && (
                          <div className="text-muted-foreground">{n.user.name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{n.title}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {n.body}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
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
