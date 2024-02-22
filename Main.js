const Ortopedia = require("./Ortopedia.js");
const Necgroup = require("./Necgroup.js");
const CombinedProducts = require("./CombinedProducts.js");
const Jumpseller = require("./Jumpseller.js");
const fs = require("fs");
async function main() {
  
  fs.writeFileSync("./Laudus/ProductosNoSincronizados.json", "[]");
  try {
    await Ortopedia.login();
    var token = await Necgroup.login();

    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    await Necgroup.getListaProductos(token);
    // Esperar hasta que los archivos ort y nec tengan contenido

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("Esperando carga de productos");

    await new Promise((resolve) => setTimeout(resolve, 10000));

    await CombinedProducts.combineProducts();
    //console.log('Todas las operaciones completadas con éxito.');

    await new Promise((resolve) => setTimeout(resolve, 5000));
    const procesoOk = await setFinalProduct(token);
    console.log(procesoOk);
  } catch (error) {
    console.error("Ocurrió un error:", error);
  }
}
async function setFinalProduct(token) {
  try {
    const combinedProducts = require("./Laudus/CombinedProducts.json");
    const necgroupData = require("./Laudus/Necgroup.json");
    const productsMap = {};

    console.log(`TOTAL DE PRODUCTOS A ACTUALIZAR: `, combinedProducts.length);
    for (const product of combinedProducts) {
      if (!product.productId) {
        const productFix = necgroupData.find((pr) => pr.sku == product.sku);
        if (productFix) {
          product.productId = productFix.productId;
        }
        console.log("PRODUCTO ARREGLADO: ", product);
        try {
          const productStock = await Necgroup.getStockProductos(
            token,
            product.productId
          );
          console.log(`STOCK PRODUCTO ${product.sku}`, productStock);
          // Buscar el producto correspondiente en combinedProducts
          const matchedProduct = combinedProducts.find(
            (p) => p.productId === product.productId
          );

          // Si se encuentra el producto, agregar el campo de stock
          if (matchedProduct) {
            matchedProduct.stock = productStock.stock;
          }


          const productoJumpseller = await Jumpseller.obtenerProducto(
            matchedProduct.sku
          );

          //console.log(`PRODUCTO JUMPSELLER ${matchedProduct.sku}`, productoJumpseller);
          //console.log(`ID PRODUCTO JUMPSELLER ${matchedProduct.sku}`, productoJumpseller[0].product.id);
          if (productoJumpseller.length > 0) {
            const productoJumpsellerActualizado =
              await Jumpseller.actualizarPrecioYStock(
                productoJumpseller[0].product.id,
                matchedProduct.unitPriceWithTaxes,
                productStock.stock
              );
            console.log(
              `PRODUCTO ACTUALIZADO EN JUMPSELLER ${matchedProduct.sku}`,
              productoJumpsellerActualizado
            );
          }else{
            const sku = product.sku;
            if (!productsMap[sku]) {
                productsMap[sku] = { ...product }; // Copia el producto al mapa
            
            }
            console.log(`PRODUCTO CON SKU ${matchedProduct.sku} NO ENCONTRADO EN JUMPSELLER`);
          }
        } catch (error) {
          console.error(
            `Error fetching stock for product ${product.productId}:`,
            error
          );
        }
      } else {
        try {
          const productStock = await Necgroup.getStockProductos(
            token,
            product.productId
          );
          console.log(`STOCK PRODUCTO ${product.sku}`, productStock);
          // Buscar el producto correspondiente en combinedProducts
          const matchedProduct = combinedProducts.find(
            (p) => p.productId === product.productId
          );

          // Si se encuentra el producto, agregar el campo de stock
          if (matchedProduct) {
            matchedProduct.stock = productStock.stock;
          }

        
          const productoJumpseller = await Jumpseller.obtenerProducto(
            matchedProduct.sku
          );

          //console.log(`PRODUCTO JUMPSELLER ${matchedProduct.sku}`, productoJumpseller);
          //console.log(`ID PRODUCTO JUMPSELLER ${matchedProduct.sku}`, productoJumpseller[0].product.id);

          if (productoJumpseller.length > 0) {
            const productoJumpsellerActualizado =
              await Jumpseller.actualizarPrecioYStock(
                productoJumpseller[0].product.id,
                matchedProduct.unitPriceWithTaxes,
                productStock.stock
              );
            console.log(
              `PRODUCTO ACTUALIZADO EN JUMPSELLER ${matchedProduct.sku}`,
              productoJumpsellerActualizado
            );
          }else{
            const sku = product.sku;
            if (!productsMap[sku]) {
                productsMap[sku] = { ...product }; // Copia el producto al mapa
            
            }
            console.log(`PRODUCTO CON SKU ${matchedProduct.sku} NO ENCONTRADO EN JUMPSELLER`);
            
          }
        } catch (error) {
          console.error(
            `Error fetching stock for product ${product.productId}:`,
            error
          );
        }
      }
    }
    fs.writeFileSync("./Laudus/CombinedProducts.json", "[]");
    fs.writeFileSync("./Laudus/Necgroup.json", "[]");
    fs.writeFileSync("./Laudus/Ortopedia.json", "[]");

    
    const productosSinSku = Object.values(productsMap);
    fs.writeFileSync('./Laudus/ProductosNoSincronizados.json', JSON.stringify(productosSinSku, null, 2));

    return "Productos actualizados exitosamente!";
  } catch (error) {
    return error;
  }
}

main();

module.exports = {
  main
}
