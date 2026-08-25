import { supabase } from "@/lib/supabaseClient";
import type { Person } from "@/data/types";

export interface Group {
  id: string;
  name: string;
  joinCode: string;
}

interface GroupRow {
  id: string;
  name: string;
  join_code: string;
}

function rowToGroup(row: GroupRow): Group {
  return { id: row.id, name: row.name, joinCode: row.join_code };
}

export async function fetchGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, join_code")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToGroup);
}

export async function fetchGroupMembers(groupId: string): Promise<Person[]> {
  const { data, error } = await supabase
    .from("group_members")
    .select("user_id, display_name")
    .eq("group_id", groupId);
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.user_id, name: row.display_name }));
}

export async function createGroup(name: string, displayName: string): Promise<Group | null> {
  const { data, error } = await supabase.rpc("create_group", {
    p_name: name,
    p_display_name: displayName,
  });
  if (error) throw error;
  return data ? rowToGroup(data) : null;
}

export async function joinGroupByCode(code: string, displayName: string): Promise<Group | null> {
  const { data, error } = await supabase.rpc("join_group_by_code", {
    p_code: code,
    p_display_name: displayName,
  });
  if (error) throw error;
  return data ? rowToGroup(data) : null;
}

export async function leaveGroup(groupId: string): Promise<void> {
  const { error } = await supabase.from("group_members").delete().eq("group_id", groupId);
  if (error) throw error;
}
