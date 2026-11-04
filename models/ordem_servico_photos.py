# -*- coding: utf-8 -*-
from odoo import api, fields, models, _


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
    attachment_ids = fields.Many2many(
        'ir.attachment', string='Arquivos')

    def action_anexar(self):
        self.ensure_one()
        if not self.attachment_ids:
            return {'type': 'ir.actions.act_window_close'}
        setor = self.setor
        if setor == 'producao':
            self.ordem_servico_id.fotos_producao = [(4, att.id) for att in self.attachment_ids]
        elif setor == 'acabamento':
            self.ordem_servico_id.fotos_acabamento = [(4, att.id) for att in self.attachment_ids]
        elif setor == 'inspecao':
            self.ordem_servico_id.fotos_inspecao = [(4, att.id) for att in self.attachment_ids]
        elif setor == 'embalagem':
            self.ordem_servico_id.fotos_embalagem = [(4, att.id) for att in self.attachment_ids]
        elif setor == 'entrega':
            self.ordem_servico_id.fotos_entrega = [(4, att.id) for att in self.attachment_ids]
        return {'type': 'ir.actions.act_window_close'}


class OrdemServico(models.Model):
    _inherit = "ordem.servico"

    fotos_producao = fields.Many2many(
        'ir.attachment', 'ordem_servico_fotos_producao_rel',
        'ordem_servico_id', 'attachment_id', string='Fotos Produção')
    fotos_acabamento = fields.Many2many(
        'ir.attachment', 'ordem_servico_fotos_acabamento_rel',
        'ordem_servico_id', 'attachment_id', string='Fotos Acabamento')
    fotos_inspecao = fields.Many2many(
        'ir.attachment', 'ordem_servico_fotos_inspecao_rel',
        'ordem_servico_id', 'attachment_id', string='Fotos Inspeção')
    fotos_embalagem = fields.Many2many(
        'ir.attachment', 'ordem_servico_fotos_embalagem_rel',
        'ordem_servico_id', 'attachment_id', string='Fotos Embalagem')
    fotos_entrega = fields.Many2many(
        'ir.attachment', 'ordem_servico_fotos_entrega_rel',
        'ordem_servico_id', 'attachment_id', string='Fotos Entrega')

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
