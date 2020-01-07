var Router = require('restify-router').Router;;
var router = new Router();
var map = require('bateeq-module').inventory.map;
var StorageManager = require('bateeq-module').master.StorageManager;
var InventoryManager = require('bateeq-module').inventory.InventoryManager;
var InventoryMovementManager = require('bateeq-module').inventory.InventoryMovementManager;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');
const apiVersion = '1.0.0';

router.get('/:storageId/inventories/:itemId/movements',passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryMovementManager(db, request.user);

        var storageId = request.params.storageId;
        var itemId = request.params.itemId;
        var query = request.query;
        const moment = require('moment');


        manager.readByStorageIdAndItemId(storageId, itemId, query)
            .then(docs => {
                // var result = resultFormatter.ok(apiVersion, 200, docs.data);
                // delete docs.data;
                // result.info = docs;
                // response.send(200, result);
                if ((request.headers.accept || '').toString().indexOf("application/xls") < 0) {
                    var result = resultFormatter.ok(apiVersion, 200, docs.data);
                    delete docs.data;
                    result.info = docs;
                    response.send(200, result);
                } else {
                    var result = resultFormatter.ok(apiVersion, 200, docs.data);
                    var data = docs.data;
                    var data = []
                    delete docs.data;
                    result.info = docs;
                    //var result = [];
                    for (const doc of result.data) {
                        const _data = {
                            "Kode Toko": doc.storage.code,
                            "Nama": doc.storage.name,
                            "Barcode": doc.item.code,
                            "Nama Barang": doc.item.name,
                            "Tanggal": moment(doc.date, "YYYY-MM-DDTHH:mm:SSSZ").format("DD MMM YYYY - HH:mm:SS"),
                            "Referensi" : doc.reference,
                            "Tipe" : doc.type,
                            "Sebelum" : doc.before,
                            "Kuantitas" : doc.quantity,
                            "Setelah" : doc.after,
                            "Keterangan" : doc.remark
                        }
                        data.push(_data);
                    }
                    var options = {
                        "Kode Toko": "string",
                        "Nama": "string",
                        "Barcode": "string",
                        "Nama Barang": "string",
                        "Tanggal" : "date",
                        "Referensi" : "string",
                        "Tipe" : "string",
                        "Sebelum" : "number",
                        "Kuantitas": "number",
                        "Setelah" : "number",
                        "Keterangan" : "string"
                    };
                    response.xls(`Report Movement Stock.xlsx`, data, options);
                }
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/:storageId/inventories/:itemId/movements/:id',passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryMovementManager(db, request.user);

        var storageId = request.params.storageId;
        var itemId = request.params.itemId;
        var id = request.params.id;

        manager.getByStorageIdAndItemIdAndId(storageId, itemId, id)
            .then(doc => {
                var result = resultFormatter.ok(apiVersion, 200, doc);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

module.exports = router;