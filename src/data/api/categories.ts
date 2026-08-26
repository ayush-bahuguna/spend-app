import type { Scope } from "@/data/api/expenses";
import { supabase } from "@/lib/supabaseClient";
import type { Category } from "@/data/types";

export async function fetchCategories(scope: Scope): Promise<Category[]> {
  let query = supabase.from("categories").select("id, name").order("created_at", { ascending: true });
  query = scope.type === "personal" ? query.is("group_id", null) : query.eq("group_id", scope.groupId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function addCategory(scope: Scope, name: string): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, group_id: scope.type === "group" ? scope.groupId : null })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const { error } = await supabase.from("categories").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
