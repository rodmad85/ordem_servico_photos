import { Component } from '@odoo/owl';
import { registry } from '@web/core/registry';
import { useService } from '@web/core/utils/hooks';

export class OsFotosPreview extends Component {
    setup() {
        this.orm = useService('orm');
        this.state = { open: false, imageUrl: '', name: '' };
    }

    async onFileClick(ev) {
        ev.preventDefault();
        const attachmentId = parseInt(ev.currentTarget.dataset.id);
        if (!attachmentId) return;
        try {
            const att = await this.orm.read('ir.attachment', [attachmentId], ['datas', 'mimetype', 'name']);
            const a = att[0];
            const url = a.datas
                ? `data:${a.mimetype};base64,${a.datas}`
                : `/web/content/${attachmentId}?download=false`;
            this.state.imageUrl = url;
            this.state.name = a.name;
            this.state.open = true;
        } catch (e) {
            console.error(e);
        }
    }

    onClose() {
        this.state.open = false;
    }
}

OsFotosPreview.template = 'os_fotos_preview';
registry.category('fields').add('os_fotos_preview', OsFotosPreview);
