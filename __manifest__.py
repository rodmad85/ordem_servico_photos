# Copyright 2026 Madureira Ind. e Com.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    'name': 'Ordem de Serviço - Fotos por Setor',
    'description': """
        Módulo responsável por anexar fotos de imagem (ou tirar foto pela câmera)
        vinculadas a cada setor (Produção, Acabamento, Inspeção, Embalagem, Entrega)
        de uma Ordem de Serviço.
    """,
    'version': '16.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'Madureira Ind. e Com.',
    'website': 'www.madureira.ind.br',
    'depends': [
        'ordem_servico',
        'web',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/ordem_servico_photos.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'ordem_servico_photos/static/src/css/photos_gallery.css',
            'ordem_servico_photos/static/src/js/photos_gallery.js',
            'ordem_servico_photos/static/src/xml/photos_gallery.xml',
            'ordem_servico_photos/static/src/css/os_fotos_multi_upload.css',
            'ordem_servico_photos/static/src/js/os_fotos_multi_upload.js',
            'ordem_servico_photos/static/src/xml/os_fotos_multi_upload.xml',
        ],
    },
    'installable': True,
    'application': False,
}
