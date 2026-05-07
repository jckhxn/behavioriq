-- CreateTable
CREATE TABLE "push_notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "push_notifications_user_id_idx" ON "push_notifications"("user_id");

-- CreateIndex
CREATE INDEX "push_notifications_sent_at_idx" ON "push_notifications"("sent_at");

-- AddForeignKey
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security
ALTER TABLE "push_notifications" ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications (for Realtime subscriptions)
CREATE POLICY "users_read_own_notifications" ON "push_notifications"
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Enable Realtime on this table
ALTER PUBLICATION supabase_realtime ADD TABLE "push_notifications";
