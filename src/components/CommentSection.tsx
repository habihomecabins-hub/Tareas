'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { addComment, deleteComment } from '@/lib/actions/tasks';
import { createClient } from '@/lib/supabase/client';
import { initials, relativeTime, cn } from '@/lib/utils';

interface CommentWithAuthor {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author?: { id: string; full_name: string } | null;
}

export function CommentSection({
  taskId,
  comments: initialComments,
}: {
  taskId: string;
  comments: CommentWithAuthor[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [pending, startTransition] = useTransition();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setComments(initialComments), [initialComments]);

  // Obtener usuario actual + suscripción realtime
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));

    const channel = supabase
      .channel(`task-${taskId}-comments`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `task_id=eq.${taskId}` },
        async (payload) => {
          const { data: author } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', (payload.new as any).author_id)
            .single();
          setComments((prev) => {
            if (prev.find((c) => c.id === (payload.new as any).id)) return prev;
            return [...prev, { ...(payload.new as any), author }];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments', filter: `task_id=eq.${taskId}` },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  // Auto-scroll al final
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [comments.length]);

  async function handleSubmit(formData: FormData) {
    const text = String(formData.get('content') ?? '').trim();
    if (!text) return;
    setContent('');
    startTransition(async () => {
      await addComment(taskId, formData);
    });
  }

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="font-medium text-sm">Comentarios</div>
        <div className="text-xs text-muted">{comments.length}</div>
      </div>

      <div ref={listRef} className="max-h-96 overflow-y-auto px-4 py-3 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center text-muted text-sm py-6">
            Aún no hay comentarios. Sé el primero en escribir.
          </div>
        ) : (
          comments.map((c) => {
            const mine = c.author_id === currentUserId;
            return (
              <div
                key={c.id}
                className={cn('flex gap-2.5 group', mine && 'flex-row-reverse')}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0',
                    mine ? 'bg-ink text-bg' : 'bg-surface-2 text-ink'
                  )}
                >
                  {initials(c.author?.full_name)}
                </div>
                <div className={cn('flex-1 max-w-[80%]', mine && 'flex flex-col items-end')}>
                  <div
                    className={cn(
                      'rounded-2xl px-3.5 py-2 text-sm',
                      mine ? 'bg-ink text-bg rounded-tr-sm' : 'bg-surface-2 text-ink rounded-tl-sm'
                    )}
                  >
                    {!mine && c.author && (
                      <div className="text-[11px] font-semibold mb-0.5 text-muted">
                        {c.author.full_name}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{c.content}</div>
                  </div>
                  <div className="text-[10px] text-muted mt-1 px-1 flex items-center gap-2">
                    {relativeTime(c.created_at)}
                    {mine && (
                      <button
                        type="button"
                        onClick={() => deleteComment(c.id, taskId)}
                        className="opacity-0 group-hover:opacity-100 hover:text-danger transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        ref={formRef}
        action={handleSubmit}
        className="border-t border-border p-3 flex gap-2 items-end bg-surface-2/40"
      >
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un mensaje…"
          rows={1}
          className="input flex-1 resize-none min-h-[42px] max-h-32 py-2.5"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (content.trim()) formRef.current?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="btn-primary !p-2.5 aspect-square"
          aria-label="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
