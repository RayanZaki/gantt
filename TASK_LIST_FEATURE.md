# Frappe Gantt - Task List Feature

## Overview

The task list feature adds an embedded sidebar to the Frappe Gantt chart that displays a searchable list of tasks. This provides a familiar interface similar to the app's existing task list components.

## Features

- **Embedded sidebar** - Task list appears on the left side of the gantt chart
- **Search functionality** - Filter tasks by name in real-time
- **Task selection** - Click tasks to select and highlight them in the gantt
- **Auto-scroll** - Selecting a task automatically scrolls the gantt to show it
- **Customizable columns** - Choose which information to display (name, dates, duration, dependencies)
- **Custom formatters** - Control how task information is displayed
- **Responsive design** - Works with dark mode and mobile layouts

## Usage

### Basic Example

```tsx
import { FrappeGantt } from '@/lib/batitrack-frappe-gantt';

<FrappeGantt
  tasks={planningItems}
  showTaskList={true}
  taskListWidth={250}
/>
```

### Full Example with All Options

```tsx
<FrappeGantt
  tasks={planningItems}
  viewMode="Week"
  
  // Enable task list
  showTaskList={true}
  taskListWidth={300}
  
  // Choose which columns to show
  taskListColumns={['name', 'dates', 'duration', 'dependencies']}
  
  // Custom formatters
  formatTaskName={(task) => task.name}
  formatTaskDates={(task) => {
    const start = new Date(task.start);
    const end = new Date(task.end);
    return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
  }}
  formatTaskDuration={(task) => {
    const days = Math.ceil(
      (new Date(task.end).getTime() - new Date(task.start).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    return `${days} jour${days !== 1 ? 's' : ''}`;
  }}
  
  // Event handlers
  onTaskListClick={(task) => console.log('Task clicked:', task)}
  onTaskListSelect={(task) => console.log('Task selected:', task)}
/>
```

## Props

### Task List Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showTaskList` | `boolean` | `false` | Enable/disable the task list sidebar |
| `taskListWidth` | `number` | `250` | Width of the task list in pixels |
| `taskListColumns` | `Array<'name' \| 'dates' \| 'duration' \| 'dependencies'>` | `['name', 'dates', 'duration']` | Which columns to display |
| `formatTaskName` | `(task: Task) => string` | `(task) => task.name` | Custom formatter for task name |
| `formatTaskDates` | `(task: Task) => string` | Built-in formatter | Custom formatter for dates |
| `formatTaskDuration` | `(task: Task) => string` | Built-in formatter | Custom formatter for duration |
| `onTaskListClick` | `(task: Task) => void` | `null` | Callback when task is clicked |
| `onTaskListSelect` | `(task: Task) => void` | `null` | Callback when task is selected |

## Styling

The task list automatically inherits styles and supports:

- Light/dark mode
- Responsive design
- Custom scrollbars
- Hover states
- Selection highlighting

### CSS Variables

The task list respects these CSS variables:

```css
/* Colors automatically match your theme */
--background
--foreground
--border
--muted
--muted-foreground
```

## Integration Example

Here's how to integrate the task list with your existing planning/retro-planning components:

```tsx
import { FrappeGantt } from '@/lib/batitrack-frappe-gantt';
import type { PlanningItem } from '@/api/types/planning';

interface GanttChartProps {
  planningItems: PlanningItem[];
  selectedTaskId?: string;
  onTaskSelect?: (taskId: string) => void;
}

export function GanttChart({ planningItems, selectedTaskId, onTaskSelect }: GanttChartProps) {
  const tasks = planningItems.map(item => ({
    id: item.id.toString(),
    name: item.name,
    start: item.start_date,
    end: item.end_date,
    progress: 0,
    dependencies: item.dependencies?.join(','),
  }));

  return (
    <FrappeGantt
      tasks={tasks}
      viewMode="Week"
      showTaskList={true}
      taskListWidth={280}
      taskListColumns={['name', 'dates', 'duration', 'dependencies']}
      
      formatTaskName={(task) => task.name}
      formatTaskDates={(task) => {
        const start = new Date(task.start);
        const end = new Date(task.end);
        return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
      }}
      formatTaskDuration={(task) => {
        const days = Math.ceil(
          (new Date(task.end).getTime() - new Date(task.start).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        return `${days} jour${days !== 1 ? 's' : ''}`;
      }}
      
      onTaskListSelect={(task) => {
        if (onTaskSelect) {
          onTaskSelect(task.id);
        }
      }}
    />
  );
}
```

## Technical Details

### Architecture

- `task_list.js` - Core TaskList class
- `task_list.css` - Styling for the task list
- `index.js` - Integration with main Gantt class
- `FrappeGantt.tsx` - React wrapper with task list props

### How It Works

1. Task list is created as a separate container alongside the SVG gantt
2. The gantt SVG is shifted right using `margin-left` to make room
3. Search filtering happens in real-time without re-rendering the gantt
4. Task selection triggers `scrollIntoView` on the corresponding gantt bar
5. State is managed independently but synchronized with the gantt instance

### Performance

- Efficient filtering using native array methods
- Virtual scrolling for large task lists (future enhancement)
- Minimal re-renders - only the task list updates on search

## Future Enhancements

Potential improvements for the task list:

- [ ] Virtual scrolling for 100+ tasks
- [ ] Drag and drop task reordering
- [ ] Bulk selection with checkboxes
- [ ] Custom actions menu per task
- [ ] Export task list to CSV/PDF
- [ ] Collapsible groups/categories
- [ ] Task status indicators
- [ ] Progress bars in the list
