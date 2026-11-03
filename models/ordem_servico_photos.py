# -*- coding: utf-8 -*-
from odoo import api, fields, models, _


class OsFotosLinha(models.Model):
    _name = "os.fotos.linha"
    _description = "Linha de Foto da OS"
    _order = "create_date desc"

    name = fields.Char(string='Nome', store=True)
    ordem_servico_id = fields.Many2one(
        'ordem.servico', string='Ordem de Serviço',
        ondelete='cascade', index=True, required=True)
    setor = fields.Selection(
        [('producao', 'Produção'),
         ('acabamento', 'Acabamento'),
         ('inspecao', 'Inspeção'),
         ('embalagem', 'Embalagem'),
         ('entrega', 'Entrega')],
        string='Setor', required=True, store=True)
    attachment_id = fields.Many2one(
        'ir.attachment', string='Arquivo', ondelete='cascade',
        required=True)
    datas = fields.Datetime(string='Data', default=fields.Datetime.now,
                            store=True, readonly=True)
    user_id = fields.Many2one(
        'res.users', string='Usuário',
        default=lambda self: self.env.user, store=True, readonly=True)

    @api.model
    def create(self, vals):
        record = super().create(vals)
        if record.attachment_id and not record.name:
            record.name = record.attachment_id.name
        return record


class OsFotosWizard(models.TransientModel):
    _name = "os.fotos.wizard"
    _description = "Anexar Foto à OS"

    ordem_servico_id = fields.Many2one(
        'ordem.servico', string='Ordem de Serviço',
        required=True, readonly=True)
    setor = fields.Selection(
        [('producao', 'Produção'),
         ('acabamento', 'Acabamento'),
         ('inspecao', 'Inspeção'),
         ('embalagem', 'Embalagem'),
         ('entrega', 'Entrega')],
        string='Setor', required=True)
    widget_area = fields.Char(string='Área de Upload', readonly=True)

    def action_anexar(self):
        # Upload é feito diretamente pelo widget JS via RPC
        return {'type': 'ir.actions.act_window_close'}


class OrdemServico(models.Model):
    _inherit = "ordem.servico"

    fotos_linhas = fields.One2many(
        'os.fotos.linha', 'ordem_servico_id', string='Fotos por Setor')

    def action_anexar_foto(self):
        self.ensure_one()
        setor = self.env.context.get('setor')
        action = self.env.ref('ordem_servico_photos.os_fotos_wizard_action')
        result = action.read()[0]
        result['context'] = {
            'default_ordem_servico_id': self.id,
            'default_setor': setor,
        }
        return result
