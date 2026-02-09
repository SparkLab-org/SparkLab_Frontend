import type { Todo, TodoType } from '@/src/lib/types/planner';

type TodoLike = Pick<Todo, 'id' | 'isFixed' | 'type'>;

export function getTodoDetailHref(todo: TodoLike) {
  const type: TodoType = todo.type ?? (todo.isFixed ? '과제' : '학습');
  if (todo.isFixed || type === '과제') {
    return `/planner/assignments/${todo.id}`;
  }
  return `/planner/list/${todo.id}`;
}
