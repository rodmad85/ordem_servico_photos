odoo.define('ordem_servico_photos.os_fotos_multi_upload', function (require) {
    "use strict";

    const AbstractField = require('web.AbstractField');
    const fieldRegistry = require('web.field_registry');
    const core = require('web.core');

    const _t = core._t;

    const OsFotosMultiUpload = AbstractField.extend({
        template: 'ordem_servico_photos.os_fotos_multi_upload',
        events: {
            'change .o_os_file_input': '_onFilesSelected',
            'click .o_os_add_more': '_onAddMore',
        },

        init: function (parent, name, record, options) {
            this._super.apply(this, arguments);
            this.files = [];
            this.ordem_servico_id = record.data.ordem_servico_id
                ? record.data.ordem_servico_id[0]
                : false;
            this.setor = record.data.setor || 'producao';
        },

        willStart: function () {
            return this._super();
        },

        _onFilesSelected: function (e) {
            var self = this;
            var fileList = e.target.files;
            if (!fileList || !fileList.length) {
                return;
            }
            var files = Array.from(fileList);
            self.files = self.files.concat(files);
            self._renderFiles();
            e.target.value = '';
        },

        _onAddMore: function () {
            this.$('.o_os_file_input').click();
        },

        _renderFiles: function () {
            var self = this;
            var $list = this.$('.o_os_files_list');
            $list.empty();
            _.each(self.files, function (file, index) {
                var $item = $('<div>').addClass('o_os_file_item');
                $item.text(file.name + ' (' + self._formatSize(file.size) + ')');
                var $remove = $('<button>')
                    .addClass('o_os_remove_file oe_link')
                    .text('Remover')
                    .data('index', index);
                $item.append($remove);
                $list.append($item);
            });
            this.$('.o_os_remove_file').off('click').on('click', function () {
                var idx = parseInt($(this).data('index'), 10);
                self.files.splice(idx, 1);
                self._renderFiles();
            });
        },

        _formatSize: function (bytes) {
            if (bytes === 0) return '0 Bytes';
            var k = 1024;
            var sizes = ['Bytes', 'KB', 'MB', 'GB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        _uploadFiles: function () {
            var self = this;
            if (!self.files.length) {
                return Promise.resolve();
            }
            if (!self.ordem_servico_id) {
                return Promise.reject(_t('Ordem de Serviço não definida.'));
            }
            var uploadPromises = _.map(self.files, function (file) {
                return new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var datas = e.target.result.split(',')[1];
                        self._rpc({
                            model: 'ir.attachment',
                            method: 'create',
                            args: [{
                                'name': file.name,
                                'type': 'binary',
                                'datas': datas,
                                'res_model': 'ordem.servico',
                                'res_id': self.ordem_servico_id,
                            }],
                        }).then(function (attachmentId) {
                            return self._rpc({
                                model: 'os.fotos.linha',
                                method: 'create',
                                args: [{
                                    'ordem_servico_id': self.ordem_servico_id,
                                    'setor': self.setor,
                                    'attachment_id': attachmentId,
                                    'name': file.name,
                                }],
                            });
                        }).then(resolve).catch(reject);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            return Promise.all(uploadPromises).then(function () {
                self.files = [];
                self._renderFiles();
                self.trigger_up('field_changed', {
                    dataValue: self.value,
                });
            });
        },

        _onSave: function (e) {
            e.preventDefault();
            var self = this;
            self._uploadFiles().then(function () {
                self._closeWizard();
            });
        },

        _closeWizard: function () {
            // Dispara o fechamento do wizard via odoo
            this.trigger_up('close_dialog');
        },
    });

    fieldRegistry.add('os_fotos_multi_upload', OsFotosMultiUpload);

    return OsFotosMultiUpload;
});
