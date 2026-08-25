import { supabase } from "@/lib/supabaseClient";
import type { Category } from "@/data/types";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addCategory(name: string): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name })
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
