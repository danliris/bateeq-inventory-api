var Router = require('restify-router').Router;;
var router = new Router();
var StorageManager = require('bateeq-module').master.StorageManager;
var InventoryManager = require('bateeq-module').inventory.InventoryManager;
var InventoryMovementManager = require('bateeq-module').inventory.InventoryMovementManager;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");

const apiVersion = '1.0.0';

router.get('/:storageId/inventories', (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryManager(db, {
            username: 'router'
        });
        
        var storageId = request.params.storageId;
        var query = request.query;
        
        manager.readByStorageId(storageId,query)
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
                            "RO":doc.item.article.realizationOrder,
                            "Kuantitas": doc.quantity,
                            "Harga" : doc.item.domesticSale,
                            "Subtotal" : (doc.quantity)*(doc.item.domesticSale)
                        }
                        data.push(_data);
                    }
                    var options = {
                        "Kode Toko": "string",
                        "Nama": "string",
                        "Barcode": "string",
                        "Nama Barang": "string",
                        "Kuantitas": "number",
                        "Harga" : "number",
                        "Subtotal" : "number"
                    };
                    response.xls(`Report Monthly Stock.xlsx`, data, options);
                }
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/:storageId/ageinv', (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryManager(db, {
            username: 'router'
        });
        
        var storageId = request.params.storageId;
        var query = request.query;
        
        manager.getOverallStock(storageId,query)
            .then(docs => { 
            //     var result = resultFormatter.ok(apiVersion, 200, docs);
            //     response.send(200, result);
            // })
            if ((request.headers.accept || '').toString().indexOf("application/xls") < 0) {
                var data = docs;
                var result = resultFormatter.ok(apiVersion, 200, data);
                response.send(200, result);
            } else {
                var data = [];
                for (const doc of docs) {
                    const _data = {
                        "Kode Toko": doc.storagecode,
                        "Nama": doc.storagename,
                        "Barcode": doc.itemcode,
                        "Nama Barang": doc.itemname,
                        "Kuantitas": doc.quantity,
                        "Umur Barang (Hari)": doc.sls
                    }
                    data.push(_data);
                }
                var options = {
                    "Kode Toko": "string",
                    "Nama": "string",
                    "Barcode": "string",
                    "Nama Barang": "string",
                    "Kuantitas": "number",
                    "Umur Barang (Hari)": "number"
                };
                response.xls(`Report Age Stock.xlsx`, data, options);
            }
        })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/:storageId/inventories/:itemId', (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryManager(db, {
            username: 'router'
        });
        
        var storageId = request.params.storageId;
        var itemId = request.params.itemId;

        manager.getByStorageIdAndItemId(storageId, itemId)
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

//new

router.get('/items/:itemId', (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryManager(db, {
            username: 'router'
        });
        
        
        var itemId = request.params.itemId;

        manager.getInventoryByItem(itemId)
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

router.get('/items-summary/:itemcode', (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryManager(db, {
            username: 'router'
        });
        
        
        var itemcode = request.params.itemcode;

        manager.getSumInventoryByItem(itemcode)
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