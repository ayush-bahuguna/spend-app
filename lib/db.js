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
    litres:      row.litres ?? undefined,
  };
}

function groupFromRow(row) {
  return {
    id:        row.id,
    name:      row.name,
    icon:      row.icon,
    joinCode:  row.join_code,
    createdAt: row.created_at,
    members:   (row.group_members || []).map(m => ({ id: m.id, name: m.name, userId: m.user_id ?? null })),
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
      litres:       expense.litres ?? null,
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
      group_members ( id, name, user_id ),
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

  const creatorRow = { id: group.creatorMember.id, group_id: group.id, name: group.creatorMember.name, user_id: userId };
  const otherRows  = group.members.map(m => ({ id: m.id, group_id: group.id, name: m.name }));
  const { error: mErr } = await supabase.from('group_members').insert([creatorRow, ...otherRows]);
  if (mErr) throw mErr;

  return {
    ...group,
    joinCode,
    members: [
      { id: group.creatorMember.id, name: group.creatorMember.name, userId: userId },
      ...group.members.map(m => ({ ...m, userId: null })),
    ],
  };
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

export async function joinGroupByCode(userId, code, joinerName) {
  const supabase = getSupabase();

  // Step 1: look up the group id by code (minimal select — user not yet a member)
  const { data: basic, error: lookupErr } = await supabase
    .from('groups')
    .select('id')
    .eq('join_code', code.toUpperCase().trim())
    .maybeSingle();

  if (lookupErr) throw lookupErr;
  if (!basic) return null;

  // Step 2: add user to group_access BEFORE fetching nested data
  // (group_members / group_expenses RLS requires membership)
  await supabase
    .from('group_access')
    .upsert({ group_id: basic.id, user_id: userId }, { onConflict: 'group_id,user_id' });

  // Step 2b: add joiner as a linked member if not already present
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', basic.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingMember) {
    await supabase.from('group_members').insert({
      id:       'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      group_id: basic.id,
      name:     joinerName || 'ME',
      user_id:  userId,
    });
  }

  // Step 3: now fetch the full group with members + expenses (RLS passes)
  const { data: group, error: fullErr } = await supabase
    .from('groups')
    .select(`
      id, name, icon, join_code, created_at,
      group_members ( id, name, user_id ),
      group_expenses ( id, amount, category, date, note, paid_by_id, split_type, splits )
    `)
    .eq('id', basic.id)
    .single();

  if (fullErr) throw fullErr;
  return groupFromRow(group);
}

export async function upsertManyGroups(userId, groups) {
  if (!groups.length) return;
  for (const group of groups) {
    await createGroup(userId, group).catch(() => {});
  }
}

// ─── Car Trips ───────────────────────────────────────────────────────────────

export async function fetchCarTrips(userId) {
  const { data, error } = await getSupabase()
    .from('car_trips')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(row => ({
    id:       row.id,
    name:     row.name,
    startOdo: Number(row.start_odo),
    endOdo:   Number(row.end_odo),
    date:     row.date,
  }));
}

export async function upsertCarTrip(userId, trip) {
  const { error } = await getSupabase()
    .from('car_trips')
    .upsert({
      id:        trip.id,
      user_id:   userId,
      name:      trip.name,
      start_odo: trip.startOdo,
      end_odo:   trip.endOdo,
      date:      trip.date,
    }, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteCarTrip(id) {
  const { error } = await getSupabase()
    .from('car_trips')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
