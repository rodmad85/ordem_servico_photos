odoo.define('ordem_servico_photos.photos_gallery', function (require) {
    "use strict";

    const AbstractField = require('web.AbstractField');
    const fieldRegistry = require('web.field_registry');
    const core = require('web.core');

    const _t = core._t;

    const PhotosGallery = AbstractField.extend({
        template: 'ordem_servico_photos.os_fotos_gallery',
        events: {
            'click .o_os_foto_thumb': '_onClickThumb',
            'click .o_os_close_lightbox': '_onCloseLightbox',
            'click .o_os_lightbox_backdrop': '_onCloseLightbox',
        },

        init: function (parent, name, record, options) {
            this._super.apply(this, arguments);
            this.attachments = [];
            this.currentIndex = 0;
        },

        willStart: function () {
            var self = this;
            return this._super().then(function () {
                return self._fetchAttachments();
            });
        },

        _fetchAttachments: function () {
            var self = this;
            var linhaIds = this.value || [];
            if (!linhaIds.length) {
                return Promise.resolve();
            }
            var model = this.modelName || 'os.fotos.linha';
            return this._rpc({
                model: model,
                method: 'search_read',
                domain: [['id', 'in', linhaIds]],
                fields: ['attachment_id', 'name', 'setor'],
                limit: 100,
            }).then(function (linhas) {
                var attachmentIds = _.compact(_.map(linhas, function (l) {
                    return l.attachment_id ? l.attachment_id[0] : false;
                }));
                if (!attachmentIds.length) {
                    self.attachments = [];
                    return;
                }
                return self._rpc({
                    model: 'ir.attachment',
                    method: 'search_read',
                    domain: [['id', 'in', attachmentIds]],
                    fields: ['name', 'datas', 'mimetype', 'url'],
                    limit: 100,
                }).then(function (records) {
                    self.attachments = records;
                });
            });
        },

        _onClickThumb: function (e) {
            var index = parseInt($(e.currentTarget).data('index'), 10);
            this.currentIndex = index;
            this.$('.o_os_lightbox').removeClass('o_hidden');
            this.$('.o_os_lightbox_backdrop').show();
            this._updateLightboxImage();
        },

        _onCloseLightbox: function () {
            this.$('.o_os_lightbox').addClass('o_hidden');
            this.$('.o_os_lightbox_backdrop').hide();
        },

        _updateLightboxImage: function () {
            var att = this.attachments[this.currentIndex];
            var src = att.datas
                ? 'data:' + att.mimetype + ';base64,' + att.datas
                : (att.url || '/web/content/' + att.id);
            this.$('.o_os_lightbox_img').attr('src', src);
            this.$('.o_os_lightbox_caption').text(att.name || '');
            this.$('.o_os_lightbox_counter').text(
                (this.currentIndex + 1) + ' / ' + this.attachments.length
            );
        },
    });

    fieldRegistry.add('os_fotos_gallery', PhotosGallery);

    return PhotosGallery;
});
