import { Component, useState } from '@odoo/owl';
import { registry } from '@web/core/registry';
import { useService } from '@web/core/utils/hooks';

export class OsFotosMultiUpload extends Component {
    setup() {
        this.state = useState({ uploading: false });
        this.orm = useService('orm');
        this.action = useService('action');
    }

    async onFilesSelected(ev) {
        try {
            const files = Array.from(ev.target.files || []);
            if (!files.length) return;

            const ordemServicoId = this.props.record.data.ordem_servico_id?.[0];
            const setor = this.props.record.data.setor || 'producao';
            if (!ordemServicoId) {
                console.error('OS não definida');
                return;
            }

            this.state.uploading = true;
            for (const file of files) {
                const base64 = await this.toBase64(file);
                const attachmentId = await this.orm.create('ir.attachment', {
                    name: file.name,
                    type: 'binary',
                    datas: base64.split(',')[1],
                    res_model: 'ordem.servico',
                    res_id: ordemServicoId,
                });
                await this.orm.create('os.fotos.linha', {
                    ordem_servico_id: ordemServicoId,
                    setor: setor,
                    attachment_id: attachmentId,
                    name: file.name,
                });
            }
            await this.action.closeDialog();
            await this.action.doAction({
                type: 'ir.actions.act_window',
                res_model: 'ordem.servico',
                res_id: ordemServicoId,
                view_mode: 'form',
                target: 'current',
            });
        } catch (error) {
            console.error('Erro upload fotos:', error);
        } finally {
            this.state.uploading = false;
            ev.target.value = '';
        }
    }

    toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }
}

OsFotosMultiUpload.template = 'os_fotos_multi_upload';
registry.category('fields').add('os_fotos_multi_upload', OsFotosMultiUpload);
