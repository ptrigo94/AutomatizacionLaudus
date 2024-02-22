const fs = require('fs');

async function combineProducts() {
    // Cargar los archivos JSON
    const ortopediaData = require('./Laudus/Ortopedia.json');
    const necgroupData = require('./Laudus/Necgroup.json');

    // Crear un objeto para mapear SKU a productos
    const skuMap = {};

    // Función para verificar si el SKU tiene uno de los formatos permitidos
    const isValidSKU = sku => /^(\w{2}-){2}\w{3,4}$/.test(sku);

    // Función para verificar si el producto tiene un precio válido
    const isValidProduct = product => product.unitPrice && product.unitPrice !== 0;

    // Iterar sobre los productos de Ortopedia.json y agregar al mapa por SKU
    ortopediaData.forEach(product => {
        if (isValidProduct(product) && isValidSKU(product.sku)) {
            const sku = product.sku;
            if (!skuMap[sku]) {
                skuMap[sku] = { ...product }; // Copia el producto al mapa
                
                skuMap[sku].productId = null; // Elimina productId si existe
            } else {
                // Actualiza los detalles del producto (excepto productId)
                skuMap[sku].unitPrice = product.unitPrice;
                skuMap[sku].unitPriceWithTaxes = product.unitPriceWithTaxes;
                skuMap[sku].description = product.description;
            }
        }
    });

    // Iterar sobre los productos de Necgroup.json y agregar al mapa por SKU
    necgroupData.forEach(producto => {
        if (isValidProduct(producto) && isValidSKU(producto.sku)) {
            const sku = producto.sku;
            if (!skuMap[sku]) {
                skuMap[sku] = { ...producto };
                if (!skuMap[sku].productId) {
                    skuMap[sku].productId = producto.productId; 
                } 
            } else {
                // Actualiza los detalles del producto
                skuMap[sku].productId = producto.productId;
                if (!skuMap[sku].productId) {
                    skuMap[sku].productId = producto.productId; 
                }
            }
             // Verificar si el producto no tiene productId y asignar la información correspondiente
            // if (!skuMap[sku].productId) {
            //     skuMap[sku].productId = product.productId;
            // }
        }
    });

    // Convertir el mapa a un array de productos
    const combinedProducts = Object.values(skuMap);

    // Guardar el resultado en un nuevo archivo JSON
    fs.writeFileSync('./Laudus/CombinedProducts.json', JSON.stringify(combinedProducts, null, 2));

    console.log('Productos combinados y guardados en CombinedProducts.json');
}

module.exports = {
    combineProducts
};
