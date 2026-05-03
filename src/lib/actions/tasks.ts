'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { TaskArea, TaskStatus, TaskPriority } from '@/lib/types';

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const payload = {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim() || null,
    area: (formData.get('area') as TaskArea) || 'taller',
    priority: (formData.get('priority') as TaskPriority) || 'normal',
    assignee_id: (formData.get('assignee_id') as string) || null,
    order_id: (formData.get('order_id') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
    created_by: user.id,
  };

  if (!payload.title) throw new Error('El título es obligatorio');

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tareas');
  redirect(`/tareas/${data.id}`);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
  if (error) throw new Error(error.message);
  revalidatePath('/tareas');
  revalidatePath(`/tareas/${taskId}`);
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim() || null,
    area: (formData.get('area') as TaskArea) || 'taller',
    status: (formData.get('status') as TaskStatus) || 'pendiente',
    priority: (formData.get('priority') as TaskPriority) || 'normal',
    assignee_id: (formData.get('assignee_id') as string) || null,
    order_id: (formData.get('order_id') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  };

  const { error } = await supabase.from('tasks').update(payload).eq('id', taskId);
  if (error) throw new Error(error.message);

  revalidatePath('/tareas');
  revalidatePath(`/tareas/${taskId}`);
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw new Error(error.message);
  revalidatePath('/tareas');
  redirect('/tareas');
}

export async function addComment(taskId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const content = String(formData.get('content') ?? '').trim();
  if (!content) return;

  const { error } = await supabase.from('comments').insert({
    task_id: taskId,
    author_id: user.id,
    content,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/tareas/${taskId}`);
}

export async function deleteComment(commentId: string, taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tareas/${taskId}`);
}
