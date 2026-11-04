import { Component, useState } from '@odoo/owl';
import { registry } from '@web/core/registry';

export class OsFotosMultiUpload extends Component {
    setup() {
        this.state = useState({
            uploading: false,
        });
    }

    async onFilesSelected(ev) {
        const files = Array.from(ev.target.files);
        if (!files.length) {
            return;
        }
        const ordemServicoId = this.props.record.data.ordem_servico_id?.[0];
        const setor = this.props.record.data.setor || 'producao';
        if (!ordemServicoId) {
            console.error('Ordem de Serviço não definida');
            return;
        }
        this.state.uploading = true;
        try {
            for (const file of files) {
                const base64 = await this.toBase64(file);
                const attachmentId = await this.env.services.rpc.call({
                    model: 'ir.attachment',
                    method: 'create',
                    args: [{
                        name: file.name,
                        type: 'binary',
                        datas: base64.split(',')[1],
                        res_model: 'ordem.servico',
                        res_id: ordemServicoId,
                    }],
                });
                await this.env.services.rpc.call({
                    model: 'os.fotos.linha',
                    method: 'create',
                    args: [{
                        ordem_servico_id: ordemServicoId,
                        setor: setor,
                        attachment_id: attachmentId,
                        name: file.name,
                    }],
                });
            }
            // Fechar o wizard e reabrir o form da OS para recarregar a listagem
            this.env.services.action.closeDialog();
            this.env.services.action.doAction({
                type: 'ir.actions.act_window',
                res_model: 'ordem.servico',
                res_id: ordemServicoId,
                view_mode: 'form',
                target: 'current',
            });
        } catch (error) {
            console.error(error);
        } finally {
            this.state.uploading = false;
            ev.target.value = '';
        }
    }

    toBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
        });
    }
}

OsFotosMultiUpload.template = 'os_fotos_multi_upload';
registry.category('fields').add('os_fotos_multi_upload', OsFotosMultiUpload);
