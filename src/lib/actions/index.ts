'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateOrderRef } from '@/lib/utils';
import type { OrderStatus, AppointmentKind } from '@/lib/types';

// =================== CLIENTES ===================
export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const payload = {
    full_name: String(formData.get('full_name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
    city: String(formData.get('city') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    created_by: user.id,
  };

  if (!payload.full_name) throw new Error('El nombre es obligatorio');

  const { error } = await supabase.from('clients').insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath('/clientes');
  redirect('/clientes');
}

// =================== PEDIDOS ===================
export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const payload = {
    reference: String(formData.get('reference') ?? generateOrderRef()).trim(),
    client_id: (formData.get('client_id') as string) || null,
    model: String(formData.get('model') ?? '').trim(),
    delivery_address: String(formData.get('delivery_address') ?? '').trim() || null,
    delivery_city: String(formData.get('delivery_city') ?? '').trim() || null,
    delivery_date: (formData.get('delivery_date') as string) || null,
    status: (formData.get('status') as OrderStatus) || 'presupuesto',
    price_eur: formData.get('price_eur') ? Number(formData.get('price_eur')) : null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    created_by: user.id,
  };

  if (!payload.model) throw new Error('El modelo es obligatorio');

  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  revalidatePath('/pedidos');
  redirect(`/pedidos/${data.id}`);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw new Error(error.message);
  revalidatePath('/pedidos');
  revalidatePath(`/pedidos/${orderId}`);
}

// =================== CITAS ===================
export async function createAppointment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const payload = {
    title: String(formData.get('title') ?? '').trim(),
    kind: (formData.get('kind') as AppointmentKind) || 'otro',
    starts_at: String(formData.get('starts_at') ?? ''),
    ends_at: String(formData.get('ends_at') ?? ''),
    location: String(formData.get('location') ?? '').trim() || null,
    order_id: (formData.get('order_id') as string) || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    created_by: user.id,
  };

  if (!payload.title || !payload.starts_at || !payload.ends_at) {
    throw new Error('Faltan campos obligatorios');
  }

  const { error } = await supabase.from('appointments').insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath('/calendario');
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/calendario');
}

// =================== AUTH ===================
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
