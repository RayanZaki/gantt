export default class TaskList {
    constructor(gantt_instance, tasks, options = {}) {
        this.gantt = gantt_instance;
        this.tasks = tasks;
        this.options = {
            show_task_list: true,
            task_list_width: 250,
            on_task_click: null,
            on_task_select: null,
            task_list_columns: ['name', 'dates', 'duration'],
            format_task_name: (task) => task.name,
            format_task_dates: (task) => {
                const start = task._start ? this.format_date(task._start) : this.format_date(task.start);
                const end = task._end ? this.format_date(task._end) : this.format_date(task.end);
                return `${start} - ${end}`;
            },
            format_task_duration: (task) => {
                const startDate = task._start || new Date(task.start);
                const endDate = task._end || new Date(task.end);
                const days = Math.ceil(
                    (endDate.getTime() - startDate.getTime()) / 
                    (1000 * 60 * 60 * 24)
                );
                return `${days} jour${days !== 1 ? 's' : ''}`;
            },
            ...options,
        };
        
        this.selected_task_id = null;
        this.search_query = '';
    }

    format_date(date) {
        if (!date) return 'N/A';
        if (typeof date === 'string') {
            date = new Date(date);
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    render() {
        if (!this.options.show_task_list) return;

        console.log('[TaskList] Rendering with', this.tasks.length, 'tasks');
        this.create_task_list_container();
        this.create_task_list_header();
        this.create_task_list_items();
        this.bind_events();
    }

    create_task_list_container() {
        // Create task list wrapper
        this.$task_list = this.gantt.create_el({
            classes: 'gantt-task-list',
            append_to: this.gantt.$container,
        });

        this.$task_list.style.width = `${this.options.task_list_width}px`;

        // Adjust gantt SVG to make room for task list
        this.gantt.$svg.style.marginLeft = `${this.options.task_list_width}px`;
    }

    create_task_list_header() {
        const $header = this.gantt.create_el({
            classes: 'gantt-task-list-header',
            append_to: this.$task_list,
        });

        // Title
        const $title = this.gantt.create_el({
            classes: 'gantt-task-list-title',
            append_to: $header,
            innerHTML: '<h3>Planification</h3>',
        });

        // Search input
        const $search_wrapper = this.gantt.create_el({
            classes: 'gantt-task-list-search',
            append_to: $header,
        });

        const $search_input = this.gantt.create_el({
            tag: 'input',
            classes: 'gantt-task-list-search-input',
            append_to: $search_wrapper,
        });
        $search_input.type = 'text';
        $search_input.placeholder = 'Rechercher une tâche...';
        
        this.$search_input = $search_input;

        // Task count
        this.$task_count = this.gantt.create_el({
            classes: 'gantt-task-list-count',
            append_to: $header,
            innerHTML: `${this.tasks.length} tâche${this.tasks.length !== 1 ? 's' : ''}`,
        });
    }

    create_task_list_items() {
        this.$items_container = this.gantt.create_el({
            classes: 'gantt-task-list-items',
            append_to: this.$task_list,
        });

        this.render_items();
    }

    render_items() {
        // Clear existing items
        this.$items_container.innerHTML = '';

        // Filter tasks based on search
        const filtered_tasks = this.filter_tasks();

        console.log('[TaskList] Rendering items:', filtered_tasks.length, 'of', this.tasks.length);

        // Update count
        this.$task_count.innerHTML = 
            `${filtered_tasks.length}/${this.tasks.length} tâche${filtered_tasks.length !== 1 ? 's' : ''}`;

        if (filtered_tasks.length === 0) {
            this.render_empty_state();
            return;
        }

        // Render each task
        filtered_tasks.forEach((task) => {
            console.log('[TaskList] Rendering task:', task.name);
            this.render_task_item(task);
        });
    }

    filter_tasks() {
        if (!this.search_query.trim()) {
            return this.tasks;
        }

        const query = this.search_query.toLowerCase();
        return this.tasks.filter((task) => {
            const name = this.options.format_task_name(task).toLowerCase();
            return name.includes(query);
        });
    }

    render_empty_state() {
        const $empty = this.gantt.create_el({
            classes: 'gantt-task-list-empty',
            append_to: this.$items_container,
            innerHTML: `
                <div class="empty-icon">🔍</div>
                <p class="empty-title">Aucune tâche trouvée</p>
                <p class="empty-subtitle">Essayez une autre recherche</p>
            `,
        });
    }

    render_task_item(task) {
        const is_selected = this.selected_task_id === task.id;

        const $item = this.gantt.create_el({
            classes: is_selected
                ? 'gantt-task-list-item gantt-task-list-item-selected'
                : 'gantt-task-list-item',
            append_to: this.$items_container,
        });

        $item.dataset.taskId = task.id;

        // Task indicator dot
        const $indicator = this.gantt.create_el({
            classes: 'gantt-task-list-item-indicator',
            append_to: $item,
        });

        // Task content
        const $content = this.gantt.create_el({
            classes: 'gantt-task-list-item-content',
            append_to: $item,
        });

        // Task name
        const $name = this.gantt.create_el({
            classes: 'gantt-task-list-item-name',
            append_to: $content,
            innerHTML: this.options.format_task_name(task),
        });

        // Task details
        const $details = this.gantt.create_el({
            classes: 'gantt-task-list-item-details',
            append_to: $content,
        });

        // Dates
        if (this.options.task_list_columns.includes('dates')) {
            const $dates = this.gantt.create_el({
                classes: 'gantt-task-list-item-dates',
                append_to: $details,
                innerHTML: this.options.format_task_dates(task),
            });
        }

        // Duration
        if (this.options.task_list_columns.includes('duration')) {
            const $duration = this.gantt.create_el({
                classes: 'gantt-task-list-item-duration',
                append_to: $details,
                innerHTML: this.options.format_task_duration(task),
            });
        }

        // Dependencies count
        if (
            this.options.task_list_columns.includes('dependencies') &&
            task.dependencies &&
            task.dependencies.length > 0
        ) {
            const $dependencies = this.gantt.create_el({
                classes: 'gantt-task-list-item-dependencies',
                append_to: $details,
                innerHTML: `${task.dependencies.length} dépendance${task.dependencies.length !== 1 ? 's' : ''}`,
            });
        }
    }

    bind_events() {
        // Search input
        this.$search_input.addEventListener('input', (e) => {
            this.search_query = e.target.value;
            this.render_items();
        });

        // Task item clicks
        this.$items_container.addEventListener('click', (e) => {
            const $item = e.target.closest('.gantt-task-list-item');
            if (!$item) return;

            const task_id = $item.dataset.taskId;
            this.select_task(task_id);

            if (this.options.on_task_click) {
                const task = this.tasks.find((t) => t.id === task_id);
                this.options.on_task_click(task);
            }
        });
    }

    select_task(task_id) {
        // Update selection
        this.selected_task_id = task_id;

        // Update UI
        const $items = this.$items_container.querySelectorAll(
            '.gantt-task-list-item',
        );
        $items.forEach(($item) => {
            if ($item.dataset.taskId === task_id) {
                $item.classList.add('gantt-task-list-item-selected');
            } else {
                $item.classList.remove('gantt-task-list-item-selected');
            }
        });

        // Scroll to task bar in gantt
        const bar = this.gantt.get_bar(task_id);
        if (bar) {
            bar.$bar.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }

        // Callback
        if (this.options.on_task_select) {
            const task = this.tasks.find((t) => t.id === task_id);
            this.options.on_task_select(task);
        }
    }

    update_tasks(tasks) {
        this.tasks = tasks;
        this.render_items();
    }

    destroy() {
        if (this.$task_list) {
            this.$task_list.remove();
            this.gantt.$svg.style.marginLeft = '0';
        }
    }
}
