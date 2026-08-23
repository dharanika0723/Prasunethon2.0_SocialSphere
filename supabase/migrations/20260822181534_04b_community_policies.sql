/*
# Community tables — RLS policies

Adds row-level security policies to posts, post_likes, comments,
conversations, conversation_members, messages, notifications,
community_needs, emergencies, achievements.
*/

DROP POLICY IF EXISTS "posts_select_all" ON posts;
CREATE POLICY "posts_select_all" ON posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "posts_insert_own" ON posts;
CREATE POLICY "posts_insert_own" ON posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "posts_update_own" ON posts;
CREATE POLICY "posts_update_own" ON posts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "posts_delete_own" ON posts;
CREATE POLICY "posts_delete_own" ON posts FOR DELETE TO authenticated USING (author_id = auth.uid());

DROP POLICY IF EXISTS "post_likes_select_all" ON post_likes;
CREATE POLICY "post_likes_select_all" ON post_likes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "post_likes_insert_own" ON post_likes;
CREATE POLICY "post_likes_insert_own" ON post_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "post_likes_delete_own" ON post_likes;
CREATE POLICY "post_likes_delete_own" ON post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_select_all" ON comments;
CREATE POLICY "comments_select_all" ON comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE TO authenticated USING (author_id = auth.uid());

DROP POLICY IF EXISTS "conversations_select_member" ON conversations;
CREATE POLICY "conversations_select_member" ON conversations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = conversations.id AND cm.user_id = auth.uid())
);
DROP POLICY IF EXISTS "conversations_insert_any" ON conversations;
CREATE POLICY "conversations_insert_any" ON conversations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cm_select_member" ON conversation_members;
CREATE POLICY "cm_select_member" ON conversation_members FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM conversation_members cm2 WHERE cm2.conversation_id = conversation_members.conversation_id AND cm2.user_id = auth.uid())
);
DROP POLICY IF EXISTS "cm_insert_own_or_member" ON conversation_members;
CREATE POLICY "cm_insert_own_or_member" ON conversation_members FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM conversation_members cm2 WHERE cm2.conversation_id = conversation_members.conversation_id AND cm2.user_id = auth.uid())
);

DROP POLICY IF EXISTS "messages_select_member" ON messages;
CREATE POLICY "messages_select_member" ON messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid())
);
DROP POLICY IF EXISTS "messages_insert_member" ON messages;
CREATE POLICY "messages_insert_member" ON messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid())
);
DROP POLICY IF EXISTS "messages_update_member" ON messages;
CREATE POLICY "messages_update_member" ON messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid())
);

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "needs_select_all" ON community_needs;
CREATE POLICY "needs_select_all" ON community_needs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "needs_insert_any" ON community_needs;
CREATE POLICY "needs_insert_any" ON community_needs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "needs_update_any" ON community_needs;
CREATE POLICY "needs_update_any" ON community_needs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "emergencies_select_all" ON emergencies;
CREATE POLICY "emergencies_select_all" ON emergencies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "emergencies_insert_own" ON emergencies;
CREATE POLICY "emergencies_insert_own" ON emergencies FOR INSERT TO authenticated WITH CHECK (organization_id = auth.uid());
DROP POLICY IF EXISTS "emergencies_update_own" ON emergencies;
CREATE POLICY "emergencies_update_own" ON emergencies FOR UPDATE TO authenticated USING (organization_id = auth.uid()) WITH CHECK (organization_id = auth.uid());
DROP POLICY IF EXISTS "emergencies_delete_own" ON emergencies;
CREATE POLICY "emergencies_delete_own" ON emergencies FOR DELETE TO authenticated USING (organization_id = auth.uid());

DROP POLICY IF EXISTS "achievements_select" ON achievements;
CREATE POLICY "achievements_select" ON achievements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "achievements_insert_any" ON achievements;
CREATE POLICY "achievements_insert_any" ON achievements FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "achievements_delete_own" ON achievements;
CREATE POLICY "achievements_delete_own" ON achievements FOR DELETE TO authenticated USING (volunteer_id = auth.uid());
