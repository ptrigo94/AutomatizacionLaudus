require('dotenv').config();
const axios = require('axios');

// Obtener las credenciales de las variables de entorno
const login = process.env.JUMPSELLER_LOGIN;
const authToken = process.env.JUMPSELLER_AUTH_TOKEN;
const baseUrl = process.env.JUMPSELLER_BASE_URL;


//METODOS
async function obtenerProductos() {
    try {
        const response = await axios.get(`${baseUrl}/products.json`, {
            auth: {
                username: login,
                password: authToken
            }
        });
        console.log('Respuesta de la API:', response.data);
    } catch (error) {
        console.error('Error al obtener los productos:', error.message);
    }
}
//obtenerProductos();
//const sku = "AB-CA-0001"
async function obtenerProducto(sku){
    try {
        const response = await axios.get(`${baseUrl}/products/search.json?query=${sku}`, {
            auth: {
                username: login,
                password: authToken
            }
        });
        return (response.data)
    } catch (error) {
        console.error('Error al obtener los productos:', error.message);
    }
}
// obtenerProducto(sku);



// EJEMPLOS PARA ACTUALIZAR
// const productId = 7735475; // Reemplaza 'ID_DEL_PRODUCTO' con el ID del producto que deseas actualizar
// const nuevoPrecio = 4330; // Nuevo precio del producto
// const nuevoStock = 113; // Nuevo stock del producto
async function actualizarPrecioYStock(productId, nuevoPrecio, nuevoStock) {
    try {
        const payload = {
            product: {
                price: nuevoPrecio,
                stock: nuevoStock
            }
        };

        const response = await axios.put(`${baseUrl}/products/${productId}.json`, payload, {
            auth: {
                username: login,
                password: authToken
            }
        });

        console.log('Producto actualizado:', response.data);
       return( response.data);
    } catch (error) {
        console.error('Error al actualizar el producto:', error.message);
    }
}
//actualizarPrecioYStock(productId, nuevoPrecio, nuevoStock);

module.exports = {
    actualizarPrecioYStock, obtenerProducto, obtenerProductos
}