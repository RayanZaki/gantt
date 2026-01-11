export default class Popup {
    constructor(parent, popup_func, gantt) {
        this.parent = parent;
        this.popup_func = popup_func;
        this.gantt = gantt;

        this.make();
    }

    make() {
        this.parent.innerHTML = `
            <div class="title"></div>
            <div class="subtitle"></div>
            <div class="details"></div>
            <div class="actions"></div>
        `;
        this.hide();

        this.title = this.parent.querySelector('.title');
        this.subtitle = this.parent.querySelector('.subtitle');
        this.details = this.parent.querySelector('.details');
        this.actions = this.parent.querySelector('.actions');
    }

    show({ x, y, task, target }) {
        this.actions.innerHTML = '';
        let html = this.popup_func({
            task,
            chart: this.gantt,
            get_title: () => this.title,
            set_title: (title) => (this.title.innerHTML = title),
            get_subtitle: () => this.subtitle,
            set_subtitle: (subtitle) => (this.subtitle.innerHTML = subtitle),
            get_details: () => this.details,
            set_details: (details) => (this.details.innerHTML = details),
            add_action: (html, func) => {
                let action = this.gantt.create_el({
                    classes: 'action-btn',
                    type: 'button',
                    append_to: this.actions,
                });
                if (typeof html === 'function') html = html(task);
                action.innerHTML = html;
                action.onclick = (e) => func(task, this.gantt, e);
            },
        });
        if (html === false) return;
        if (html) this.parent.innerHTML = html;

        if (this.actions.innerHTML === '') this.actions.remove();
        else this.parent.appendChild(this.actions);

        // Initially position the popup
        this.parent.style.left = x + 10 + 'px';
        this.parent.style.top = y - 10 + 'px';
        this.parent.classList.remove('hide');

        // Get container and popup dimensions
        const container = this.gantt.$container;
        const containerRect = container.getBoundingClientRect();
        const popupRect = this.parent.getBoundingClientRect();
        
        // Calculate overflow and adjust position if needed
        let finalX = x + 10;
        let finalY = y - 10;
        
        // Check right overflow
        if (popupRect.right > containerRect.right) {
            finalX = x - popupRect.width - 10;
        }
        
        // Check bottom overflow
        if (popupRect.bottom > containerRect.bottom) {
            finalY = y - popupRect.height - 10;
        }
        
        // Check top overflow (after adjustment)
        if (finalY < 0) {
            finalY = y + 20; // Position below the cursor
        }
        
        // Check left overflow (after adjustment)
        if (finalX < 0) {
            finalX = 10;
        }
        
        // Apply final position
        this.parent.style.left = finalX + 'px';
        this.parent.style.top = finalY + 'px';
    }

    hide() {
        this.parent.classList.add('hide');
    }
}
