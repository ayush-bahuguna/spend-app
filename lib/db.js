'use client';
import { getSupabase } from './supabase';

// ─── Helpers ────────────────────────────────────────────────────────────────

function expenseFromRow(row) {
  return {
    id:          row.id,
    amount:      Number(row.amount),
    category:    row.category,
    date:        row.date,
    note:        row.note || '',
    iconVariant: row.icon_variant ?? undefined,
    split:       row.split ?? null,
  };
}

function groupFromRow(row) {
  return {
    id:        row.id,
    name:      row.name,
    icon:      row.icon,
    joinCode:  row.join_code,
    createdAt: row.created_at,
    members:   (row.group_members || []).map(m => ({ id: m.id, name: m.name })),
    expenses:  (row.group_expenses || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(e => ({
        id:        e.id,
        amount:    Number(e.amount),
        category:  e.category,
        date:      e.date,
        note:      e.note || '',
        paidById:  e.paid_by_id,
        splitType: e.split_type,
        splits:    e.splits,
      })),
  };
}

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function updateGroupJoinCode(groupId) {
  const supabase = getSupabase();
  let joinCode;
  for (let i = 0; i < 3; i++) {
    joinCode = generateJoinCode();
    const { data } = await supabase.from('groups').select('id').eq('join_code', joinCode).maybeSingle();
    if (!data) break;
  }
  const { error } = await supabase.from('groups').update({ join_code: joinCode }).eq('id', groupId);
  if (error) throw error;
  return joinCode;
}

// ─── Personal Expenses ───────────────────────────────────────────────────────

export async function fetchExpenses(userId) {
  const { data, error } = await getSupabase()
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(expenseFromRow);
}

export async function upsertExpense(userId, expense) {
  const { error } = await getSupabase()
    .from('expenses')
    .upsert({
      id:           expense.id,
      user_id:      userId,
      amount:       expense.amount,
      category:     expense.category,
      date:         expense.date,
      note:         expense.note || '',
      icon_variant: expense.iconVariant ?? null,
      split:        expense.split ?? null,
    }, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteExpense(id) {
  const { error } = await getSupabase()
    .from('expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function upsertManyExpenses(userId, expenses) {
  if (!expenses.length) return;
  const rows = expenses.map(e => ({
    id:           e.id,
    user_id:      userId,
    amount:       e.amount,
    category:     e.category,
    date:         e.date,
    note:         e.note || '',
    icon_variant: e.iconVariant ?? null,
    split:        e.split ?? null,
  }));
  const { error } = await getSupabase()
    .from('expenses')
    .upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export async function fetchGroups(userId) {
  const { data, error } = await getSupabase()
    .from('groups')
    .select(`
      id, name, icon, join_code, created_at,
      group_members ( id, name ),
      group_expenses ( id, amount, category, date, note, paid_by_id, split_type, splits )
    `)
    .in('id',
      getSupabase()
        .from('group_access')
        .select('group_id')
        .eq('user_id', userId)
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(groupFromRow);
}

export async function createGroup(userId, group) {
  const supabase = getSupabase();

  // Try up to 3 times to get a unique join code
  let joinCode;
  for (let i = 0; i < 3; i++) {
    joinCode = generateJoinCode();
    const { data } = await supabase.from('groups').select('id').eq('join_code', joinCode).maybeSingle();
    if (!data) break;
  }

  const { error: gErr } = await supabase
    .from('groups')
    .insert({ id: group.id, name: group.name, icon: group.icon, join_code: joinCode, created_by: userId, created_at: group.createdAt });
  if (gErr) throw gErr;

  const { error: aErr } = await supabase
    .from('group_access')
    .insert({ group_id: group.id, user_id: userId });
  if (aErr) throw aErr;

  if (group.members.length) {
    const memberRows = group.members.map(m => ({ id: m.id, group_id: group.id, name: m.name }));
    const { error: mErr } = await supabase.from('group_members').insert(memberRows);
    if (mErr) throw mErr;
  }

  return { ...group, joinCode };
}

export async function deleteGroup(groupId) {
  const { error } = await getSupabase()
    .from('groups')
    .delete()
    .eq('id', groupId);
  if (error) throw error;
}

export async function addGroupExpense(groupId, expense) {
  const { error } = await getSupabase()
    .from('group_expenses')
    .insert({
      id:         expense.id,
      group_id:   groupId,
      amount:     expense.amount,
      category:   expense.category,
      date:       expense.date,
      note:       expense.note || '',
      paid_by_id: expense.paidById,
      split_type: expense.splitType,
      splits:     expense.splits,
    });
  if (error) throw error;
}

export async function joinGroupByCode(userId, code) {
  const supabase = getSupabase();

  const { data: group, error: gErr } = await supabase
    .from('groups')
    .select(`
      id, name, icon, join_code, created_at,
      group_members ( id, name ),
      group_expenses ( id, amount, category, date, note, paid_by_id, split_type, splits )
    `)
    .eq('join_code', code.toUpperCase().trim())
    .maybeSingle();

  if (gErr) throw gErr;
  if (!group) return null;

  // Insert access row — ignore conflict if already a member
  await supabase
    .from('group_access')
    .upsert({ group_id: group.id, user_id: userId }, { onConflict: 'group_id,user_id' });

  return groupFromRow(group);
}

export async function upsertManyGroups(userId, groups) {
  if (!groups.length) return;
  for (const group of groups) {
    await createGroup(userId, group).catch(() => {});
  }
}
